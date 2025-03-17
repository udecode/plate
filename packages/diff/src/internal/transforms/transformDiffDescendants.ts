/**
 * This Apache-2.0 licensed file has been modified by Udecode and other
 * contributors. See /packages/diff/LICENSE for more information.
 */

import { type Descendant, TextApi } from '@udecode/plate';

import type { ComputeDiffOptions } from '../../lib/computeDiff';
import type { StringCharMapping } from '../utils/string-char-mapping';

import { transformDiffNodes } from '../transforms/transformDiffNodes';
import { transformDiffTexts } from '../transforms/transformDiffTexts';
import { type NodeRelatedItem, diffNodes } from '../utils/diff-nodes';
import { isEqual } from '../utils/is-equal';

export interface TransformDiffDescendantsOptions extends ComputeDiffOptions {
  stringCharMapping: StringCharMapping;
}

const OP_UNCHANGED = 0;
const OP_DELETE = -1;
const OP_INSERT = 1;

type Op = -1 | 0 | 1;

export function transformDiffDescendants(
  diff: [Op, string][],
  { stringCharMapping, ...options }: TransformDiffDescendantsOptions
): Descendant[] {
  const { getDeleteProps, getInsertProps, ignoreProps, isInline } = options;

  // Current index in the diff array
  let i = 0;
  const children: Descendant[] = [];

  let insertBuffer: Descendant[] = [];
  let deleteBuffer: Descendant[] = [];

  const flushBuffers = () => {
    // Return all deletions followed by all insertions
    children.push(...deleteBuffer, ...insertBuffer);
    insertBuffer = [];
    deleteBuffer = [];
  };

  const insertNode = (node: Descendant) =>
    insertBuffer.push({
      ...node,
      ...getInsertProps(node),
    });

  const deleteNode = (node: Descendant) =>
    deleteBuffer.push({
      ...node,
      ...getDeleteProps(node),
    });

  const passThroughNodes = (...nodes: Descendant[]) => {
    flushBuffers();
    children.push(...nodes);
  };

  const isInlineList = (nodes: Descendant[]) =>
    nodes.every((node) => TextApi.isText(node) || isInline(node));

  while (i < diff.length) {
    const chunk = diff[i];
    const op = chunk[0];
    const val = chunk[1];

    // Convert the string value to document nodes based on the stringCharMapping
    const nodes = stringCharMapping.stringToNodes(val);

    switch (op) {
      case OP_UNCHANGED: {
        passThroughNodes(...nodes);
        // Move to the next diff chunk
        i += 1;
        continue;
      }

      case OP_DELETE: {
        // Check if the next chunk is an insertion, indicating a replace operation
        if (i < diff.length - 1 && diff[i + 1][0] === OP_INSERT) {
          // Value of the next chunk (to be inserted)
          const nextVal = diff[i + 1][1];
          // Convert next value to nodes
          const nextNodes = stringCharMapping.stringToNodes(nextVal);

          /**
           * If the node lists are identical when ignored props are excluded,
           * just return nextNodes.
           */
          if (isEqual(nodes, nextNodes, { ignoreDeep: ignoreProps })) {
            passThroughNodes(...nextNodes);
            // Consume two diff chunks (delete and insert)
            i += 2;

            continue;
          }

          // If both current and next chunks are text nodes, use transformTextNodes
          if (isInlineList(nodes) && isInlineList(nextNodes)) {
            passThroughNodes(...transformDiffTexts(nodes, nextNodes, options));
            // Consume two diff chunks (delete and insert)
            i += 2;

            continue;
          }

          // If not all nodes are text nodes, use diffNodes to generate operations
          const diffResult = diffNodes(nodes, nextNodes, options);
          diffResult.forEach((item: NodeRelatedItem) => {
            if (item.delete) {
              deleteNode(item.originNode);
            }
            if (item.insert) {
              insertNode(item.originNode);
            }
            if (item.relatedNode) {
              const diffNodesResult = transformDiffNodes(
                item.originNode,
                item.relatedNode,
                options
              );

              if (diffNodesResult) {
                passThroughNodes(...diffNodesResult);
              } else {
                deleteNode(item.originNode);
                insertNode(item.relatedNode);
              }
            }
          });
          i += 2; // This consumed two entries from the diff array.

          continue;
        } else {
          // Plain delete of some nodes (with no insert immediately after)
          for (const node of nodes) {
            deleteNode(node);
          }

          i += 1; // Consumes only one entry from diff array.

          continue;
        }
      }
      case OP_INSERT: {
        // insert new nodes.
        for (const node of nodes) {
          insertNode(node);
        }

        i += 1;

        continue;
      }
    }
  }

  flushBuffers();

  return children;
}
