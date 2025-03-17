/**
 * This Apache-2.0 licensed file has been modified by Udecode and other
 * contributors. See /packages/diff/LICENSE for more information.
 */

import { type Descendant, ElementApi, TextApi } from '@udecode/plate';

import type { ComputeDiffOptions } from '../../lib/computeDiff';

import { isEqual } from './is-equal';

export function diffNodes(
  originNodes: Descendant[],
  targetNodes: Descendant[],
  { elementsAreRelated, ignoreProps }: ComputeDiffOptions
) {
  const result: NodeRelatedItem[] = [];
  let relatedNode: Descendant | undefined;
  const remainingTargetNodes: Descendant[] = [...targetNodes];

  originNodes.forEach((originNode: Descendant) => {
    let childrenUpdated = false;
    let nodeUpdated = false;
    relatedNode = remainingTargetNodes.find((targetNode: Descendant) => {
      if (
        ElementApi.isElement(originNode) &&
        ElementApi.isElement(targetNode)
      ) {
        const relatedResult =
          elementsAreRelated?.(originNode, targetNode) ?? null;

        if (relatedResult !== null) return relatedResult;
      }

      childrenUpdated = isEqualNode(originNode, targetNode, ignoreProps);
      nodeUpdated = isEqualNodeChildren(originNode, targetNode);

      return nodeUpdated || childrenUpdated;
    });

    if (relatedNode) {
      const insertNodes = remainingTargetNodes.splice(
        0,
        remainingTargetNodes.indexOf(relatedNode)
      );
      insertNodes.forEach((insertNode) => {
        result.push({
          insert: true,
          originNode: insertNode,
        });
      });
      remainingTargetNodes.splice(0, 1);
    }

    result.push({
      childrenUpdated,
      delete: !relatedNode,
      nodeUpdated,
      originNode,
      relatedNode,
    });
  });
  remainingTargetNodes.forEach((insertNode) => {
    result.push({
      insert: true,
      originNode: insertNode,
    });
  });

  return result;
}

export type NodeRelatedItem = {
  originNode: Descendant;
  childrenUpdated?: boolean;
  delete?: boolean;
  insert?: boolean;
  nodeUpdated?: boolean;
  relatedNode?: Descendant;
};

export function isEqualNode(
  value: Descendant,
  other: Descendant,
  ignoreProps?: string[]
) {
  return (
    ElementApi.isElement(value) &&
    ElementApi.isElement(other) &&
    value.children !== null &&
    other.children !== null &&
    isEqual(value, other, {
      ignoreDeep: ignoreProps,
      ignoreShallow: ['children'],
    })
  );
}

export function isEqualNodeChildren(value: Descendant, other: Descendant) {
  if (
    ElementApi.isElement(value) &&
    ElementApi.isElement(other) &&
    isEqual(value.children, other.children)
  ) {
    return true;
  }

  return (
    TextApi.isText(value) &&
    TextApi.isText(other) &&
    isEqual(value.text, other.text)
  );
}
