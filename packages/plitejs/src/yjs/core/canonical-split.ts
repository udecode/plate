import * as Y from 'yjs';

import type { DocumentIndex, NodeList } from '../../core/change/document-index';
import { type Descendant, type Element, NodeApi } from '../../index';
import { getDefined } from '../../internal/get-defined';
import { yjsAddressesOf } from './addresses';
import type { YjsNode } from './attributes';
import type { Boundary } from './boundaries';
import {
  createYjsNode,
  createYjsNodes,
  createYjsPropertyContext,
  createYjsPropertyLocationAt,
  getYjsVisibleChildren,
  insertYjsChild,
  moveVisibleYjsChildren,
  type YjsSetPropertyResolver,
  type YjsWrite,
} from './document';
import { parentPath } from './path';
import {
  alignYjsChildren,
  cutTextAt,
  isBareTextRun,
  segmentPliteChildren,
  yjsTextLength,
} from './text-runs';

const letterCount = (leaves: readonly Descendant[]) =>
  leaves.reduce(
    (sum, leaf) => sum + (NodeApi.isText(leaf) ? leaf.text.length : 0),
    0
  );

/** How many empty texts a split's tokens end its first line with. */
const endingTexts = (tokens: Boundary['tokens']) => {
  let count = 0;
  for (const [index, token] of tokens.entries()) {
    if (token.kind === 'close' && token.nodeKind === 'element') break;
    if (
      token.kind === 'open' &&
      token.nodeKind === 'text' &&
      tokens[index + 1]?.kind === 'close'
    ) {
      count += 1;
    }
  }
  return count;
};

const secondLineStart = (
  chain: readonly Y.XmlText[],
  at: number,
  tokens: Boundary['tokens']
) => {
  let kept = at;
  let ending = endingTexts(tokens);
  while (
    ending > 0 &&
    kept < chain.length &&
    yjsTextLength(chain[kept]) === 0
  ) {
    kept += 1;
    ending -= 1;
  }
  return kept;
};

/**
 * Write one split to Yjs as the shape that keeps every letter and child: a
 * cut inside a text becomes a cut embed in its source and a view of the
 * letters after it, and each child after the cut moves to the new node by
 * placeholder. `before` is the document the split applies to and `after` the
 * document with it applied. Returns the two lines it wrote, or null, before
 * any write, when the Yjs children do not line up with `before`.
 */
export const writeSplit = (
  write: YjsWrite,
  before: DocumentIndex,
  after: DocumentIndex,
  boundary: Boundary,
  isSetValued: YjsSetPropertyResolver,
  schemaRoot: string | null
): readonly [Y.XmlElement, Y.XmlElement] | null => {
  const { root } = write;
  const { at, levels, text } = boundary;
  const afterNodes = after.nodes as NodeList<Descendant>;
  const open = before
    .openContextAt(at)
    .filter((range) => range.contentFrom <= at && at <= range.contentTo);
  const split = open.filter((range) => range.kind === 'element').slice(-levels);
  const inner = split.at(-1);
  if (!inner || split.length !== levels) return null;
  // Each copy the split opens, outer to inner, by the position of its open
  // token, since a copy below the outer one need not follow its original.
  const rights = boundary.tokens.flatMap((token, index) => {
    if (token.kind !== 'open' || token.nodeKind !== 'element') return [];
    const position = at + index + 1;
    const copy = after
      .openContextAt(position)
      .findLast(
        (range) =>
          range.kind === 'element' &&
          range.contentFrom <= position &&
          position <= range.contentTo
      );
    return copy ? [copy.path] : [];
  });
  if (rights.length !== levels) return null;
  const innerRight = getDefined(rights.at(-1));

  const addresses = yjsAddressesOf(root, before.nodes as NodeList<Descendant>);
  const nodes: Y.XmlElement[] = [];
  for (let depth = 1; depth <= inner.path.length; depth++) {
    const node = addresses.elementAt(inner.path.slice(0, depth));
    if (!node) return null;
    nodes.push(node);
  }
  const projected = (before.node(inner.path) as Element).children;

  const element = nodes[inner.path.length - 1];
  const visible = getYjsVisibleChildren(root, element);
  const aligned = alignYjsChildren(projected, visible);
  if (!aligned) return null;
  const { segments, targets } = aligned;

  const textRange = text ? open.at(-1) : undefined;
  let child = projected.length;
  for (let index = 0; index < projected.length; index++) {
    if (before.childPosition(inner.path, index) >= at) {
      child = index;
      break;
    }
  }
  if (textRange) child = getDefined(textRange.path.at(-1));
  const left = after.node(inner.path) as Element;
  // A split that leaves the line above with no content keeps the line's
  // element with its content and inserts the empty line above, as a peer
  // reads it back.
  if (
    levels === 1 &&
    left.children.every((node) => NodeApi.isText(node) && node.text === '')
  ) {
    const parent = inner.path.length === 1 ? root : getDefined(nodes.at(-2));
    const above = createYjsNode(
      left,
      isSetValued,
      createYjsPropertyContext(left, {
        ...createYjsPropertyLocationAt(
          afterNodes,
          parentPath(inner.path),
          schemaRoot
        ),
        path: inner.path,
      })
    ) as Y.XmlElement;
    insertYjsChild(
      write,
      parent,
      parent === root
        ? inner.path[0]
        : getYjsVisibleChildren(root, parent).indexOf(element),
      above
    );
    return [above, element];
  }
  const inside = segments.findIndex(
    (segment) =>
      segment.kind === 'text' &&
      segment.from <= child &&
      child < segment.from + segment.leaves.length &&
      (textRange !== undefined || segment.from < child)
  );
  let moveFrom = visible.length;
  const moved: YjsNode[] = [];
  const target = targets[inside];
  if (target?.kind === 'text') {
    const leaves = projected.slice(segments[inside].from, child);
    const cut = cutTextAt(
      write,
      target.chain,
      letterCount(leaves) + (textRange ? at - textRange.contentFrom : 0)
    );
    moveFrom =
      target.from +
      (cut.view
        ? cut.at
        : secondLineStart(target.chain, cut.at, boundary.tokens));
    if (cut.view) moved.push(cut.view);
  } else {
    for (const [index, segment] of segments.entries()) {
      const shown = targets[index];
      if (segment.from >= child && shown) {
        moveFrom =
          shown.from +
          (shown.kind === 'text'
            ? secondLineStart(shown.chain, 0, boundary.tokens)
            : 0);
        break;
      }
    }
  }
  // An empty text that starts the new line before an inline element gets a
  // Yjs text only to hold its props. A peer's import deletes a bare one, and
  // with it the letters typed into it before that delete arrives.
  const [first] = segmentPliteChildren(
    (after.node(innerRight) as Element).children
  );
  if (
    moved.length === 0 &&
    moveFrom < visible.length &&
    !(visible[moveFrom] instanceof Y.XmlText) &&
    first?.kind === 'text' &&
    !isBareTextRun(first)
  ) {
    moved.push(
      ...createYjsNodes(
        first.leaves,
        isSetValued,
        createYjsPropertyLocationAt(afterNodes, innerRight, schemaRoot)
      )
    );
  }
  moved.push(...moveVisibleYjsChildren(write, element, moveFrom));
  if (getYjsVisibleChildren(root, element).length === 0) {
    insertYjsChild(
      write,
      element,
      0,
      createYjsNodes(
        (after.node(inner.path) as Element).children,
        isSetValued,
        createYjsPropertyLocationAt(afterNodes, inner.path, schemaRoot)
      )[0]
    );
  }

  let made: Y.XmlElement | null = null;
  for (let level = split.length - 1; level >= 0; level--) {
    const { path } = split[level];
    const original = nodes[path.length - 1];
    const children: YjsNode[] = made
      ? [
          made,
          ...moveVisibleYjsChildren(
            write,
            original,
            getYjsVisibleChildren(root, original).indexOf(nodes[path.length]) +
              1
          ),
        ]
      : moved;
    const rightPath = rights[level];
    const right = after.node(rightPath) as Element;
    const context = createYjsPropertyContext(right, {
      ...createYjsPropertyLocationAt(
        afterNodes,
        parentPath(rightPath),
        schemaRoot
      ),
      path: rightPath,
    });
    const created = createYjsNode(
      children.length > 0 ? { ...right, children: [] } : right,
      isSetValued,
      context
    ) as Y.XmlElement;
    if (children.length > 0) created.insert(0, children);
    made = created;
  }

  const outer = split[0];
  const spine = getDefined(made);
  if (outer.path.length === 1) {
    insertYjsChild(write, root, outer.path[0] + 1, spine);
  } else {
    const parent = nodes[outer.path.length - 2];
    insertYjsChild(
      write,
      parent,
      getYjsVisibleChildren(root, parent).indexOf(
        nodes[outer.path.length - 1]
      ) + 1,
      spine
    );
  }
  return [nodes[outer.path.length - 1], spine];
};
