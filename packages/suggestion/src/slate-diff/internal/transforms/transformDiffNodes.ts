/* eslint-disable no-restricted-syntax */
import { PlateEditor, TDescendant, Value } from '@udecode/plate-common';
import isEqual from 'lodash/isEqual.js';

import { diffToSuggestions, DiffToSuggestionsOptions } from '../../slateDiff';
import { copyWithout } from '../utils/copy-without';

/**
 * We try each of the Handler functions listed below until one of them
 * matches. When one does, that is used to compute the operations. At
 * least one will, since the last one is a fallback that works for any
 * input.
 */

type Handler = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  node: TDescendant,
  nextNode: TDescendant,
  options: Required<DiffToSuggestionsOptions>
) => TDescendant[] | false;

/**
 * Only the children have changed. Recursively call the top-level diff
 * algorithm on the children.
 */
const childrenOnlyStrategy: Handler = (editor, node, nextNode, options) => {
  if (
    node['children'] != null &&
    nextNode['children'] != null &&
    isEqual(
      copyWithout(node, ['children']),
      copyWithout(nextNode, ['children'])
    )
  ) {
    const children = diffToSuggestions(
      editor as any,
      node['children'] as TDescendant[],
      nextNode['children'] as TDescendant[],
      options
    );
    return [
      {
        ...node,
        children,
      },
    ];
  }
  return false;
};

// Only the props have changed. Return the node with the props updated.
const propsOnlyStrategy: Handler = (
  _editor,
  node,
  nextNode,
  { getUpdateProps }
) => {
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

// No other strategy applies, so remove and insert the node.
const fallbackStrategy: Handler = (
  _editor,
  node,
  nextNode,
  { getInsertProps, getRemoveProps }
) => {
  return [
    {
      ...node,
      ...getRemoveProps(node),
    },
    {
      ...nextNode,
      ...getInsertProps(nextNode),
    },
  ];
};

const strategies: Handler[] = [
  childrenOnlyStrategy,
  propsOnlyStrategy,
  fallbackStrategy,
];

export interface TransformDiffNodesOptions {}

// Replace node at path by nextNode using the first strategy that works.
export function transformDiffNodes<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  node: TDescendant,
  nextNode: TDescendant,
  options: Required<DiffToSuggestionsOptions>
): TDescendant[] {
  // Try each strategy in turn
  for (const strategy of strategies) {
    // Attempt to generate operations with the current strategy and return the operations if the strategy succeeds
    const ops = strategy(editor as any, node, nextNode, options);
    if (ops) {
      return ops;
    }
  }
  // If no strategy succeeds, throw an error (should never happen because of the fallback strategy)
  throw new Error('transformDiffNodes: No strategy succeeded');
}
