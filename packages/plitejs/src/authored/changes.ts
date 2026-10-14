import type { JsonEditorValue } from '../core/change/tokens';
import type { ContentSlice } from '../interfaces/editor';
import type { Path } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import type { Range } from '../interfaces/range';
import { isMetadataRootKey } from '../internal/root-location';
import { factsOf, marksOf } from './facts/facts';
import { type AuthoredMark, AUTHORED_MARKS_KEY } from './tree/marks';
import type {
  AuthoredChange,
  AuthoredChangeDetails,
  AuthoredChangeGroup,
  AuthoredChangeKind,
  AuthoredChangePart,
} from './types';

type Node = Readonly<Record<string, unknown>> & {
  children?: readonly Node[];
  text?: string;
};

type Occurrence = Readonly<{
  /**
   * The first and last unit of content under the node, counted in its root.
   * A non-empty text is a unit, and so is an element without one, such as a
   * mention.
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

// Content also touches across an inline edge, such as text that runs out of a
// link, when one end's text sits in the other's parent. It never touches
// across a block edge.
const touches = (left: Occurrence, right: Occurrence) => {
  if (left.root !== right.root) return false;
  if (
    left.path.join(',') === right.path.join(',') ||
    isNextSibling(left.path, right.path)
  ) {
    return true;
  }
  if (right.first !== left.last + 1) return false;

  const [, end] = edgeText(left.node, left.path, true);
  const [, start] = edgeText(right.node, right.path, false);

  return isInside(start.slice(0, -1), end) || isInside(end.slice(0, -1), start);
};

const isContent = (mark: AuthoredMark) =>
  mark.kind === 'insert' || mark.kind === 'delete';

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
const HASHES = new WeakMap<object, number>();
const hashFrozen = (key: object, input: () => string) => {
  let value = HASHES.get(key);

  if (value === undefined) {
    value = hash(input());
    HASHES.set(key, value);
  }

  return value;
};

const ownContent = (node: Node) =>
  typeof node.text === 'string'
    ? node.text
    : typeof node.type === 'string'
      ? node.type
      : '';

const revisionOf = (list: readonly Occurrence[]) => {
  let value = FNV_OFFSET;

  for (const { mark, node, path, root } of list) {
    value = mix(value, hash(root));
    value = mix(value, path.length);
    for (const index of path) value = mix(value, index);
    value = mix(
      value,
      hashFrozen(mark, () => JSON.stringify(mark))
    );
    value = mix(
      value,
      hashFrozen(node, () => ownContent(node))
    );
  }

  return value;
};

export const indexAuthoredChanges = (
  value: JsonEditorValue
): AuthoredChangeIndex => {
  const facts = factsOf(value);
  const occurrences = new Map<string, Occurrence[]>();
  const walk = (
    nodes: readonly Node[],
    parent: Path,
    root: string,
    leaves: { count: number }
  ) => {
    nodes.forEach((node, index) => {
      const path = [...parent, index];
      const placed = marksOf(node, facts).map((mark) => {
        const occurrence = {
          first: leaves.count,
          last: leaves.count,
          mark,
          node,
          path,
          root,
        };
        const list = occurrences.get(mark.change) ?? [];

        list.push(occurrence);
        occurrences.set(mark.change, list);
        return occurrence;
      });

      const start = leaves.count;

      if (node.children) {
        walk(node.children, path, root, leaves);
        if (leaves.count === start) leaves.count += 1;
      } else if (node.text) {
        leaves.count += 1;
      }
      for (const occurrence of placed) occurrence.last = leaves.count - 1;
    });
  };

  walk(value.children, [], 'main', { count: 0 });
  for (const [root, children] of Object.entries(value.roots ?? {})) {
    if (!isMetadataRootKey(root)) walk(children, [], root, { count: 0 });
  }

  const changes = new Map<string, AuthoredChange>();

  for (const [id, list] of occurrences) {
    const kinds = new Set(list.map(({ mark }) => KINDS[mark.kind]));
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
    changes.set(
      id,
      Object.freeze({
        authorId: list[0].mark.author,
        createdAt: Math.min(...list.map(({ mark }) => mark.at)),
        id,
        kind: kinds.size === 1 ? [...kinds][0] : 'mixed',
        ranges: Object.freeze(ranges),
        revision: revisionOf(list),
      })
    );
  }

  return {
    changes,
    occurrences,
    ordered: [...changes.values()].sort(
      (left, right) =>
        left.createdAt - right.createdAt ||
        (left.id < right.id ? -1 : left.id > right.id ? 1 : 0)
    ),
  };
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

export const readAuthoredDetails = (
  index: AuthoredChangeIndex,
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
        after: { [mark.key]: node[mark.key] },
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

const GROUPS = new WeakMap<
  AuthoredChangeIndex,
  readonly AuthoredChangeGroup[]
>();

/** Adjacent pending changes by one author, ranked by creation. */
export const groupAuthoredChanges = (
  index: AuthoredChangeIndex
): readonly AuthoredChangeGroup[] => {
  const cached = GROUPS.get(index);
  if (cached) return cached;

  const groups: Array<{ changes: AuthoredChange[]; last: Occurrence }> = [];
  const placed = [...index.changes.values()].flatMap((change) => {
    const list = index.occurrences.get(change.id) ?? [];
    const first = list[0];
    const last = list.at(-1);

    return first && last ? [{ change, first, last }] : [];
  });

  for (const { change, first, last } of placed.sort((left, right) =>
    compareOccurrences(left.first, right.first)
  )) {
    const group = groups.at(-1);

    if (
      group &&
      group.changes[0].authorId === change.authorId &&
      touches(group.last, first)
    ) {
      group.changes.push(change);
      group.last = last;
    } else {
      groups.push({ changes: [change], last });
    }
  }

  const ranked = Object.freeze(
    groups
      .map(({ changes }) => ({
        authorId: changes[0].authorId,
        changes: Object.freeze(changes),
        createdAt: Math.min(...changes.map((change) => change.createdAt)),
        id: changes[0].id,
      }))
      .sort(
        (left, right) =>
          left.createdAt - right.createdAt ||
          (left.id < right.id ? -1 : left.id > right.id ? 1 : 0)
      )
      .map(({ createdAt: _createdAt, ...group }, rank) =>
        Object.freeze({ ...group, rank })
      )
  );

  GROUPS.set(index, ranked);
  return ranked;
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
