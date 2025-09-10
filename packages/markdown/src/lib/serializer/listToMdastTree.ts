import type { TListElement } from 'platejs';

import type { MdList, MdListItem, MdParagraph } from '../mdast';
import type { SerializeMdOptions } from './serializeMd';

import { convertNodesSerialize } from './convertNodesSerialize';
import { wrapWithBlockId } from './wrapWithBlockId';

export function listToMdastTree(
  nodes: TListElement[],
  options: SerializeMdOptions,
  isBlock = false
): any {
  if (nodes.length === 0) {
    throw new Error('Cannot create a list from empty nodes');
  }

  // If withBlockId is enabled, isBlock is true, and any node has an ID,
  // we need to wrap each list item separately
  if (options.withBlockId && isBlock && nodes.some((node) => node.id)) {
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
  }[] = [{ indent: nodes[0].indent, list: root, parent: null }];

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

    const stackTop = indentStack.at(-1);
    if (!stackTop) {
      throw new Error('Stack should never be empty');
    }

    // Create the current list item
    const listItem: MdListItem = {
      checked: null,
      children: [
        {
          children: convertNodesSerialize(
            node.children,
            options
          ) as MdParagraph['children'],
          type: 'paragraph',
        },
      ],
      type: 'listItem',
    } as any;

    // Add spread property to list items when spread is true
    if (options.spread) {
      (listItem as any).spread = true;
    }

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
  nodes: TListElement[],
  options: SerializeMdOptions
): { children: any[]; type: string } {
  const fragments: any[] = [];

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
          children: convertNodesSerialize(
            node.children,
            options
          ) as MdParagraph['children'],
          type: 'paragraph',
        },
      ],
      type: 'listItem',
    } as any;

    // Add spread property to list items when spread is true
    if (options.spread) {
      (listItem as any).spread = true;
    }

    // Add checked property for todo lists
    if (node.listStyleType === 'todo' && node.checked !== undefined) {
      listItem.checked = node.checked;
    }

    singleList.children.push(listItem);

    // Wrap with block ID if this node has one
    if (node.id) {
      fragments.push(wrapWithBlockId(singleList, String(node.id)));
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
