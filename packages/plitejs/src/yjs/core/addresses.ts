import * as Y from 'yjs';

import type { NodeList } from '../../core/change/document-index';
import { type Descendant, NodeApi } from '../../index';
import { getYjsElementType, type YjsNode } from './attributes';
import { getYjsVisibleChild, getYjsVisibleChildren } from './document';
import {
  alignYjsChildren,
  type PliteSegment,
  type YjsSegment,
} from './text-runs';

/**
 * A Plite child and the Yjs children that show it: the run of Plite texts it
 * belongs to with that run's Yjs text chain, or an element with its Yjs
 * element. `target` is null for an empty text with no Yjs text of its own.
 */
export type YjsChildAddress = Readonly<{
  segment: PliteSegment;
  target: YjsSegment | null;
}>;

type YjsLine = Readonly<{
  segments: readonly PliteSegment[];
  targets: ReadonlyArray<YjsSegment | null>;
}>;

/**
 * Finds the Yjs nodes that show the Plite tree `nodes`, the children of
 * `root`. Each level pairs its Plite children with its Yjs children through
 * `alignYjsChildren`, so an empty text Yjs omits, or extra empty texts it
 * stores, do not shift a path. Each level is read once, when first asked, so
 * a caller resolves its paths before it writes.
 */
export const yjsAddressesOf = (
  root: Y.XmlElement,
  nodes: NodeList<Descendant>
) => {
  const children = new Map<Y.XmlElement, readonly Descendant[]>();
  const lines = new Map<Y.XmlElement, YjsLine | null>();
  const lineOf = (element: Y.XmlElement) => {
    if (!lines.has(element)) {
      const shown = children.get(element);

      lines.set(
        element,
        shown
          ? alignYjsChildren(shown, getYjsVisibleChildren(root, element))
          : null
      );
    }

    return lines.get(element) ?? null;
  };

  const childAt = (
    element: Y.XmlElement,
    index: number
  ): YjsChildAddress | null => {
    if (element === root) {
      const node = nodes.at(index);
      const shown = getYjsVisibleChild(root, root, index);

      return node && NodeApi.isElement(node) && shown instanceof Y.XmlElement
        ? {
            segment: { from: index, kind: 'element', node },
            target: { from: index, kind: 'element', node: shown },
          }
        : null;
    }

    const line = lineOf(element);
    const order =
      line?.segments.findIndex(
        (segment) =>
          segment.from <= index &&
          index <
            segment.from + (segment.kind === 'text' ? segment.leaves.length : 1)
      ) ?? -1;

    return line && order !== -1
      ? { segment: line.segments[order], target: line.targets[order] }
      : null;
  };

  /**
   * The Yjs element that shows the Plite element at `path`, or null when a
   * level's children do not pair or a paired element has another type.
   */
  const elementAt = (path: readonly number[]): Y.XmlElement | null => {
    let element = root;

    for (const index of path) {
      const child = childAt(element, index);

      if (
        child?.segment.kind !== 'element' ||
        child.target?.kind !== 'element' ||
        getYjsElementType(child.target.node) !== child.segment.node.type
      ) {
        return null;
      }
      element = child.target.node;
      if (!children.has(element)) {
        children.set(element, child.segment.node.children);
      }
    }

    return element;
  };

  return { childAt, elementAt };
};

/**
 * The one Yjs node that shows an addressed child: its element, or the Yjs
 * text of a text alone in its run and in its chain. Null for an empty text
 * with no Yjs text, and undefined when no one node shows the child.
 */
export const yjsNodeOf = (
  address: YjsChildAddress | null
): YjsNode | null | undefined => {
  if (address === null) return undefined;

  const { segment, target } = address;

  if (target === null) return null;
  if (segment.kind === 'element') {
    return target.kind === 'element' ? target.node : undefined;
  }

  return target.kind === 'text' &&
    target.chain.length === 1 &&
    segment.leaves.length === 1
    ? target.chain[0]
    : undefined;
};
