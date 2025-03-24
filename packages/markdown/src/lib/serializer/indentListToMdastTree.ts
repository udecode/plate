import type { SlateEditor, TElement } from '@udecode/plate';

import type { mdast } from './types';

import { convertNodes } from './convertNodes';

type TIndentList = TElement & {
  checked: boolean;
  indent: number;
  listStart: number;
  // TODO:
  listStyleType: string;
};

export function indentListToMdastTree(
  nodes: TIndentList[],
  editor: SlateEditor
): mdast.List {
  if (nodes.length === 0) {
    throw new Error('Cannot create a list from empty nodes');
  }

  const root: mdast.List = {
    children: [],
    ordered: nodes[0].listStyleType === 'decimal',
    start: nodes[0].listStart,
    type: 'list',
  };

  // Stack to track parent nodes at different indentation levels
  const indentStack: {
    indent: number;
    list: mdast.List;
    parent: mdast.ListItem | null;
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
    const listItem: mdast.ListItem = {
      checked: null,
      children: [
        {
          children: convertNodes(
            node.children,
            editor
          ) as mdast.Paragraph['children'],
          type: 'paragraph',
        },
      ],
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
      const nestedList: mdast.List = {
        children: [],
        ordered: nextNode.listStyleType === 'decimal',
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
