import { type Element, PLUGINS } from '../../../core';
import { failInvariant } from '../../internal/failInvariant';
import { setMarkdownStructureKeys } from '../internal/markdownMappings';
import type { MdList, MdListItem } from '../mdast';
import type { SerializeMdContext } from '../types';
import {
  convertNodesSerialize,
  encodeMdastNode,
} from './convertNodesSerialize';
import { isMdFlowContent, isMdPhrasingContent } from './mdastContent';
import { reportOmittedProperties } from './reportOmittedProperties';

// List topology Markdown writes through list structure, never tag attributes.
const LIST_KEYS: ReadonlySet<string> = new Set([
  'checked',
  'indent',
  'listRestart',
  'listStart',
  'listStyle',
  'listType',
]);

type SerializableListElement = Element & {
  checked?: boolean;
  indent?: number;
  listRestart?: number;
  listStart?: number;
  listStyle?: string;
  listType: string;
};

export const getSerializableListStyle = (
  node: Pick<SerializableListElement, 'listStyle' | 'listType'>
) =>
  (node.listType === 'numbered' && node.listStyle === 'decimal') ||
  (node.listType === 'bulleted' && node.listStyle === 'disc')
    ? undefined
    : node.listStyle;

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
  if (task && paragraph) represented.add('checked');
  if ((node.indent ?? 1) === depth + 1) represented.add('indent');
  if (getSerializableListStyle(node) === undefined) {
    represented.add('listStyle');
  }
  // The first item of an ordered list writes its number as the list start.
  if (first && list.ordered) {
    if (node.listRestart !== undefined) represented.add('listRestart');
    if (node.listRestart === undefined || node.listRestart === node.listStart) {
      represented.add('listStart');
    }
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

  // Normal list processing
  const root: MdList = {
    children: [],
    ordered: nodes[0].listType === 'numbered',
    spread: options.spread ?? false,
    start: nodes[0].listRestart ?? nodes[0].listStart,
    type: 'list',
  };

  // Stack to track parent nodes at different indentation levels
  const indentStack: Array<{
    depth: number;
    indent: number;
    list: MdList;
    parent: MdListItem | null;
    listStyle: SerializableListElement['listStyle'];
    listType: SerializableListElement['listType'];
  }> = [
    {
      depth: 0,
      indent: nodes[0].indent ?? 1,
      list: root,
      parent: null,
      listStyle: getSerializableListStyle(nodes[0]),
      listType: nodes[0].listType,
    },
  ];

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
    const hasSameIndentBoundary =
      stackTop.indent === currentIndent &&
      (stackTop.listType !== node.listType ||
        stackTop.listStyle !== getSerializableListStyle(node) ||
        hasExplicitRestart) &&
      !!stackTop.parent;

    if (hasSameIndentBoundary) {
      // Split sibling list when style switches at same indent
      const siblingList: MdList = {
        children: [],
        ordered: node.listType === 'numbered',
        spread: options.spread ?? false,
        start: node.listRestart ?? node.listStart,
        type: 'list',
      };

      // Attach sibling list under the same parent item
      (
        stackTop.parent ?? failInvariant('Expected value to be defined')
      ).children.push(siblingList);

      indentStack[indentStack.length - 1] = {
        depth: stackTop.depth,
        indent: currentIndent,
        list: siblingList,
        parent: stackTop.parent,
        listStyle: getSerializableListStyle(node),
        listType: node.listType,
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
      content = [
        {
          children: convertNodesSerialize(node.children, options).filter(
            isMdPhrasingContent
          ),
          type: 'paragraph',
        },
      ];
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

    // Check if the next node has a higher indentation level
    const nextNode = nodes[i + 1];
    if (nextNode && (nextNode.indent ?? 1) > currentIndent) {
      // Create a new nested list for the next indentation level
      const nestedList: MdList = {
        children: [],
        ordered: nextNode.listType === 'numbered',
        spread: options.spread ?? false,
        start: nextNode.listRestart ?? nextNode.listStart,
        type: 'list',
      };

      // Add the nested list to the current list item
      listItem.children.push(nestedList);

      // Push the new indentation level to the stack
      indentStack.push({
        depth: stackTop.depth + 1,
        indent: nextNode.indent ?? 1,
        list: nestedList,
        parent: listItem,
        listStyle: getSerializableListStyle(nextNode),
        listType: nextNode.listType,
      });
    }
  }

  return root;
};
