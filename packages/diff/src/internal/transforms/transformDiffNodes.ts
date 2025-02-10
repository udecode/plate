/**
 * This Apache-2.0 licensed file has been modified by Udecode and other
 * contributors. See /packages/diff/LICENSE for more information.
 */

import type { Descendant } from '@udecode/plate';

import { type ComputeDiffOptions, computeDiff } from '../../lib/computeDiff';
import { isEqual } from '../utils/is-equal';

/**
 * We try each of the Handler functions listed below until one of them matches.
 * When one does, that is used to compute the operations. At least one will,
 * since the last one is a fallback that works for any input.
 */

type Handler = (
  node: Descendant,
  nextNode: Descendant,
  options: ComputeDiffOptions
) => Descendant[] | false;

/**
 * Only the children have changed. Recursively call the top-level diff algorithm
 * on the children.
 */
const childrenOnlyStrategy: Handler = (node, nextNode, options) => {
  if (
    node.children != null &&
    nextNode.children != null &&
    isEqual(node, nextNode, {
      ignoreDeep: options.ignoreProps,
      ignoreShallow: ['children'],
    })
  ) {
    const children = computeDiff(
      node.children as Descendant[],
      nextNode.children as Descendant[],
      options
    );

    return [
      {
        ...nextNode,
        children,
      },
    ];
  }

  return false;
};

// Only the props have changed. Return the node with the props updated.
const propsOnlyStrategy: Handler = (node, nextNode, { getUpdateProps }) => {
  const properties: any = {};
  const newProperties: any = {};

  // Find properties in the original node that have changed in the new node
  for (const key in node) {
    if (!isEqual(node[key], nextNode[key])) {
      // 'children' and 'text' cannot be updated with set_node
      if (key === 'children' || key === 'text') return false;

      properties[key] = node[key];
      newProperties[key] = nextNode[key];
    }
  }

  // Find new properties not present in the original node
  for (const key in nextNode) {
    if (node[key] === undefined) {
      // 'children' and 'text' cannot be updated with set_node
      if (key === 'children' || key === 'text') return false;

      newProperties[key] = nextNode[key];
    }
  }

  return [
    {
      ...nextNode,
      ...getUpdateProps(node, properties, newProperties),
    },
  ];
};

const strategies: Handler[] = [childrenOnlyStrategy, propsOnlyStrategy];

// Replace node at path by nextNode using the first strategy that works.
export function transformDiffNodes(
  node: Descendant,
  nextNode: Descendant,
  options: ComputeDiffOptions
): Descendant[] | false {
  // Try each strategy in turn
  for (const strategy of strategies) {
    // Attempt to generate operations with the current strategy and return the operations if the strategy succeeds
    const ops = strategy(node, nextNode, options);

    if (ops) {
      return ops;
    }
  }

  // If no strategy succeeds, tell the caller that the nodes are not comparable
  return false;
}
