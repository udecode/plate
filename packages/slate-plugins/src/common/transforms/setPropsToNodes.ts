import { merge } from 'lodash';
import { Descendant, Node, NodeEntry } from 'slate';
import { isAncestor, isNodeType } from '../queries';
import { QueryOptions } from '../types';

/**
 * Recursively set properties to children nodes
 */
export const setPropsToNodes = (
  node: Node,
  // Value or factory
  props: Record<string, any> | (() => Record<string, any>),
  query?: QueryOptions
) => {
  const entry: NodeEntry<Node> = [node, []];

  if (isNodeType(entry, query)) {
    if (props instanceof Function) {
      merge(node, props());
    } else {
      merge(node, props);
    }
  }

  if (!isAncestor(node)) return;

  node.children.forEach((child: Descendant) => {
    setPropsToNodes(child, props, query);
  });
};
