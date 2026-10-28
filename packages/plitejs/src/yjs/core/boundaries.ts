import * as Y from 'yjs';

import { DocumentIndex } from '../../core/change/document-index';
import {
  addSection,
  RootChange,
  type SectionData,
} from '../../core/change/root-change';
import {
  type CloseToken,
  closeToken,
  type JsonNode,
  type JsonToken,
  nodeProps,
  openToken,
  PreparedTokenSlice,
  PreparedTokenSliceStructureError,
  tokenLength,
  tokensEqual,
} from '../../core/change/tokens';
import type { PropertyModification } from '../../core/change/transform';
import type { Element } from '../../index';
import { getDefined } from '../../internal/get-defined';
import type { YjsNode } from './attributes';
import { readYjsChildren } from './document';
import { areJsonLikeValuesEqual } from './json-equality';
import {
  alignYjsChildren,
  deletedCutViewOf,
  insertedCutOf,
  yjsTextLength,
} from './text-runs';

/**
 * One split a change makes: the skeleton tokens it inserts at `at`, each
 * split node's close then each new node's open, and the empty texts the new
 * lines start with or end with, in the change's order.
 */
export type Boundary = Readonly<{
  /** The position, in the document with the earlier splits applied. */
  at: number;
  /** How many element levels the split cuts. */
  levels: number;
  /** Whether the split also cuts a text. */
  text: boolean;
  tokens: readonly JsonToken[];
}>;

const isStructural = (token: JsonToken) => token.kind !== 'text';

const sizeOf = (tokens: readonly JsonToken[]) =>
  tokens.reduce((sum, token) => sum + tokenLength(token), 0);

const isBalanced = (tokens: readonly JsonToken[]) => {
  const open: JsonToken[] = [];
  for (const token of tokens) {
    if (token.kind === 'open') open.push(token);
    else if (token.kind === 'close') {
      const last = open.pop();
      if (last?.kind !== 'open' || last.nodeKind !== token.nodeKind) {
        return false;
      }
    }
  }
  return open.length === 0;
};

type Peeled = Readonly<{
  /** Tokens the split writes, in order. */
  split: readonly JsonToken[];
  /** Whether each token of `split` opens a copy of a node the split cuts. */
  copies: readonly boolean[];
  /** For each token of `split`, the tokens the rest inserts after it. */
  after: ReadonlyArray<readonly JsonToken[]>;
  /** The tokens the rest inserts before the split's first token. */
  head: readonly JsonToken[];
  closes: readonly CloseToken[];
}>;

/**
 * Split an insert into the tokens that cut nodes, which close a node the
 * insert did not open or open one it does not close, plus the empty texts at
 * the new lines' edges, and the rest: letters and whole nodes.
 */
const peel = (inserted: readonly JsonToken[]): Peeled | null => {
  const match = new Array<number>(inserted.length).fill(-1);
  const stack: number[] = [];
  const closes: CloseToken[] = [];
  for (const [index, token] of inserted.entries()) {
    if (token.kind === 'open') stack.push(index);
    else if (token.kind === 'close') {
      const open = stack.at(-1);
      if (open === undefined) {
        closes.push(token);
        continue;
      }
      const opened = inserted[open];
      if (opened.kind !== 'open' || opened.nodeKind !== token.nodeKind) {
        return null;
      }
      stack.pop();
      match[open] = index;
      match[index] = open;
    }
  }
  const opens = stack.map((index) => inserted[index]);
  if (
    closes.length === 0 ||
    closes.length !== opens.length ||
    closes.some((close, index) => {
      const open = opens[opens.length - 1 - index];
      return open.kind !== 'open' || open.nodeKind !== close.nodeKind;
    }) ||
    !closes.some((close) => close.nodeKind === 'element')
  ) {
    return null;
  }
  const split: JsonToken[] = [];
  const copies: boolean[] = [];
  const after: JsonToken[][] = [];
  const head: JsonToken[] = [];
  const rest = (token: JsonToken) => (after.at(-1) ?? head).push(token);
  const write = (token: JsonToken, copy: boolean) => {
    split.push(token);
    copies.push(copy);
    after.push([]);
  };
  for (let index = 0; index < inserted.length; index++) {
    const token = inserted[index];
    const end = match[index];
    if (token.kind === 'text') {
      rest(token);
    } else if (end === -1) {
      write(token, token.kind === 'open');
    } else if (token.kind === 'open' && token.nodeKind === 'text') {
      // A text the insert adds whole is an empty text of the split, and its
      // letters are the rest's.
      write(token, false);
      for (index += 1; index < end; index++) rest(inserted[index]);
      write(inserted[end], false);
    } else {
      for (; index <= end; index++) rest(inserted[index]);
      index = end;
    }
  }
  return { after, closes, copies, head, split };
};

const propertiesOf = (node: Readonly<Record<string, unknown>>) =>
  Object.fromEntries(
    Object.entries(node).filter(([key]) => key !== 'children' && key !== 'text')
  );

const modificationsOf = (
  from: Readonly<Record<string, unknown>>,
  to: Readonly<Record<string, unknown>>
): PropertyModification[] => [
  ...Object.keys(from)
    .filter((key) => !Object.hasOwn(to, key))
    .map((key) => ({ key, type: 'unset' as const })),
  ...Object.keys(to)
    .filter((key) => !areJsonLikeValuesEqual(from[key], to[key]))
    .map((key) => ({ key, type: 'set' as const, value: to[key] })),
];

/**
 * The splits a change makes, each with its skeleton tokens, and the rest of
 * the change, which applies after them. A section counts as a split when,
 * after equal structural tokens are trimmed from its edges, it removes whole
 * nodes or letters only and inserts tokens that close the nodes around one
 * position and open their copies. The splits apply first, so each line keeps
 * its Yjs nodes; the rest then writes the letters and whole nodes. Returns
 * null when the change makes no split.
 */
export const boundariesOf = (
  change: RootChange,
  before: DocumentIndex
): Readonly<{ boundaries: Boundary[]; rest: RootChange | null }> | null => {
  const boundaries: Boundary[] = [];
  const sections: number[] = [];
  const data: SectionData[] = [];
  let position = 0;
  let shift = 0;
  let rest = false;

  for (let index = 0; index < change.sections.length; index += 2) {
    const length = change.sections[index];
    const inserted = change.sections[index + 1];
    const value = change.data[index / 2] ?? null;
    const at = position;

    position += length;
    if (inserted < 0) {
      addSection(sections, data, length, inserted, value);
      rest ||= inserted !== -1;
      continue;
    }

    const removed = before.slice(at, at + length).tokens;
    const insert = (value as PreparedTokenSlice).tokens;
    let head = 0;
    while (
      head < removed.length &&
      head < insert.length &&
      isStructural(removed[head]) &&
      tokensEqual(removed[head], insert[head])
    ) {
      head += 1;
    }
    let tail = 0;
    while (
      tail < removed.length - head &&
      tail < insert.length - head &&
      isStructural(removed[removed.length - 1 - tail]) &&
      tokensEqual(
        removed[removed.length - 1 - tail],
        insert[insert.length - 1 - tail]
      )
    ) {
      tail += 1;
    }
    const gone = removed.slice(head, removed.length - tail);
    const peeled = isBalanced(gone)
      ? peel(insert.slice(head, insert.length - tail))
      : null;
    const cut = at + head + sizeOf(gone);
    const containers = peeled
      ? before
          .openContextAt(cut)
          .filter((range) => range.contentFrom <= cut && cut <= range.contentTo)
      : [];

    if (
      !peeled ||
      peeled.closes.length > containers.length ||
      peeled.closes.some(
        (close, level) =>
          containers[containers.length - 1 - level].kind !== close.nodeKind
      )
    ) {
      addSection(sections, data, length, inserted, value);
      rest = true;
      continue;
    }

    // Each copy opens with the props of the node it copies, so the split
    // writes no property, and the rest sets the copy's new props.
    const cutNodes = containers.slice(containers.length - peeled.closes.length);
    const changed: Array<readonly PropertyModification[]> = [];
    const tokens = peeled.split.map((token, slot) => {
      if (!peeled.copies[slot] || token.kind !== 'open') {
        changed.push([]);
        return token;
      }
      const copied = propertiesOf(
        before.node(getDefined(cutNodes.shift()).path)
      );
      changed.push(modificationsOf(copied, token.props));
      return openToken(token.nodeKind, copied);
    });

    boundaries.push({
      at: cut + shift,
      levels: peeled.closes.filter((close) => close.nodeKind === 'element')
        .length,
      text: peeled.closes.some((close) => close.nodeKind === 'text'),
      tokens,
    });
    shift += tokens.length;
    addSection(sections, data, head, -1, null);
    const replace = (count: number, add: readonly JsonToken[]) => {
      if (count === 0 && add.length === 0) return;
      addSection(
        sections,
        data,
        count,
        sizeOf(add),
        PreparedTokenSlice.fromTokens(add)
      );
      rest = true;
    };
    replace(sizeOf(gone), peeled.head);
    for (const [slot, add] of peeled.after.entries()) {
      if (changed[slot].length > 0) {
        addSection(sections, data, 1, -2, changed[slot]);
        rest = true;
      } else {
        addSection(sections, data, 1, -1, null);
      }
      replace(0, add);
    }
    addSection(sections, data, tail, -1, null);
  }

  return boundaries.length === 0
    ? null
    : {
        boundaries,
        rest: rest ? RootChange.fromSections(sections, data) : null,
      };
};

type Path = readonly number[];
type YjsDelta = ReadonlyArray<
  Readonly<{ delete?: number; insert?: unknown; retain?: number }>
>;

/** What a Yjs batch did, read against the document before it. */
export type YjsBatchView = Readonly<{
  /** An element's shown children before the batch, or null when unknown. */
  childrenBefore: (parent: Y.XmlElement) => readonly YjsNode[] | null;
  deltas: ReadonlyMap<Y.XmlText, readonly YjsDelta[]>;
  /** The cut embeds the batch deleted. */
  deletedCuts: readonly Y.Item[];
  /** The nodes that showed before the batch and that it hid. */
  hidden: ReadonlySet<YjsNode>;
  inserted: ReadonlySet<YjsNode>;
  isPlaceholder: (node: YjsNode) => boolean;
  /** The element at a path of the document before the batch. */
  lineAt: (path: Path) => Element | null;
  /**
   * Whether the batch moved a node: it hid the node, or a placeholder it
   * inserted shows the node, even one that was hidden before it.
   */
  moved: (node: YjsNode) => boolean;
  /**
   * The element that showed a node before the batch: its parent, or the
   * parent of the placeholder that showed it. Null when it showed nowhere.
   */
  parentOf: (node: YjsNode) => Y.XmlElement | null;
  /** An element's path before the batch, or null when it showed nowhere. */
  pathOf: (node: Y.XmlElement) => Path | null;
  /** The nodes a child list event deleted. */
  removed: ReadonlySet<YjsNode>;
  /** The node a raw child shows: itself, or a placeholder's target. */
  shown: (node: YjsNode) => YjsNode | null;
  /** A text's source, whose deltas change the letters it shows. */
  sourceOf: (text: Y.XmlText) => Y.XmlText;
}>;

/**
 * A split a Yjs batch makes, in the document before it: the innermost line
 * it splits, how many element levels it cuts, and where, inside a text or
 * before one of the line's children.
 */
export type FoundSplit = Readonly<{
  levels: number;
  line: Path;
  point:
    | Readonly<{ kind: 'text'; offset: number; path: Path }>
    | Readonly<{ index: number; kind: 'child' }>;
}>;

/**
 * A line a batch joins into an earlier sibling, `left`, by deleting the cut
 * its first text shows the letters after, in the document before the batch.
 * The cut's source sits in `left`, which an empty text may separate from
 * `line`.
 */
export type FoundUnsplit = Readonly<{ left: Path; line: Path }>;

/** A split as a batch writes it: the ancestor it copies and its new spine. */
export type BatchSplit = FoundSplit &
  Readonly<{ copied: YjsNode; spine: Y.XmlElement }>;

const rawChildrenOf = (node: Y.XmlElement): YjsNode[] =>
  readYjsChildren(node).filter(
    (child): child is YjsNode =>
      child instanceof Y.XmlElement || child instanceof Y.XmlText
  );

/**
 * Where `offset` letters into `node`, one of `line`'s shown children before
 * the batch, falls among the line's Plite children. A point where two leaves
 * meet, or at an element, is a point between children.
 */
const pointIn = (
  view: YjsBatchView,
  line: Y.XmlElement,
  node: YjsNode,
  offset: number
): Readonly<{
  found: Pick<FoundSplit, 'line' | 'point'>;
  node: Y.XmlElement;
}> | null => {
  const found = locate(view, line, node, offset);
  return found && { found, node: line };
};

const locate = (
  view: YjsBatchView,
  line: Y.XmlElement,
  node: YjsNode,
  offset: number
): Pick<FoundSplit, 'line' | 'point'> | null => {
  const path = view.pathOf(line);
  const element = path && view.lineAt(path);
  const children = view.childrenBefore(line);
  if (!path || !element || !children) return null;
  // A child after the cut that the batch left in the line, such as one a
  // local join moved there, keeps its place, so the line splits at its end
  // and the cut's content moves.
  if (
    children
      .slice(children.indexOf(node) + 1)
      .some((child) => !view.moved(child) && child._item?.deleted !== true)
  ) {
    return {
      line: path,
      point: { index: element.children.length, kind: 'child' },
    };
  }
  const aligned = alignYjsChildren(element.children, children);
  if (!aligned) return null;
  for (const [order, segment] of aligned.segments.entries()) {
    const target = aligned.targets[order];
    if (target?.kind === 'element' && target.node === node && offset === 0) {
      return { line: path, point: { index: segment.from, kind: 'child' } };
    }
    if (target?.kind !== 'text' || segment.kind !== 'text') continue;
    const at = target.chain.indexOf(node as Y.XmlText);
    if (at === -1) continue;
    let letters = offset;
    for (const text of target.chain.slice(0, at)) {
      if (view.deltas.has(view.sourceOf(text))) return null;
      letters += yjsTextLength(text);
    }
    for (const [index, leaf] of segment.leaves.entries()) {
      const last = index === segment.leaves.length - 1;
      // A text that moves whole takes its props, which Yjs keeps on its
      // letters, so the split comes before it and the line keeps none of it.
      if (letters === 0) {
        return {
          line: path,
          point: { index: segment.from + index, kind: 'child' },
        };
      }
      if (
        letters < leaf.text.length ||
        (last && letters === leaf.text.length)
      ) {
        return {
          line: path,
          point: {
            kind: 'text',
            offset: letters,
            path: [...path, segment.from + index],
          },
        };
      }
      letters -= leaf.text.length;
    }
    return null;
  }
  return null;
};

const isCutView = (
  view: YjsBatchView,
  node: YjsNode | undefined
): node is Y.XmlText =>
  node instanceof Y.XmlText && view.sourceOf(node) !== node;

/**
 * The witness in a new element: the first placeholder that shows a node the
 * batch moved from right after an element, the original. The new element
 * right before it is that original's copy, whatever its type.
 */
const witnessIn = (view: YjsBatchView, element: Y.XmlElement) => {
  const children = rawChildrenOf(element);
  for (const [index, child] of children.entries()) {
    if (isCutView(view, child)) return null;
    const target = view.isPlaceholder(child) ? view.shown(child) : null;
    if (!target || !view.moved(target)) continue;
    const line = view.parentOf(target);
    const before = line && view.childrenBefore(line);
    const original = before?.[before.indexOf(target) - 1];
    if (!(original instanceof Y.XmlElement)) continue;
    const copy = children[index - 1];
    return copy instanceof Y.XmlElement && !view.isPlaceholder(copy)
      ? { copy, original }
      : null;
  }
  return null;
};

/**
 * Where a copy that holds neither a cut view nor a moved child starts the new
 * line: at the end of its original, as an Enter at an inline element's end
 * leaves them.
 */
const endPointOf = (view: YjsBatchView, original: Y.XmlElement) => {
  const path = view.pathOf(original);
  const element = path && view.lineAt(path);
  if (!path || !element) return null;
  return {
    found: {
      line: path,
      point: { index: element.children.length, kind: 'child' as const },
    },
    node: original,
  };
};

/**
 * Where the innermost new element of a split's spine starts the new line: a
 * view of a cut the batch inserted, or, after any new texts, a placeholder
 * of a child the batch hid, or else the end of `original`, the element it
 * copies when the walk reached it through a witness. Every node under the
 * spine is new.
 */
const splitPointOf = (
  view: YjsBatchView,
  inner: Y.XmlElement,
  original: Y.XmlElement | null
) => {
  const children = rawChildrenOf(inner);
  const [head] = children;
  if (isCutView(view, head)) {
    const delta = view.deltas.get(view.sourceOf(head));
    const cut =
      delta?.length === 1
        ? insertedCutOf(head, delta[0], view.deletedCuts)
        : null;
    const parent = cut && view.parentOf(cut.text);
    return cut && parent ? pointIn(view, parent, cut.text, cut.offset) : null;
  }
  const moved = children.find((child) => !(child instanceof Y.XmlText));
  const target = moved && view.isPlaceholder(moved) ? view.shown(moved) : null;
  const parent = target && view.moved(target) && view.parentOf(target);
  if (target && parent) return pointIn(view, parent, target, 0);
  return original && endPointOf(view, original);
};

/** The splits and unsplits a Yjs batch makes. */
export type BatchBoundaries = Readonly<{
  splits: readonly BatchSplit[];
  unsplits: readonly FoundUnsplit[];
}>;

/**
 * The splits a Yjs batch makes. Each one inserts a spine of new elements,
 * one per level it cuts, beside the ancestor it copies, and the innermost
 * element starts with the new line's content: a view of a cut the batch
 * inserted, or placeholders of the line's trailing children, which the batch
 * hid. The walk down the spine follows each level's witness to its copy until
 * a copy holds no witness.
 */
const splitsInBatch = (view: YjsBatchView): BatchSplit[] => {
  const found: BatchSplit[] = [];
  for (const node of view.inserted) {
    const { parent } = node;
    if (
      !(node instanceof Y.XmlElement) ||
      !(parent instanceof Y.XmlElement) ||
      view.inserted.has(parent) ||
      view.isPlaceholder(node)
    ) {
      continue;
    }
    let inner = node;
    let levels = 1;
    let original: Y.XmlElement | null = null;
    for (
      let witness = witnessIn(view, inner);
      witness;
      witness = witnessIn(view, inner)
    ) {
      ({ copy: inner, original } = witness);
      levels += 1;
    }
    const split = splitPointOf(view, inner, original);
    let copied: YjsNode | null = split?.node ?? null;
    for (let level = 1; copied && level < levels; level++) {
      copied = view.parentOf(copied);
    }
    if (!split || !copied || view.parentOf(copied) !== parent) continue;
    found.push({ ...split.found, copied, levels, spine: node });
  }
  return found;
};

/**
 * The unsplits a Yjs batch makes. Each one deletes a cut and removes
 * the line that holds the cut's view, right after a sibling line.
 */
const unsplitsInBatch = (view: YjsBatchView): FoundUnsplit[] => {
  const found: FoundUnsplit[] = [];
  for (const cut of view.deletedCuts) {
    const source = cut.parent as Y.XmlText;
    // A cut deleted with its source joins nothing.
    if (source._item?.deleted) continue;
    const parent = deletedCutViewOf(cut)?.parent;
    const line =
      parent instanceof Y.XmlElement &&
      (view.removed.has(parent) || view.hidden.has(parent))
        ? view.pathOf(parent)
        : null;
    const holder = view.parentOf(source);
    const left = holder && view.pathOf(holder);
    if (
      line &&
      left?.length === line.length &&
      left.every((index, depth) =>
        depth === left.length - 1 ? index < line[depth] : index === line[depth]
      )
    ) {
      found.push({ left, line });
    }
  }
  return found;
};

/**
 * The splits and unsplits a Yjs batch makes, read against the document
 * before it.
 */
export const boundariesInBatch = (view: YjsBatchView): BatchBoundaries => ({
  splits: splitsInBatch(view),
  unsplits: unsplitsInBatch(view),
});

/**
 * Diff `after` against `document` one top-level node at a time when both
 * hold as many, so no edit spans the line a split ends.
 */
const linewiseBetween = (
  document: DocumentIndex,
  after: readonly JsonNode[],
  between: (before: DocumentIndex, after: DocumentIndex) => RootChange
) => {
  const nodes = document.value;
  if (nodes.length !== after.length) {
    return between(document, DocumentIndex.fromValue(after));
  }
  const sections: number[] = [];
  const data: SectionData[] = [];
  let position = 0;
  for (const [index, node] of nodes.entries()) {
    const local = between(
      DocumentIndex.fromValue([node]),
      DocumentIndex.fromValue([after[index]])
    );
    if (local.empty) continue;
    const from = document.childPosition([], index);
    addSection(sections, data, from - position, -1, null);
    for (let at = 0; at < local.sections.length; at += 2) {
      addSection(
        sections,
        data,
        local.sections[at],
        local.sections[at + 1],
        local.data[at / 2] ?? null
      );
    }
    position = from + local.length;
  }
  addSection(sections, data, document.length - position, -1, null);
  return RootChange.fromSections(sections, data);
};

/**
 * The section that joins `line` into the earlier sibling `first`: it deletes
 * the tokens between the two lines' content, and, when the first line ends
 * and the second starts with texts of the same props, between their letters.
 */
const unsplitEdit = (before: DocumentIndex, first: Path, line: Path) => {
  const left = before.node(first).children ?? [];
  const right = before.node(line).children ?? [];
  const last = left.at(-1);
  const [head] = right;
  if (
    last?.text !== undefined &&
    head?.text !== undefined &&
    areJsonLikeValuesEqual(nodeProps(last), nodeProps(head))
  ) {
    return {
      from: before.positionAt({
        offset: last.text.length,
        path: [...first, left.length - 1],
      }),
      to: before.positionAt({ offset: 0, path: [...line, 0] }),
      tokens: [],
    };
  }
  return {
    from: before.nodeRange(first).to - 1,
    to: before.nodeRange(line).from + 1,
    tokens: [],
  };
};

/**
 * The change from `before` to `after` that makes `splits` and `unsplits`
 * first, so each line's content keeps its place, and then diffs each line.
 * Null when one does not fit `before`.
 */
export const splitChangeTo = (
  before: DocumentIndex,
  after: readonly JsonNode[],
  splits: readonly FoundSplit[],
  between: (before: DocumentIndex, after: DocumentIndex) => RootChange,
  unsplits: readonly FoundUnsplit[] = []
): RootChange | null => {
  const edits = splits
    .map(({ levels, line, point }) => {
      const text = point.kind === 'text';
      const tokens: JsonToken[] = text ? [closeToken('text')] : [];
      for (let level = 0; level < levels; level++) {
        tokens.push(closeToken('element'));
      }
      for (let level = levels - 1; level >= 0; level--) {
        tokens.push(
          openToken(
            'element',
            nodeProps(before.node(line.slice(0, line.length - level)))
          )
        );
      }
      if (text) {
        tokens.push(openToken('text', nodeProps(before.node(point.path))));
      }
      const at =
        point.kind === 'text'
          ? before.positionAt({ offset: point.offset, path: point.path })
          : before.childPosition(line, point.index);
      return { from: at, to: at, tokens };
    })
    .concat(unsplits.map(({ left, line }) => unsplitEdit(before, left, line)))
    .sort((left, right) => left.from - right.from);
  const sections: number[] = [];
  const data: SectionData[] = [];
  let position = 0;
  for (const { from, to, tokens } of edits) {
    if (from < position || (from === position && sections.length > 0)) {
      return null;
    }
    addSection(sections, data, from - position, -1, null);
    addSection(
      sections,
      data,
      to - from,
      tokens.length,
      PreparedTokenSlice.fromTokens(tokens)
    );
    position = to;
  }
  addSection(sections, data, before.length - position, -1, null);
  try {
    const split = RootChange.fromSections(sections, data);
    return split.compose(linewiseBetween(split.apply(before), after, between));
  } catch (error) {
    if (error instanceof PreparedTokenSliceStructureError) return null;
    throw error;
  }
};
