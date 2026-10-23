import { jsonEqual } from '../core/change/json';
import type { JsonEditorValue } from '../core/change/tokens';
import type { ContentSlice } from '../interfaces/editor';
import type { Path } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import type { Range } from '../interfaces/range';
import { factsOf, marksOf } from './facts/facts';
import { isCut } from './tree/cuts';
import { type AuthoredMark, AUTHORED_MARKS_KEY } from './tree/marks';
import type {
  AuthoredChange,
  AuthoredChangeDetails,
  AuthoredChangeKind,
  AuthoredChangePart,
} from './types';

type Node = Readonly<Record<string, unknown>> & {
  children?: readonly Node[];
  text?: string;
};

/** @internal */
export type Occurrence = Readonly<{
  /**
   * The first and last unit of content under the node, counted in its root.
   * A non-empty text is a unit, and so is an element without one, such as a
   * mention. A pending line break covers none: it sits right before the
   * first unit of its block.
   */
  first: number;
  last: number;
  mark: AuthoredMark;
  node: Node;
  path: Path;
  root: string;
}>;

export type AuthoredChangeIndex = Readonly<{
  changes: ReadonlyMap<string, AuthoredChange>;
  /** Pending changes by creation time, then id. */
  ordered: readonly AuthoredChange[];
  occurrences: ReadonlyMap<string, readonly Occurrence[]>;
}>;

const KINDS: Readonly<Record<AuthoredMark['kind'], AuthoredChangeKind>> = {
  delete: 'delete',
  format: 'format',
  insert: 'insert',
  join: 'structure',
  split: 'structure',
  unwrap: 'structure',
  wrap: 'structure',
};

const isText = (node: Node) => typeof node.text === 'string';

const pointAt = (path: Path, offset: number, root: string): Point => ({
  offset,
  path,
  ...(root === 'main' ? {} : { root }),
});

const edgeText = (node: Node, path: Path, end: boolean): [Node, Path] => {
  let current = node;
  const at = [...path];

  while (!isText(current) && current.children?.length) {
    const index = end ? current.children.length - 1 : 0;

    current = current.children[index];
    at.push(index);
  }

  return [current, at];
};

const rangeOf = ({ node, path, root }: Occurrence): Range => {
  const [, start] = edgeText(node, path, false);
  const [last, end] = edgeText(node, path, true);

  return {
    anchor: pointAt(start, 0, root),
    focus: pointAt(end, last.text?.length ?? 0, root),
  };
};

const isNextSibling = (left: Path, right: Path) =>
  left.length === right.length &&
  left.length > 0 &&
  left.every((index, depth) =>
    depth === left.length - 1
      ? index + 1 === right[depth]
      : index === right[depth]
  );

const isInside = (ancestor: Path, path: Path) =>
  ancestor.length < path.length &&
  ancestor.every((index, depth) => path[depth] === index);

const isLineBreak = (mark: AuthoredMark) =>
  mark.kind === 'join' || (mark.kind === 'split' && !isCut(mark));

// Content also touches across an inline edge, such as text that runs out of a
// link, when one end's text sits in the other's parent.
/** @internal */
export const touches = (left: Occurrence, right: Occurrence) => {
  if (left.root !== right.root) return false;
  if (
    left.path.join(',') === right.path.join(',') ||
    isNextSibling(left.path, right.path)
  ) {
    return true;
  }
  if (right.first !== left.last + 1) return false;
  if (isLineBreak(left.mark) || isLineBreak(right.mark)) return true;

  const [, end] = edgeText(left.node, left.path, true);
  const [, start] = edgeText(right.node, right.path, false);

  return isInside(start.slice(0, -1), end) || isInside(end.slice(0, -1), start);
};

const isContent = (mark: AuthoredMark) =>
  mark.kind === 'insert' || mark.kind === 'delete';

// A proposed Enter under a slotted container tags its tail's type even when
// the type stays, so rejecting reads it back. Readers show no such write.
const keepsValue = (mark: AuthoredMark) =>
  mark.kind === 'format' &&
  mark.write.kind === 'set' &&
  jsonEqual(mark.write.value, mark.before);

/** @internal */
export const continues = (end: Occurrence, first: Occurrence) =>
  touches(end, first) ||
  (isContent(end.mark) &&
    end.root === first.root &&
    isInside(end.path, first.path));

// Insert and delete marks run through every descendant, so the topmost
// marked node stands for the content under it.
const covering = (list: readonly Occurrence[]) => {
  const out: Occurrence[] = [];
  let top: Occurrence | null = null;

  for (const occurrence of list) {
    if (
      top &&
      isContent(occurrence.mark) &&
      occurrence.mark.kind === top.mark.kind &&
      occurrence.root === top.root &&
      top.path.every((index, depth) => occurrence.path[depth] === index)
    ) {
      continue;
    }
    out.push(occurrence);
    if (isContent(occurrence.mark)) top = occurrence;
  }

  return out;
};

const FNV_OFFSET = 0x81_1c_9d_c5;
const FNV_PRIME = 0x01_00_01_93;
const mix = (value: number, part: number) =>
  Math.imul(value ^ part, FNV_PRIME) >>> 0;
const hash = (input: string) => {
  let value = FNV_OFFSET;

  for (let index = 0; index < input.length; index++) {
    value = mix(value, input.charCodeAt(index));
  }

  return value;
};
const MARKS = new WeakMap<object, number>();
const SUBTREES = new WeakMap<object, number>();

const markHash = (mark: AuthoredMark) => {
  let value = MARKS.get(mark);

  if (value === undefined) {
    value = hash(JSON.stringify(mark));
    MARKS.set(mark, value);
  }

  return value;
};

const subtreeHash = (node: Node): number => {
  let value = SUBTREES.get(node);

  if (value === undefined) {
    const { children, ...own } = node;

    value = hash(JSON.stringify(own));
    for (const child of children ?? []) value = mix(value, subtreeHash(child));
    SUBTREES.set(node, value);
  }

  return value;
};

const SHAPES = new WeakMap<object, number>();

// An element's own fields and the shapes of its element children, never
// text or leaves, so typing inside it keeps its shape.
const shapeHash = (node: Node): number => {
  let value = SHAPES.get(node);

  if (value === undefined) {
    const { children, ...own } = node;

    value = hash(JSON.stringify(own));
    for (const child of children ?? []) {
      if (!isText(child)) value = mix(value, shapeHash(child));
    }
    SHAPES.set(node, value);
  }

  return value;
};

/** @internal */
export const sameShape = (left: Node, right: Node) =>
  shapeHash(left) === shapeHash(right);

/** @internal */
export const isStructureMark = (mark: AuthoredMark) =>
  KINDS[mark.kind] === 'structure';

/**
 * One top-level block's part of a change's revision, from the change's
 * occurrences in it, each with its path inside the block.
 *
 * @internal
 */
export const blockRevisionOf = (
  root: string,
  list: ReadonlyArray<Pick<Occurrence, 'mark' | 'node' | 'path'>>
) => {
  let value = mix(FNV_OFFSET, hash(root));

  for (const { mark, node, path } of list) {
    if (isLineBreak(mark)) {
      value = mix(value, path.length);
      for (const index of path) value = mix(value, index);
    }
    value = mix(value, markHash(mark));
    value = mix(
      value,
      KINDS[mark.kind] === 'structure' ? shapeHash(node) : subtreeHash(node)
    );
  }

  return value;
};

// Blocks add their parts, so a key in one block of a change that spans many
// moves the revision by that block's part alone.
const revisionOf = (list: readonly Occurrence[]) => {
  let revision = 0;
  let start = 0;

  for (let at = 1; at <= list.length; at++) {
    const first = list[start];
    const next = list[at];

    if (next && next.root === first.root && next.path[0] === first.path[0]) {
      continue;
    }
    revision =
      (revision +
        blockRevisionOf(
          first.root,
          list.slice(start, at).map((occurrence) => ({
            ...occurrence,
            path: occurrence.path.slice(1),
          }))
        )) >>>
      0;
    start = at;
  }

  return revision;
};

/**
 * The change one id's occurrences make; `list` holds them in document order.
 *
 * @internal
 */
export const changeOf = (
  id: string,
  list: readonly Occurrence[]
): AuthoredChange => {
  const kinds = new Set(
    list.flatMap(({ mark }) => (keepsValue(mark) ? [] : [KINDS[mark.kind]]))
  );
  const ranges: Range[] = [];
  const covered = covering(list);

  covered.forEach((occurrence, index) => {
    const range = rangeOf(occurrence);
    const previous = covered[index - 1];
    const last = ranges.at(-1);

    if (
      previous &&
      last &&
      isText(previous.node) &&
      isText(occurrence.node) &&
      touches(previous, occurrence)
    ) {
      ranges[ranges.length - 1] = { anchor: last.anchor, focus: range.focus };
    } else {
      ranges.push(range);
    }
  });

  return Object.freeze({
    authorId: list[0].mark.author,
    createdAt: Math.min(...list.map(({ mark }) => mark.at)),
    id,
    kind: kinds.size === 1 ? [...kinds][0] : 'mixed',
    ranges: Object.freeze(ranges),
    revision: revisionOf(list),
  });
};

/** @internal */
export const orderChanges = (changes: Iterable<AuthoredChange>) =>
  [...changes].sort(
    (left, right) =>
      left.createdAt - right.createdAt ||
      (left.id < right.id ? -1 : left.id > right.id ? 1 : 0)
  );

/**
 * An occurrence in its top-level block, `from` the token its node opens at
 * there.
 *
 * @internal
 */
export type BlockOccurrence = Omit<Occurrence, 'root'> & { from: number };

/** @internal */
export const blockOccurrencesOf = (
  block: Node,
  read: (node: Node) => readonly AuthoredMark[]
) => {
  const ends = new Map<string, BlockOccurrence>();
  const occurrences = new Map<string, BlockOccurrence[]>();
  const ordered: Array<Readonly<{ from: number; id: string; path: Path }>> = [];
  const joinsAndSplits: Array<Readonly<{ from: number; id: string }>> = [];
  let tokens = 0;
  let units = 0;
  const walk = (node: Node, path: Path) => {
    const from = tokens;
    const placed = read(node).map((mark) => {
      const occurrence = {
        first: units,
        from,
        last: units - 1,
        mark,
        node,
        path,
      };
      const list = occurrences.get(mark.change) ?? [];

      list.push(occurrence);
      occurrences.set(mark.change, list);
      ends.set(mark.change, occurrence);
      ordered.push({ from, id: mark.change, path });
      if (path.length > 0 && isLineBreak(mark)) {
        joinsAndSplits.push({ from, id: mark.change });
      }

      return occurrence;
    });
    const start = units;

    if (isText(node)) {
      tokens += (node.text?.length ?? 0) + 2;
      if (node.text) units += 1;
    } else {
      tokens += 1;
      if (node.children) {
        node.children.forEach((child, index) => walk(child, [...path, index]));
        if (units === start) units += 1;
      }
      tokens += 1;
    }
    for (const occurrence of placed) {
      if (!isLineBreak(occurrence.mark)) occurrence.last = units - 1;
      if (isContent(occurrence.mark)) {
        ends.set(occurrence.mark.change, occurrence);
      }
    }
  };

  walk(block, []);

  return { ends, joinsAndSplits, occurrences, ordered, units };
};

/** @internal */
export const placeOccurrence = (
  { first, last, mark, node, path }: BlockOccurrence,
  root: string,
  rank: number,
  before: number
): Occurrence => ({
  first: first + before,
  last: last + before,
  mark,
  node,
  path: [rank, ...path],
  root,
});

export const indexAuthoredChanges = (
  value: JsonEditorValue
): AuthoredChangeIndex => {
  const facts = factsOf(value);
  const read = (node: Node) => marksOf(node, facts);
  const occurrences = new Map<string, Occurrence[]>();

  for (const [root, children] of [
    ['main', value.children] as const,
    ...Object.entries(value.roots ?? {}),
  ]) {
    let before = 0;

    children.forEach((block, rank) => {
      const local = blockOccurrencesOf(block, read);

      for (const [id, list] of local.occurrences) {
        const placed = occurrences.get(id) ?? [];

        for (const occurrence of list) {
          placed.push(placeOccurrence(occurrence, root, rank, before));
        }
        occurrences.set(id, placed);
      }
      before += local.units;
    });
  }

  const changes = new Map(
    [...occurrences].map(([id, list]) => [id, changeOf(id, list)] as const)
  );

  return { changes, occurrences, ordered: orderChanges(changes.values()) };
};

const unmarked = (node: Node): Node => {
  const { [AUTHORED_MARKS_KEY]: _members, ...plain } = node;

  return plain.children
    ? { ...plain, children: plain.children.map(unmarked) }
    : plain;
};

const sliceOf = (nodes: readonly Node[]): ContentSlice => ({
  content: nodes.map(unmarked) as ContentSlice['content'],
  openEnd: 0,
  openStart: 0,
});

export type AuthoredChangeLookup = Readonly<{
  changes: Pick<ReadonlyMap<string, AuthoredChange>, 'get'>;
  occurrences: Pick<ReadonlyMap<string, readonly Occurrence[]>, 'get'>;
}>;

export const readAuthoredDetails = (
  index: AuthoredChangeLookup,
  id: string
): AuthoredChangeDetails | null => {
  const change = index.changes.get(id);

  if (!change) return null;

  const parts: AuthoredChangePart[] = [];
  // A run of touching content occurrences with one action becomes one part.
  const open: {
    run: {
      action: 'delete' | 'insert';
      last: Occurrence;
      nodes: Node[];
      range: Range;
    } | null;
  } = { run: null };
  const flush = () => {
    const { run } = open;

    if (!run) return;

    const previous = parts.at(-1);
    const slice = sliceOf(run.nodes);

    if (
      run.action === 'insert' &&
      previous?.kind === 'content' &&
      previous.action === 'delete'
    ) {
      parts[parts.length - 1] = {
        ...previous,
        action: 'replace',
        after: slice,
        range: { anchor: previous.range.anchor, focus: run.range.focus },
      };
    } else {
      parts.push({
        action: run.action,
        after: run.action === 'insert' ? slice : null,
        before: run.action === 'delete' ? slice : null,
        kind: 'content',
        range: run.range,
      });
    }
    open.run = null;
  };

  for (const occurrence of covering(index.occurrences.get(id) ?? [])) {
    const { mark, node, path } = occurrence;

    if (keepsValue(mark)) continue;
    if (mark.kind === 'insert' || mark.kind === 'delete') {
      const range = rangeOf(occurrence);

      const { run } = open;

      if (run?.action === mark.kind && touches(run.last, occurrence)) {
        run.nodes.push(node);
        run.last = occurrence;
        run.range = { anchor: run.range.anchor, focus: range.focus };
        continue;
      }
      flush();
      open.run = { action: mark.kind, last: occurrence, nodes: [node], range };
      continue;
    }
    flush();
    if (mark.kind === 'format') {
      parts.push({
        after:
          mark.write.kind === 'set' ? { [mark.key]: mark.write.value } : {},
        before: Object.hasOwn(mark, 'before')
          ? { [mark.key]: mark.before }
          : {},
        kind: 'properties',
        nodeKind: isText(node) ? 'text' : 'element',
        path,
      });
    } else if (mark.kind === 'join' || mark.kind === 'split') {
      parts.push({
        action: mark.kind,
        at: rangeOf(occurrence).anchor,
        kind: 'boundary',
      });
    } else {
      parts.push({
        action: mark.kind,
        kind: 'enclosure',
        path,
        type: typeof node.type === 'string' ? node.type : '',
      });
    }
  }
  flush();

  return Object.freeze({ change, parts: Object.freeze(parts) });
};

/**
 * The kernel's cards: adjacent pending changes by one author, each card's
 * changes in document order and the cards in the order the document shows
 * them. The review ledger's card sequence must give the same cards.
 *
 * @internal
 */
export const groupAuthoredChanges = (
  index: AuthoredChangeIndex
): ReadonlyArray<readonly AuthoredChange[]> => {
  const groups: Array<{ changes: AuthoredChange[]; last: Occurrence }> = [];
  const placed = [...index.changes.values()].flatMap((change) => {
    const list = index.occurrences.get(change.id) ?? [];
    const first = list[0];
    const last = list.at(-1);

    if (!first || !last) return [];

    const end =
      list.find(
        (occurrence) =>
          isContent(occurrence.mark) &&
          occurrence.root === last.root &&
          (isInside(occurrence.path, last.path) ||
            occurrence.path.join(',') === last.path.join(','))
      ) ?? last;

    return [{ change, first, last: end }];
  });

  for (const { change, first, last } of placed.sort((left, right) =>
    compareOccurrences(left.first, right.first)
  )) {
    const group = groups.at(-1);

    if (
      group &&
      group.changes[0].authorId === change.authorId &&
      continues(group.last, first)
    ) {
      group.changes.push(change);
      group.last = last;
    } else {
      groups.push({ changes: [change], last });
    }
  }

  return groups.map(({ changes }) => changes);
};

const compareOccurrences = (left: Occurrence, right: Occurrence) => {
  if (left.root !== right.root) {
    return left.root === 'main'
      ? -1
      : right.root === 'main'
        ? 1
        : left.root < right.root
          ? -1
          : 1;
  }

  for (
    let depth = 0;
    depth < Math.min(left.path.length, right.path.length);
    depth++
  ) {
    if (left.path[depth] !== right.path[depth]) {
      return left.path[depth] - right.path[depth];
    }
  }

  return left.path.length - right.path.length;
};
