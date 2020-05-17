import { isAncestor } from 'common/queries';
import { merge } from 'lodash';
import { Descendant, Node } from 'slate';

export interface QueryProps {
  // Filter the nodes that will receive the properties
  filter?: (node: Node) => boolean;
  // List of types that will have an id. If empty or undefined - allow all.
  allow?: string[];
  // List of types that will not have an id.
  exclude?: string[];
}

/**
 * Recursively set properties to children nodes
 */
export const setPropsToNodes = (
  node: Node,
  // Value or factory
  props: Record<string, any> | (() => Record<string, any>),
  { filter = () => true, allow = [], exclude = [] }: QueryProps = {}
) => {
  let filterAllow: typeof filter = () => true;
  if (allow.length) {
    filterAllow = (n) => allow.includes(n.type as string);
  }

  let filterExclude: typeof filter = () => true;
  if (exclude.length) {
    filterExclude = (n) => !exclude.includes(n.type as string);
  }

  if (filter(node) && filterAllow(node) && filterExclude(node)) {
    if (props instanceof Function) {
      merge(node, props());
    } else {
      merge(node, props);
    }
  }

  if (!isAncestor(node)) return;

  node.children.forEach((child: Descendant) => {
    setPropsToNodes(child, props, { filter, allow, exclude });
  });
};
