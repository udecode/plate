import type { ListElement } from '@platejs/list';

import type { MdList, MdListItem, MdRootContent } from '../mdast';
import type { SerializeMdContext } from '../types';

import { convertNodesSerialize } from './convertNodesSerialize';
import { wrapWithBlockId } from './wrapWithBlockId';
import { isMdPhrasingContent } from './wrapWithBlockId';

export type MdListFragment = {
  children: MdRootContent[];
  type: 'fragment';
};

export function listToMdastTree(
  nodes: readonly ListElement[],
  options: SerializeMdContext,
  isBlock?: false
): MdList;
export function listToMdastTree(
  nodes: readonly ListElement[],
  options: SerializeMdContext,
  isBlock: true
): MdList | MdListFragment;
export function listToMdastTree(
  nodes: readonly ListElement[],
  options: SerializeMdContext,
  isBlock?: boolean
): MdList | MdListFragment;
export function listToMdastTree(
  nodes: readonly ListElement[],
  options: SerializeMdContext,
  isBlock = false
): MdList | MdListFragment {
  if (nodes.length === 0) {
    throw new Error('Cannot create a list from empty nodes');
  }

  if (
    options.withBlockId &&
    isBlock &&
    nodes.some((node) => options.blockId?.(node))
  ) {
    return processListWithBlockIds(nodes, options);
  }

  // Normal list processing
  const root: MdList = {
    children: [],
    ordered: nodes[0].listStyleType === 'decimal',
    spread: options.spread ?? false,
    start: nodes[0].listStart,
    type: 'list',
  };

  // Stack to track parent nodes at different indentation levels
  const indentStack: {
    indent: number;
    list: MdList;
    parent: MdListItem | null;
    styleType: ListElement['listStyleType'];
  }[] = [
    {
      indent: nodes[0].indent,
      list: root,
      parent: null,
      styleType: nodes[0].listStyleType,
    },
  ];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const currentIndent = node.indent;

    // Find the appropriate parent list for the current indentation level
    while (
      indentStack.length > 1 &&
      indentStack.at(-1)!.indent > currentIndent
    ) {
      indentStack.pop();
    }

    let stackTop = indentStack.at(-1);
    if (!stackTop) {
      throw new Error('Stack should never be empty');
    }

    const hasSameIndentStyleChange =
      stackTop.indent === currentIndent &&
      stackTop.styleType !== node.listStyleType &&
      !!stackTop.parent;

    if (hasSameIndentStyleChange) {
      // Split sibling list when style switches at same indent
      const siblingList: MdList = {
        children: [],
        ordered: node.listStyleType === 'decimal',
        spread: options.spread ?? false,
        start: node.listStart,
        type: 'list',
      };

      // Attach sibling list under the same parent item
      stackTop.parent!.children.push(siblingList);

      indentStack[indentStack.length - 1] = {
        indent: currentIndent,
        list: siblingList,
        parent: stackTop.parent,
        styleType: node.listStyleType,
      };

      stackTop = indentStack.at(-1)!;
    }

    // Create the current list item
    const listItem: MdListItem = {
      checked: null,
      children: [
        {
          children: convertNodesSerialize(node.children, options).filter(
            isMdPhrasingContent
          ),
          type: 'paragraph',
        },
      ],
      spread: options.spread ?? false,
      type: 'listItem',
    };

    // Add checked property for todo lists
    if (node.listStyleType === 'todo' && node.checked !== undefined) {
      listItem.checked = node.checked;
    }

    // Add the list item to the appropriate parent list
    stackTop.list.children.push(listItem);

    // Check if the next node has a higher indentation level
    const nextNode = nodes[i + 1];
    if (nextNode && nextNode.indent > currentIndent) {
      // Create a new nested list for the next indentation level
      const nestedList: MdList = {
        children: [],
        ordered: nextNode.listStyleType === 'decimal',
        spread: options.spread ?? false,
        start: nextNode.listStart,
        type: 'list',
      };

      // Add the nested list to the current list item
      listItem.children.push(nestedList);

      // Push the new indentation level to the stack
      indentStack.push({
        indent: nextNode.indent,
        list: nestedList,
        parent: listItem,
        styleType: nextNode.listStyleType,
      });
    }
  }

  return root;
}

/**
 * Process list nodes with block IDs by wrapping each item separately This
 * preserves list numbering while allowing individual block wrapping
 */
function processListWithBlockIds(
  nodes: readonly ListElement[],
  options: SerializeMdContext
): MdListFragment {
  const fragments: MdRootContent[] = [];

  // Process each node individually
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    // Create a single-item list for this node
    const singleList: MdList = {
      children: [],
      ordered: node.listStyleType === 'decimal',
      spread: options.spread ?? false,
      // For ordered lists, preserve the correct number
      start: node.listStyleType === 'decimal' ? i + 1 : undefined,
      type: 'list',
    };

    // Create the list item
    const listItem: MdListItem = {
      checked: null,
      children: [
        {
          children: convertNodesSerialize(node.children, options).filter(
            isMdPhrasingContent
          ),
          type: 'paragraph',
        },
      ],
      spread: options.spread ?? false,
      type: 'listItem',
    };

    // Add checked property for todo lists
    if (node.listStyleType === 'todo' && node.checked !== undefined) {
      listItem.checked = node.checked;
    }

    singleList.children.push(listItem);

    const blockId = options.blockId?.(node);

    if (blockId) {
      fragments.push(wrapWithBlockId(singleList, blockId));
    } else {
      fragments.push(singleList);
    }
  }

  // Return a fragment containing all wrapped lists
  return {
    children: fragments,
    type: 'fragment',
  };
}
