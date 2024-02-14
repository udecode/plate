/**
 * This Apache-2.0 licensed file has been modified by Udecode and other
 * contributors. See /packages/diff/LICENSE for more information.
 */

import { isText, TDescendant } from '@udecode/plate-common';
import isEqual from 'lodash/isEqual.js';

import { ComputeDiffOptions } from '../../computeDiff';
import { transformDiffNodes } from '../transforms/transformDiffNodes';
import { transformDiffTexts } from '../transforms/transformDiffTexts';
import { copyWithout } from '../utils/copy-without';
import { diffNodes, NodeRelatedItem } from '../utils/diff-nodes';
import { StringCharMapping } from '../utils/string-char-mapping';

export interface TransformDiffDescendantsOptions extends ComputeDiffOptions {
  stringCharMapping: StringCharMapping;
}

export function transformDiffDescendants(
  diff: {
    // op: -1 = delete, 0 = leave unchanged, 1 = insert
    0: number;
    // value of the diff chunk
    1: string;
  }[],
  { stringCharMapping, ...options }: TransformDiffDescendantsOptions
): TDescendant[] {
  const { isInline, ignoreProps, getInsertProps, getDeleteProps } = options;

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
        ...getDeleteProps(node),
      }))
    );

  const areNodeListsEquivalent = (
    nodes0: TDescendant[],
    nodes1: TDescendant[]
  ): boolean => {
    const excludeIgnoreProps = (node: TDescendant) =>
      copyWithout(node, ignoreProps || []);
    const nodesWithoutIgnore0 = nodes0.map(excludeIgnoreProps);
    const nodesWithoutIgnore1 = nodes1.map(excludeIgnoreProps);
    return isEqual(nodesWithoutIgnore0, nodesWithoutIgnore1);
  };

  const isInlineList = (nodes: TDescendant[]) =>
    nodes.every((node) => isText(node) || isInline(node));

  while (i < diff.length) {
    const chunk = diff[i];
    const op = chunk[0]; //
    const val = chunk[1];

    // Convert the string value to document nodes based on the stringCharMapping
    const nodes = stringCharMapping.stringToNodes(val);

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
        const nextNodes = stringCharMapping.stringToNodes(nextVal);

        /**
         * If the node lists are identical when ignored props are excluded,
         * just return nextNodes.
         */
        if (areNodeListsEquivalent(nodes, nextNodes)) {
          children.push(...nextNodes);
          // Consume two diff chunks (delete and insert)
          i += 2;
          continue;
        }

        // If both current and next chunks are text nodes, use transformTextNodes
        if (isInlineList(nodes) && isInlineList(nextNodes)) {
          children.push(...transformDiffTexts(nodes, nextNodes, options));
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
              ...transformDiffNodes(item.originNode, item.relatedNode, options)
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
      'transformDiffDescendants: Missing continue statement or unhandled operation'
    );
  }

  return children;
}
