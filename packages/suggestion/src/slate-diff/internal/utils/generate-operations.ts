import {
  isTextList,
  PlateEditor,
  TDescendant,
  Value,
} from '@udecode/plate-common';

import { DiffToSuggestionsOptions } from '../../slateDiff';
import { transformDiffNodes } from '../transforms/transformDiffNodes';
import { transformDiffTexts } from '../transforms/transformDiffTexts';
import { diffNodes, NodeRelatedItem } from './diff-nodes';
import { StringCharMapping } from './string-char-mapping';
import { stringToNodes } from './string-to-nodes';

export interface GenerateOperationsOptions
  extends Required<DiffToSuggestionsOptions> {
  stringCharMapping: StringCharMapping;
}

export function generateOperations<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  diff: {
    // op: -1 = delete, 0 = leave unchanged, 1 = insert
    0: number;
    // value of the diff chunk
    1: string;
  }[],
  {
    stringCharMapping,
    getInsertProps,
    getRemoveProps,
    getUpdateProps,
  }: GenerateOperationsOptions
): TDescendant[] {
  // Current index in the diff array
  let i = 0;
  const children: TDescendant[] = [];

  const insertNodes = (...nodes: TDescendant[]) =>
    children.push(
      ...nodes.map((node) => ({
        ...node,
        ...getInsertProps(node),
      }))
    );

  const removeNodes = (...nodes: TDescendant[]) =>
    children.push(
      ...nodes.map((node) => ({
        ...node,
        ...getRemoveProps(node),
      }))
    );

  while (i < diff.length) {
    const chunk = diff[i];
    const op = chunk[0]; //
    const val = chunk[1];

    // Convert the string value to document nodes based on the stringCharMapping
    const nodes = stringToNodes(val, stringCharMapping);

    // If operation code is 0, it means the chunk is unchanged
    if (op === 0) {
      children.push(...nodes);
      // Move to the next diff chunk
      i += 1;
      continue;
    }

    // Handle deletion (-1)
    if (op === -1) {
      // Check if the next chunk is an insertion (1), indicating a replace operation
      if (i < diff.length - 1 && diff[i + 1][0] === 1) {
        // Value of the next chunk (to be inserted)
        const nextVal = diff[i + 1][1];
        // Convert next value to nodes
        const nextNodes = stringToNodes(nextVal, stringCharMapping);

        // If both current and next chunks are text nodes, use transformTextNodes
        if (isTextList(nodes) && isTextList(nextNodes)) {
          children.push(
            ...transformDiffTexts<V, E>(editor, nodes, nextNodes, {
              getInsertProps,
              getRemoveProps,
              getUpdateProps,
            })
          );
          // Consume two diff chunks (delete and insert)
          i += 2;
          continue;
        }

        // If not all nodes are text nodes, use diffNodes to generate operations
        const diffResult = diffNodes(nodes, nextNodes);
        diffResult.forEach((item: NodeRelatedItem) => {
          if (item.delete) {
            removeNodes(item.originNode);
          }
          if (item.insert) {
            insertNodes(item.originNode);
          }
          if (item.relatedNode) {
            children.push(
              ...transformDiffNodes<V, E>(
                editor,
                item.originNode,
                item.relatedNode,
                { getInsertProps, getRemoveProps, getUpdateProps }
              )
            );
          }
        });
        i += 2; // this consumed two entries from the diff array.
        continue;
      } else {
        // Plain delete of some nodes (with no insert immediately after)
        for (const node of nodes) {
          removeNodes(node);
        }
        i += 1; // consumes only one entry from diff array.
        continue;
      }
    }
    if (op === 1) {
      // insert new nodes.
      for (const node of nodes) {
        insertNodes(node);
      }
      i += 1;
      continue;
    }
    throw new Error(
      'generateOperations: Missing continue statement or unhandled operation'
    );
  }

  return children;
}
