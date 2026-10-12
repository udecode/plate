import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';

import { type Element, PLUGINS } from '../../../core';
import { getDocumentListOrdinal } from '../../../features/list/lib/listIndex.internal';
import { failInvariant } from '../../internal/failInvariant';
import { encodeMarkdownParagraph } from '../internal/markdownIntrinsics';
import { setMarkdownStructureKeys } from '../internal/markdownMappings';
import type { MdList, MdListItem } from '../mdast';
import type { SerializeMdContext } from '../types';
import { encodeMdastNode } from './convertNodesSerialize';
import { isMdFlowContent, isMdPhrasingContent } from './mdastContent';
import { reportOmittedProperties } from './reportOmittedProperties';

// List topology Markdown writes through list structure, never tag attributes.
const LIST_KEYS: ReadonlySet<string> = new Set([
  'checked',
  'indent',
  'listId',
  'listLevels',
  'listRestart',
  'listStart',
  'listStyle',
  'listType',
]);

type SerializableListElement = Element & {
  checked?: boolean;
  indent?: number;
  listId?: string;
  listRestart?: number;
  listStart?: number;
  listStyle?: string;
  listType: string;
};

// CommonMark reads at most nine digits in an ordered list marker.
const MAX_LIST_MARKER = 999_999_999;

type ListAudit = {
  countsAs: Map<MdList, MdList>;
  firstItems: Map<MdList, SerializableListElement>;
  items: Array<
    Readonly<{ id: string; list: MdList; node: SerializableListElement }>
  >;
};

const listAudits = new WeakMap<object, ListAudit>();

const getListAudit = (options: SerializeMdContext) => {
  let audit = listAudits.get(options.operation);

  if (!audit) {
    audit = { countsAs: new Map(), firstItems: new Map(), items: [] };
    listAudits.set(options.operation, audit);
  }

  return audit;
};

const reportListLoss = (
  options: SerializeMdContext,
  node: SerializableListElement,
  key: string,
  message: string
) =>
  options.report({
    code: 'markdown-property-omitted',
    key,
    message,
    model: options.modelLocation(node),
    owner: 'list',
    phase: 'serialize',
    reason: 'unsupported',
    severity: 'warning',
  });

export const continueMarkdownList = (
  options: SerializeMdContext,
  list: MdList,
  previous: MdList
) => {
  getListAudit(options).countsAs.set(list, previous);
};

export const finishMarkdownLists = (
  tree: Root,
  options: SerializeMdContext
) => {
  const audit = listAudits.get(options.operation);

  if (!audit) return;

  visit(tree, 'list', (list) => {
    const node = audit.firstItems.get(list);

    if (
      !node ||
      list.start == null ||
      (list.start >= 0 &&
        list.start + list.children.length - 1 <= MAX_LIST_MARKER)
    ) {
      return;
    }
    reportListLoss(
      options,
      node,
      'listStart',
      `Markdown cannot number a list from ${list.start}; it was written from 1.`
    );
    list.start = undefined;
  });

  const countedList = (list: MdList) => {
    const chain: MdList[] = [];
    let counted = list;

    for (
      let previous = audit.countsAs.get(counted);
      previous;
      previous = audit.countsAs.get(counted)
    ) {
      chain.push(counted);
      counted = previous;
    }
    for (const member of chain) audit.countsAs.set(member, counted);

    return counted;
  };
  const listsById = new Map<
    string,
    { lists: Set<MdList>; node: SerializableListElement }
  >();
  const idsByList = new Map<MdList, Map<string, SerializableListElement>>();

  for (const { id, list, node } of audit.items) {
    const read = countedList(list);
    const source = listsById.get(id) ?? { lists: new Set(), node };
    const ids = idsByList.get(read) ?? new Map();

    source.lists.add(read);
    listsById.set(id, source);
    if (!ids.has(id)) ids.set(id, node);
    idsByList.set(read, ids);
  }
  for (const [id, { lists, node }] of listsById) {
    if (lists.size > 1) {
      reportListLoss(
        options,
        node,
        'listId',
        `Markdown cannot keep list "${id}" as one list; it reads back as ${lists.size} lists.`
      );
    }
  }
  for (const ids of idsByList.values()) {
    if (ids.size > 1) {
      reportListLoss(
        options,
        [...ids.values()][1],
        'listId',
        `Markdown cannot keep ${ids.size} lists apart; they read back as one list.`
      );
    }
  }
};

// An ordered Markdown list starts at the number its first item shows, so a
// list split by other blocks or interleaved with another keeps its numbers.
const getListStart = (
  node: SerializableListElement,
  options: SerializeMdContext
) => {
  if (node.listType !== 'numbered') return undefined;

  const start =
    getDocumentListOrdinal(
      options.document,
      options.modelLocation(node)?.root ?? 'main',
      node
    ) ??
    node.listRestart ??
    node.listStart;

  return start === 1 ? undefined : start;
};

export const getSerializableListStyle = (
  node: Pick<SerializableListElement, 'listStyle' | 'listType'>
) =>
  (node.listType === 'numbered' && node.listStyle === 'decimal') ||
  (node.listType === 'bulleted' && node.listStyle === 'disc')
    ? undefined
    : node.listStyle;

export const isSameMarkdownList = (
  a: Pick<SerializableListElement, 'listId' | 'listStyle' | 'listType'>,
  b: Pick<SerializableListElement, 'listId' | 'listStyle' | 'listType'>
) =>
  a.listId === b.listId &&
  (a.listType === 'numbered') === (b.listType === 'numbered') &&
  getSerializableListStyle(a) === getSerializableListStyle(b);

/**
 * The list properties Markdown carries for an item at `depth` that is (or is
 * not) the first item of its Markdown list. A task checkbox needs paragraph
 * content. Anything else is reported.
 */
const representedListProperties = (
  node: SerializableListElement,
  list: MdList,
  depth: number,
  paragraph: boolean
) => {
  const represented = new Set<string>();
  const first = list.children.length === 0;
  const task = node.listType === 'task';

  if (!task || (paragraph && typeof node.checked === 'boolean')) {
    represented.add('listType');
  }
  // Markdown groups an item with its list; the id itself is not written.
  represented.add('listId');
  if (task && paragraph) represented.add('checked');
  if ((node.indent ?? 1) === depth + 1) represented.add('indent');
  if (getSerializableListStyle(node) === undefined) {
    represented.add('listStyle');
  }
  if (first && list.ordered && node.listStart === (list.start ?? 1)) {
    represented.add('listStart');
  }

  return represented;
};

export const listToMdastTree = (
  nodes: readonly SerializableListElement[],
  options: SerializeMdContext
): MdList => {
  if (nodes.length === 0) {
    throw new Error('Cannot create a list from empty nodes');
  }

  const paragraphType = options.registry.type(PLUGINS.paragraph) ?? 'paragraph';
  const audit = getListAudit(options);

  // Normal list processing
  const root: MdList = {
    children: [],
    ordered: nodes[0].listType === 'numbered',
    spread: options.spread ?? false,
    start: getListStart(nodes[0], options),
    type: 'list',
  };

  // Stack to track parent nodes at different indentation levels
  const indentStack: Array<{
    depth: number;
    indent: number;
    list: MdList;
    parent: MdListItem | null;
    item: SerializableListElement;
  }> = [
    {
      depth: 0,
      indent: nodes[0].indent ?? 1,
      item: nodes[0],
      list: root,
      parent: null,
    },
  ];

  audit.firstItems.set(root, nodes[0]);

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const currentIndent = node.indent ?? 1;

    // Find the appropriate parent list for the current indentation level
    while (
      indentStack.length > 1 &&
      (indentStack.at(-1) ?? failInvariant('Expected value to be defined'))
        .indent > currentIndent
    ) {
      indentStack.pop();
    }

    let stackTop = indentStack.at(-1);
    if (!stackTop) {
      throw new Error('Stack should never be empty');
    }

    const hasExplicitRestart =
      node.listType === 'numbered' &&
      typeof node.listRestart === 'number' &&
      stackTop.list.children.length > 0;
    const isOtherList = !isSameMarkdownList(stackTop.item, node);
    const hasSameIndentBoundary =
      stackTop.indent === currentIndent &&
      (isOtherList || hasExplicitRestart) &&
      !!stackTop.parent;

    if (hasSameIndentBoundary) {
      const siblingList: MdList = {
        children: [],
        ordered: node.listType === 'numbered',
        spread: options.spread ?? false,
        start: getListStart(node, options),
        type: 'list',
      };

      // Attach sibling list under the same parent item
      (
        stackTop.parent ?? failInvariant('Expected value to be defined')
      ).children.push(siblingList);
      audit.firstItems.set(siblingList, node);
      if (!isOtherList) audit.countsAs.set(siblingList, stackTop.list);

      indentStack[indentStack.length - 1] = {
        depth: stackTop.depth,
        indent: currentIndent,
        item: node,
        list: siblingList,
        parent: stackTop.parent,
      };

      stackTop =
        indentStack.at(-1) ?? failInvariant('Expected value to be defined');
    }

    let content: MdListItem['children'];

    if (node.type === paragraphType) {
      reportOmittedProperties(
        node,
        representedListProperties(node, stackTop.list, stackTop.depth, true),
        options,
        'list'
      );
      content = [encodeMarkdownParagraph(node, options)];
    } else {
      // Another block is the item's content; both owners' claims count.
      setMarkdownStructureKeys(options, node, LIST_KEYS);
      const encoded = encodeMdastNode(node, options);

      content = !encoded
        ? []
        : isMdFlowContent(encoded.node)
          ? [encoded.node]
          : isMdPhrasingContent(encoded.node)
            ? [{ children: [encoded.node], type: 'paragraph' }]
            : [];
      if (encoded) {
        reportOmittedProperties(
          node,
          new Set([
            ...encoded.claimed,
            ...representedListProperties(
              node,
              stackTop.list,
              stackTop.depth,
              content[0]?.type === 'paragraph'
            ),
          ]),
          options,
          encoded.owner
        );
      }
    }

    // Create the current list item
    const listItem: MdListItem = {
      checked: null,
      children: content,
      spread: options.spread ?? false,
      type: 'listItem',
    };

    // Add checked property for todo lists
    if (
      node.listType === 'task' &&
      node.checked !== undefined &&
      content[0]?.type === 'paragraph'
    ) {
      listItem.checked = node.checked;
    }

    // Add the list item to the appropriate parent list
    stackTop.list.children.push(listItem);
    if (typeof node.listId === 'string') {
      audit.items.push({ id: node.listId, list: stackTop.list, node });
    }

    // Check if the next node has a higher indentation level
    const nextNode = nodes[i + 1];
    if (nextNode && (nextNode.indent ?? 1) > currentIndent) {
      // Create a new nested list for the next indentation level
      const nestedList: MdList = {
        children: [],
        ordered: nextNode.listType === 'numbered',
        spread: options.spread ?? false,
        start: getListStart(nextNode, options),
        type: 'list',
      };

      listItem.children.push(nestedList);
      audit.firstItems.set(nestedList, nextNode);
      audit.countsAs.set(nestedList, stackTop.list);

      indentStack.push({
        depth: stackTop.depth + 1,
        indent: nextNode.indent ?? 1,
        item: nextNode,
        list: nestedList,
        parent: listItem,
      });
    }
  }

  return root;
};
