import { isTextList, TOperation, TPath } from '@udecode/plate-common';

import { transformDiffNodes } from '../transforms/transformDiffNodes';
import { transformDiffTexts } from '../transforms/transformDiffTexts';
import { diffNodes, NodeRelatedItem } from './diff-nodes';
import { StringCharMapping } from './string-char-mapping';
import { stringToNodes } from './string-to-nodes';

export function generateOperations(
  diff: {
    // op: -1 = delete, 0 = leave unchanged, 1 = insert
    0: number;
    // value of the diff chunk
    1: string;
  }[],
  path: TPath,
  stringCharMapping: StringCharMapping
) {
  // Current index in the document
  let index = 0;
  // Current index in the diff array
  let i = 0;
  const operations: TOperation[] = [];

  while (i < diff.length) {
    const chunk = diff[i];
    const op = chunk[0]; //
    const val = chunk[1];

    // If operation code is 0, it means the chunk is unchanged
    if (op === 0) {
      // Skip over unchanged text by advancing the index
      index += val.length;
      // Move to the next diff chunk
      i += 1;
      continue;
    }

    // Convert the string value to document nodes based on the stringCharMapping
    const nodes = stringToNodes(val, stringCharMapping);

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
          for (const textOp of transformDiffTexts(
            nodes,
            nextNodes,
            path.concat([index])
          )) {
            // Add operations from transforming text nodes
            operations.push(textOp);
          }
          // Advance the index by the length of the next nodes
          index += nextNodes.length;
          // Consume two diff chunks (delete and insert)
          i += 2;
          continue;
        }

        // If not all nodes are text nodes, use diffNodes to generate operations
        const diffResult = diffNodes(nodes, nextNodes);
        diffResult.forEach((item: NodeRelatedItem) => {
          if (item.delete) {
            operations.push({
              type: 'remove_node',
              path: path.concat([index]),
              node: item.originNode,
            } as TOperation);
          }
          if (item.insert) {
            operations.push({
              type: 'insert_node',
              path: path.concat([index]),
              node: item.originNode,
            } as TOperation);
            // Adjust index for each inserted node
            index += 1;
          }
          if (item.relatedNode) {
            operations.push(
              ...transformDiffNodes(
                item.originNode,
                item.relatedNode,
                path.concat([index])
              )
            );
            index += 1;
          }
        });
        i += 2; // this consumed two entries from the diff array.
        continue;
      } else {
        // Plain delete of some nodes (with no insert immediately after)
        for (const node of nodes) {
          operations.push({
            type: 'remove_node',
            path: path.concat([index]),
            node,
          } as TOperation);
        }
        i += 1; // consumes only one entry from diff array.
        continue;
      }
    }
    if (op === 1) {
      // insert new nodes.
      for (const node of nodes) {
        operations.push({
          type: 'insert_node',
          path: path.concat([index]),
          node,
        });
        index += 1;
      }
      i += 1;
      continue;
    }
    throw new Error('BUG');
  }

  return operations;
}
