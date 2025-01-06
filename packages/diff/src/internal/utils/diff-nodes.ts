/**
 * This Apache-2.0 licensed file has been modified by Udecode and other
 * contributors. See /packages/diff/LICENSE for more information.
 */

import { type Descendant, ElementApi, TextApi } from '@udecode/plate';
import isEqual from 'lodash/isEqual.js';

import type { ComputeDiffOptions } from '../../lib/computeDiff';

import { copyWithout } from './copy-without';

export function diffNodes(
  originNodes: Descendant[],
  targetNodes: Descendant[],
  { elementsAreRelated }: ComputeDiffOptions
) {
  const result: NodeRelatedItem[] = [];
  let relatedNode: Descendant | undefined;
  const leftTargetNodes: Descendant[] = [...targetNodes];

  originNodes.forEach((originNode: Descendant) => {
    let childrenUpdated = false;
    let nodeUpdated = false;
    relatedNode = leftTargetNodes.find((targetNode: Descendant) => {
      if (
        ElementApi.isElement(originNode) &&
        ElementApi.isElement(targetNode)
      ) {
        const relatedResult =
          elementsAreRelated?.(originNode, targetNode) ?? null;

        if (relatedResult !== null) return relatedResult;
      }
      if (isEqualNode(originNode, targetNode)) {
        childrenUpdated = true;
      }
      if (isEqualNodeChildren(originNode, targetNode)) {
        nodeUpdated = true;
      }

      return nodeUpdated || childrenUpdated;
    });

    if (relatedNode) {
      const insertNodes = leftTargetNodes.splice(
        0,
        leftTargetNodes.indexOf(relatedNode)
      );
      insertNodes.forEach((insertNode) => {
        result.push({
          insert: true,
          originNode: insertNode,
        });
      });
      leftTargetNodes.splice(0, 1);
    }

    result.push({
      childrenUpdated,
      delete: !relatedNode,
      nodeUpdated,
      originNode,
      relatedNode,
    });
  });
  leftTargetNodes.forEach((insertNode) => {
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

export function isEqualNode(value: Descendant, other: Descendant) {
  return (
    ElementApi.isElement(value) &&
    ElementApi.isElement(other) &&
    value.children !== null &&
    other.children !== null &&
    isEqual(copyWithout(value, ['children']), copyWithout(other, ['children']))
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
