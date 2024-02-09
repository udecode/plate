/* eslint-disable no-restricted-syntax */
import { TDescendant, TOperation } from '@udecode/plate-common';
import isEqual from 'lodash/isEqual.js';

import { slateDiff } from '../../slateDiff';
import { copyWithout } from '../utils/copy-without';

// We try each of the Handler functions listed below until one of them
// matches. When one does, that is used to compute the operations. At
// least one will, since the last one is a fallback that works for any
// input.

// Define a type for handler functions that take two nodes and a path, and return an array of Slate operations or undefined
type Handler = (
  node: TDescendant,
  nextNode: TDescendant,
  path: number[]
) => TOperation[] | undefined;

// Initialize an array to hold different transformation strategies
const STRATEGIES: Handler[] = [];

/*
Common special case -- only the children change:

If we have two blocks and only the children change,
we recursively call our top level diff algorithm on
those children. */
// Strategy for when only the children of nodes change
STRATEGIES.push(
  (node, nextNode, path) => {
    // Check if both nodes have children and their properties except 'children' are equal
    if (
      node['children'] != null &&
      nextNode['children'] != null &&
      isEqual(
        copyWithout(node, ['children']),
        copyWithout(nextNode, ['children'])
      )
    ) {
      // If only children have changed, recursively apply the diff algorithm to the children
      return slateDiff(
        node['children'] as TDescendant[],
        nextNode['children'] as TDescendant[],
        path
      );
    }
    return [];
  },
  (node, nextNode, path) => {
    const properties: any = {};
    const newProperties: any = {};

    // Loop through all properties of the original node
    for (const key in node) {
      if (!isEqual(node[key], nextNode[key])) {
        if (key === 'children' || key === 'text') return; // can't do via set_node
        properties[key] = node[key];
        newProperties[key] = nextNode[key];
      }
    }
    // Loop through properties of the next node to find new properties not present in the original node
    for (const key in nextNode) {
      if (node[key] === undefined) {
        if (key === 'children' || key === 'text') return; // can't do via set_node
        newProperties[key] = nextNode[key];
      }
    }

    // Return an operation to set the node with new properties if there are changes other than 'children' and 'text'
    return [
      {
        type: 'set_node',
        path,
        properties,
        newProperties,
      },
    ];
  },
  (node, nextNode, path) => {
    // const { text, children, ...properties } = node;

    // If no specific strategy applies, remove the original node and insert the new node
    return [
      {
        type: 'remove_node',
        path,
        node,
      },
      {
        type: 'insert_node',
        path,
        node: nextNode,
      },
    ];
  }
);

// Replace node at path by nextNode using the first strategy that works.
export function transformDiffNodes(
  node: TDescendant,
  nextNode: TDescendant,
  path: number[]
): TOperation[] {
  // Try each strategy in turn
  for (const strategy of STRATEGIES) {
    // Attempt to generate operations with the current strategy
    const ops = strategy(node, nextNode, path);

    if (ops && ops.length > 0) {
      // Return the operations if the strategy succeeds
      return ops;
    }
  }
  // If no strategy succeeds, throw an error (should never happen because of the fallback strategy)
  throw new Error('BUG');
}
