import type * as Y from 'yjs';

import type {
  DocumentIndex,
  IndexedNodeRange,
  NodeList,
} from '../../core/change/document-index';
import { RootChange } from '../../core/change/root-change';
import {
  type JsonToken,
  PreparedTokenSlice,
  PreparedTokenSliceStructureError,
  tokensEqual,
} from '../../core/change/tokens';
import { type Descendant, type Element, NodeApi } from '../../index';
import { getDefined } from '../../internal/get-defined';
import { yjsAddressesOf } from './addresses';
import type { YjsNode } from './attributes';
import {
  createYjsNode,
  createYjsPropertyContext,
  createYjsPropertyLocationAt,
  getYjsVisibleChildren,
  insertYjsChild,
  moveVisibleYjsChildren,
  removeYjsChild,
  removeYjsVirtualPlaceholderChild,
  type YjsPropertyContext,
  type YjsSetPropertyResolver,
  type YjsWrite,
} from './document';
import { parentPath } from './path';
import { alignYjsChildren, cutTextAt } from './text-runs';

/**
 * One wrap, unwrap or moved edge of a commit, applied alone: `before` is the
 * document it applies to and `after` the document it gives. `parent` is the
 * path of the element whose children it changes, and `element` the path of
 * the enclosing element, in `after` for a wrap and in `before` otherwise.
 * `top` says which root children it replaces: `count` of them from `at`
 * in `before` by `made` of them in `after`.
 */
export type EnclosureStep = Readonly<{
  after: DocumentIndex;
  before: DocumentIndex;
  change: RootChange;
  element: readonly number[];
  parent: readonly number[];
  top: Readonly<{ at: number; count: number; made: number }>;
}> &
  (
    | Readonly<{
        /** The positions in `before` of the two edges. */
        from: number;
        kind: 'unwrap' | 'wrap';
        to: number;
      }>
    | Readonly<{
        /**
         * An edge of the element moved over whole children: `count` children
         * from `from`, of its parent when `into` and of the element
         * otherwise, move into or out of it at its `side`.
         */
        count: number;
        from: number;
        into: boolean;
        kind: 'edge';
        side: 'end' | 'start';
      }>
  );

type Section = Readonly<{
  from: number;
  insert: PreparedTokenSlice;
  to: number;
}>;

/**
 * The index of the one element token among text tokens, or -1 when the
 * tokens hold a letter or another element token.
 */
const edgeElementToken = (tokens: readonly JsonToken[]) => {
  let element = -1;

  for (const [index, token] of tokens.entries()) {
    if (token.kind === 'text') return -1;
    if (token.nodeKind === 'element') {
      if (element !== -1) return -1;
      element = index;
    }
  }

  return element;
};

const same = (left: JsonToken | undefined, right: JsonToken | undefined) =>
  !!left && !!right && left.kind !== 'text' && tokensEqual(left, right);

/**
 * The change's replacements, each without the equal structural tokens it
 * deletes and inserts again at its edges, or null when it writes
 * properties.
 */
const sectionsOf = (
  change: RootChange,
  before: DocumentIndex
): Section[] | null => {
  const sections: Section[] = [];
  let position = 0;

  for (let index = 0; index < change.sections.length; index += 2) {
    const length = change.sections[index];
    const inserted = change.sections[index + 1];
    const from = position;

    position += length;
    if (inserted === -2) return null;
    if (inserted < 0) continue;

    const removed = before.slice(from, from + length).tokens;
    const insert = (
      (change.data[index / 2] as PreparedTokenSlice | null) ??
      PreparedTokenSlice.empty
    ).tokens;
    let head = 0;
    let tail = 0;

    while (
      head < Math.min(removed.length, insert.length) &&
      same(removed[head], insert[head])
    ) {
      head += 1;
    }
    while (
      tail < Math.min(removed.length, insert.length) - head &&
      same(removed.at(-1 - tail), insert.at(-1 - tail))
    ) {
      tail += 1;
    }
    sections.push({
      from: from + head,
      insert: PreparedTokenSlice.fromTokens(
        insert.slice(head, insert.length - tail)
      ),
      to: from + length - tail,
    });
  }

  return sections;
};

/** The pair's change and the document it gives, or null when it is unbalanced. */
const applyPair = (before: DocumentIndex, lead: Section, trail: Section) => {
  try {
    const change = RootChange.create(before, [lead, trail]);

    return { after: change.apply(before), change };
  } catch (error) {
    if (error instanceof PreparedTokenSliceStructureError) return null;
    throw error;
  }
};

const parentOf = (range: IndexedNodeRange) => range.path.slice(0, -1);

const isElementToken = (token: JsonToken, kind: 'close' | 'open') =>
  token.kind === kind && token.nodeKind === 'element';

/**
 * A pair that wraps several elements nested at the same edges, as one wrap
 * per element, outermost first, so each wrapper is made under the parent it
 * ends in. Any other pair stays whole.
 */
const unstack = (
  lead: Section,
  trail: Section
): Array<readonly [Section, Section]> => {
  const opens = lead.insert.tokens;
  const closes = trail.insert.tokens;
  const count = opens.length;

  if (
    lead.from !== lead.to ||
    trail.from !== trail.to ||
    count < 2 ||
    closes.length !== count ||
    !opens.every((token) => isElementToken(token, 'open')) ||
    !closes.every((token) => isElementToken(token, 'close'))
  ) {
    return [[lead, trail]];
  }

  const one = (from: number, token: JsonToken): Section => ({
    from,
    insert: PreparedTokenSlice.fromTokens([token]),
    to: from,
  });

  // Each outer wrap adds an open before both edges.
  return Array.from({ length: count }, (_, applied) => [
    one(lead.from + applied, opens[applied]),
    one(trail.from + applied, closes[count - 1 - applied]),
  ]);
};

/**
 * The commit's wraps and unwraps, each as its own step in the order they
 * apply, or null when the change holds anything else. A wrap inserts an
 * element's open and close tokens, each with only text tokens around it,
 * and an unwrap deletes them, so each keeps every letter and child it
 * encloses. Wraps of several elements at the same edges are one step each.
 */
export const enclosureStepsOf = (
  change: RootChange,
  before: DocumentIndex
): EnclosureStep[] | null => {
  const sections = sectionsOf(change, before);

  if (!sections || sections.length === 0 || sections.length % 2 !== 0) {
    return null;
  }

  const steps: EnclosureStep[] = [];
  let current = before;

  // The pairs apply right to left, so each pair's positions in `before`
  // still hold when it applies; `unstack` places the wraps it splits a pair
  // into.
  const pairs = Array.from({ length: sections.length / 2 }, (_, index) =>
    unstack(sections[2 * index], sections[2 * index + 1])
  )
    .reverse()
    .flat();

  for (const [lead, trail] of pairs) {
    const wraps = lead.from === lead.to && trail.from === trail.to;
    const unwraps = lead.insert.length === 0 && trail.insert.length === 0;
    const leadTokens = wraps
      ? lead.insert.tokens
      : current.slice(lead.from, lead.to).tokens;
    const trailTokens = wraps
      ? trail.insert.tokens
      : current.slice(trail.from, trail.to).tokens;
    const open = edgeElementToken(leadTokens);
    const close = edgeElementToken(trailTokens);

    if (!(wraps || unwraps)) {
      const moved = movedEdgeOf(current, lead, trail);

      if (!moved) return null;
      steps.push(moved);
      current = moved.after;
      continue;
    }
    if (
      open === -1 ||
      close === -1 ||
      leadTokens[open].kind !== 'open' ||
      trailTokens[close].kind !== 'close'
    ) {
      return null;
    }

    const applied = applyPair(current, lead, trail);

    if (!applied) return null;

    const { after, change: step } = applied;

    // A wrap's element ends after the lead's tokens shift its close; an
    // unwrap's ends at the trail's close.
    const element = wraps
      ? after.nodeStartingAt(lead.from + open)
      : current.nodeStartingAt(lead.from + open);
    const end = wraps
      ? trail.from + leadTokens.length + close + 1
      : trail.from + close + 1;

    if (element?.kind !== 'element' || element.to !== end) return null;

    const parent = parentOf(element);
    const at = element.path[0];
    const children = (node: DocumentIndex) =>
      (node.node(element.path) as Element).children.length;

    steps.push({
      after,
      before: current,
      change: step,
      element: element.path,
      from: lead.from,
      kind: wraps ? 'wrap' : 'unwrap',
      parent,
      to: trail.from,
      top:
        parent.length > 0
          ? { at, count: 1, made: 1 }
          : wraps
            ? { at, count: children(after), made: 1 }
            : { at, count: 1, made: children(current) },
    });
    current = after;
  }

  return steps;
};

/**
 * The step of a pair that moves one element token over whole children: one
 * section deletes the token and the other inserts the same kind of token at
 * a child boundary, so the element takes its next or previous siblings in or
 * gives its first or last children out. Null for any other pair.
 */
const movedEdgeOf = (
  before: DocumentIndex,
  lead: Section,
  trail: Section
): EnclosureStep | null => {
  const [deleted, inserted] =
    lead.insert.length === 0 ? [lead, trail] : [trail, lead];
  const [gone] = before.slice(deleted.from, deleted.to).tokens;
  const [made] = inserted.insert.tokens;

  if (
    deleted.to !== deleted.from + 1 ||
    inserted.from !== inserted.to ||
    inserted.insert.tokens.length !== 1 ||
    gone?.kind === 'text' ||
    made?.kind !== gone?.kind ||
    gone.nodeKind !== 'element' ||
    made.nodeKind !== 'element'
  ) {
    return null;
  }

  const element =
    gone.kind === 'open'
      ? before.nodeStartingAt(deleted.from)
      : before
          .openContextAt(deleted.from)
          .findLast(
            (range) => range.kind === 'element' && range.to === deleted.to
          );
  const boundary = before.childBoundaryAt(inserted.from);

  if (element?.kind !== 'element' || !boundary) return null;

  const side = gone.kind === 'open' ? 'start' : 'end';
  const into =
    side === 'end'
      ? inserted.from > deleted.from
      : inserted.from < deleted.from;
  const parent = parentOf(element);
  const index = getDefined(element.path.at(-1));
  const holder = into ? parent : element.path;

  if (boundary.parentPath.join(',') !== holder.join(',')) return null;

  const { length } = (before.node(element.path) as Element).children;
  const [from, count] = into
    ? side === 'end'
      ? [index + 1, boundary.index - index - 1]
      : [boundary.index, index - boundary.index]
    : side === 'end'
      ? [boundary.index, length - boundary.index]
      : [0, boundary.index];

  if (count < 1) return null;

  const applied = applyPair(before, lead, trail);

  if (!applied) return null;

  const { after, change } = applied;
  const top =
    parent.length > 0
      ? { at: element.path[0], count: 1, made: 1 }
      : into
        ? { at: Math.min(from, index), count: count + 1, made: 1 }
        : { at: index, count: 1, made: count + 1 };

  return {
    after,
    before,
    change,
    count,
    element: element.path,
    from,
    into,
    kind: 'edge',
    parent,
    side,
    top,
  };
};

const letterCount = (leaves: readonly Descendant[]) =>
  leaves.reduce(
    (sum, leaf) => sum + (NodeApi.isText(leaf) ? leaf.text.length : 0),
    0
  );

/**
 * Where a position of `document` inside the element at `parent` falls among
 * its children: a child index, and the letter offset into that child when
 * the position is inside its text.
 */
const childPointAt = (
  document: DocumentIndex,
  parent: readonly number[],
  position: number
): Readonly<{ child: number; offset: number | null }> | null => {
  const text = document
    .openContextAt(position)
    .findLast(
      (range) =>
        range.kind === 'text' &&
        range.path.length === parent.length + 1 &&
        range.contentFrom <= position &&
        position <= range.contentTo
    );

  if (text) {
    return {
      child: getDefined(text.path.at(-1)),
      offset: position - text.contentFrom,
    };
  }

  const boundary = document.childBoundaryAt(position);

  return boundary && boundary.parentPath.join(',') === parent.join(',')
    ? { child: boundary.index, offset: null }
    : null;
};

type Aligned = NonNullable<ReturnType<typeof alignYjsChildren>>;

/**
 * Cut aligned Yjs children at a point of their Plite children: returns the
 * index among the visible children where the right side starts, and the
 * view of the letters after a cut inside a text, which the right side starts
 * with. Null when the point falls in a text Yjs does not show as one.
 */
const cutChildrenAt = (
  write: YjsWrite,
  { segments, targets }: Aligned,
  visible: readonly YjsNode[],
  point: Readonly<{ child: number; offset: number | null }>
): Readonly<{ at: number; view: Y.XmlText | null }> | null => {
  for (const [order, segment] of segments.entries()) {
    const target = targets[order];
    const size = segment.kind === 'text' ? segment.leaves.length : 1;
    const inside =
      segment.kind === 'text' &&
      segment.from <= point.child &&
      point.child < segment.from + size &&
      (point.offset !== null || segment.from < point.child);

    if (inside) {
      if (!target) {
        return { at: nextShown(targets, order, visible), view: null };
      }
      if (target.kind !== 'text' || segment.kind !== 'text') return null;

      const offset =
        letterCount(segment.leaves.slice(0, point.child - segment.from)) +
        (point.offset ?? 0);
      const cut = cutTextAt(write, target.chain, offset);

      return { at: target.from + cut.at, view: cut.view };
    }
    if (segment.from >= point.child) {
      return { at: nextShown(targets, order, visible), view: null };
    }
  }

  return { at: visible.length, view: null };
};

/**
 * The visible index of each child boundary of `node`, by the index of the
 * Plite child it falls before, or null for a boundary between two leaves Yjs
 * shows as one text. Null when the children do not line up.
 */
const boundariesIn = (
  root: Y.XmlElement,
  node: Y.XmlElement,
  children: readonly Descendant[]
) => {
  const visible = getYjsVisibleChildren(root, node);
  const aligned = alignYjsChildren(children, visible);

  if (!aligned) return null;

  return (child: number): number | null => {
    for (const [order, segment] of aligned.segments.entries()) {
      const size = segment.kind === 'text' ? segment.leaves.length : 1;

      if (segment.from < child && child < segment.from + size) return null;
      if (segment.from >= child) {
        return nextShown(aligned.targets, order, visible);
      }
    }

    return visible.length;
  };
};

const nextShown = (
  targets: ReadonlyArray<Readonly<{ from: number }> | null>,
  order: number,
  visible: readonly YjsNode[]
) => {
  for (let index = order; index < targets.length; index++) {
    const target = targets[index];

    if (target) return target.from;
  }

  return visible.length;
};

const typeOf = (element: Element) => String(element.type ?? 'element');

/**
 * An element a step moves under other ancestors, at `path` in the step's
 * `after` for a wrap and in its `before` otherwise, with each key whose Yjs
 * storage, set or plain value, the new ancestry changes, and the element's
 * context under that ancestry.
 */
export type StorageFlip = Readonly<{
  context: YjsPropertyContext;
  element: Element;
  keys: readonly string[];
  path: readonly number[];
}>;

/**
 * Each element the step moves under other ancestors, or one inside it, whose
 * properties need another Yjs storage there, or null when a text's does. The
 * write moves those nodes with the attributes they store, so each such key
 * is written anew afterwards; nothing rewrites a text's marks in place. The
 * resolver reads a property's merge from the node's placement, type, root
 * and ancestors, never its path, so both contexts share the node's path in
 * the document it is read from.
 */
export const storageFlipsOf = (
  step: EnclosureStep,
  isSetValued: YjsSetPropertyResolver,
  schemaRoot: string | null
): StorageFlip[] | null => {
  const document = step.kind === 'wrap' ? step.after : step.before;
  const element = document.node(step.element) as Element;
  const outer = createYjsPropertyLocationAt(
    step.before.nodes as NodeList<Descendant>,
    step.parent,
    schemaRoot
  ).ancestors;
  const inner = [typeOf(element), ...outer];
  const into = step.kind === 'wrap' || (step.kind === 'edge' && step.into);
  const [holder, from, count] =
    step.kind === 'edge'
      ? [step.into ? step.parent : step.element, step.from, step.count]
      : [step.element, 0, element.children.length];
  const children =
    holder.length === 0
      ? (document.nodes as NodeList<Descendant>)
      : (document.node(holder) as Element).children;
  const flips: StorageFlip[] = [];

  const visit = (
    nodes: readonly Descendant[],
    at: readonly number[],
    first: number,
    was: readonly string[],
    is: readonly string[]
  ): boolean => {
    // Siblings share their ancestry, so one answer serves every sibling of
    // the same placement and type for a key.
    const answers = new Map<string, boolean>();

    return nodes.every((node, index) => {
      const path = [...at, first + index];
      const context = (ancestors: readonly string[]) =>
        createYjsPropertyContext(node, {
          ancestors: [...ancestors],
          path,
          root: schemaRoot,
        });
      const kind = NodeApi.isElement(node) ? `element:${typeOf(node)}` : 'text';
      const flipped = Object.keys(node).filter((key) => {
        if (key === 'children' || key === 'text') return false;

        const id = `${kind}\u0000${key}`;
        const known = answers.get(id);

        if (known !== undefined) return known;

        const answer =
          isSetValued(node, key, context(was)) !==
          isSetValued(node, key, context(is));

        answers.set(id, answer);

        return answer;
      });

      if (!NodeApi.isElement(node)) return flipped.length === 0;
      if (flipped.length > 0) {
        flips.push({
          context: context(is),
          element: node,
          keys: flipped,
          path,
        });
      }

      return visit(
        node.children,
        path,
        0,
        [typeOf(node), ...was],
        [typeOf(node), ...is]
      );
    });
  };

  return visit(
    children.slice(from, from + count),
    holder,
    from,
    into ? outer : inner,
    into ? inner : outer
  )
    ? flips
    : null;
};

/**
 * Write one wrap or unwrap to Yjs so every letter and child keeps its Yjs
 * node: a wrap cuts the texts at its edges, puts the views of the enclosed
 * letters and placeholders of the enclosed children in a new element, and
 * keeps the view of the letters after it in place; an unwrap shows the
 * element's children by placeholder in its place and removes it. Returns
 * false, before any write, when the Yjs children do not line up.
 */
export const writeEnclosure = (
  write: YjsWrite,
  step: EnclosureStep,
  isSetValued: YjsSetPropertyResolver,
  schemaRoot: string | null
): boolean => {
  const { root } = write;
  const addresses = yjsAddressesOf(
    root,
    step.before.nodes as NodeList<Descendant>
  );
  const parent =
    step.parent.length === 0 ? root : addresses.elementAt(step.parent);

  if (!parent) return false;

  const children =
    step.parent.length === 0
      ? (step.before.nodes as NodeList<Descendant>).slice(
          0,
          step.before.nodes.length
        )
      : (step.before.node(step.parent) as Element).children;

  if (step.kind === 'edge') {
    const element = addresses.elementAt(step.element);
    const index = getDefined(step.element.at(-1));
    const inParent = boundariesIn(root, parent, children);
    const inElement =
      element &&
      boundariesIn(
        root,
        element,
        (step.before.node(step.element) as Element).children
      );
    const shown = inParent?.(index);
    const [holder, from, to] = step.into
      ? [parent, inParent?.(step.from), inParent?.(step.from + step.count)]
      : [element, inElement?.(step.from), inElement?.(step.from + step.count)];

    if (
      !element ||
      !holder ||
      shown === undefined ||
      shown === null ||
      from === undefined ||
      from === null ||
      to === undefined ||
      to === null
    ) {
      return false;
    }

    const moved = moveVisibleYjsChildren(write, holder, from, to);
    const [target, at] = step.into
      ? [
          element,
          step.side === 'end' ? getYjsVisibleChildren(root, element).length : 0,
        ]
      : [parent, step.side === 'end' ? shown + 1 : shown];

    moved.forEach((node, offset) =>
      insertYjsChild(write, target, at + offset, node)
    );

    return true;
  }
  if (step.kind === 'unwrap') {
    const index = getDefined(step.element.at(-1));
    const aligned = alignYjsChildren(
      children,
      getYjsVisibleChildren(root, parent)
    );
    const order = aligned?.segments.findIndex(
      (segment) => segment.kind === 'element' && segment.from === index
    );
    const target =
      order === undefined || order === -1 ? null : aligned?.targets[order];

    if (target?.kind !== 'element') return false;

    const moved = moveVisibleYjsChildren(write, target.node, 0);

    if (
      !removeYjsVirtualPlaceholderChild(write, parent, target.from, target.node)
    ) {
      removeYjsChild(write, parent, target.from);
    }
    moved.forEach((node, offset) =>
      insertYjsChild(write, parent, target.from + offset, node)
    );

    return true;
  }

  const end = childPointAt(step.before, step.parent, step.to);
  const start = childPointAt(step.before, step.parent, step.from);

  if (!start || !end) return false;

  const visible = getYjsVisibleChildren(root, parent);
  const aligned = alignYjsChildren(children, visible);

  if (!aligned) return false;

  // The end cuts first, so the start's text still holds its offset.
  const right = cutChildrenAt(write, aligned, visible, end);
  const left = right && cutChildrenAt(write, aligned, visible, start);

  if (!right || !left) return false;

  const moved = moveVisibleYjsChildren(write, parent, left.at, right.at);
  const afterNodes = step.after.nodes as NodeList<Descendant>;
  const wrapper = step.after.node(step.element) as Element;
  const enclosed = [...(left.view ? [left.view] : []), ...moved];
  const created = createYjsNode(
    enclosed.length > 0 ? { ...wrapper, children: [] } : wrapper,
    isSetValued,
    createYjsPropertyContext(wrapper, {
      ...createYjsPropertyLocationAt(
        afterNodes,
        parentPath(step.element),
        schemaRoot
      ),
      path: step.element,
    })
  ) as Y.XmlElement;

  if (enclosed.length > 0) created.insert(0, enclosed);
  insertYjsChild(write, parent, left.at, created);
  if (right.view) insertYjsChild(write, parent, left.at + 1, right.view);

  return true;
};
