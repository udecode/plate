import {
  createInternalDocumentChange,
  type DocumentChange,
  valueRoot,
} from '../../core/change/document-change';
import { DocumentIndex } from '../../core/change/document-index';
import type { JsonRecord } from '../../core/change/json';
import { RootChange } from '../../core/change/root-change';
import type { JsonEditorValue } from '../../core/change/tokens';
import { getDefined } from '../../internal/get-defined';
import type { Dependencies } from '../facts/dependencies';
import { incarnationOf } from '../facts/records';
import {
  AUTHORED_MARKS_KEY,
  type AuthoredMark,
  type CutTag,
  readAuthoredMarks,
} from './marks';

type Node = JsonRecord & { children?: readonly Node[]; text?: string };

export const isCut = (mark: AuthoredMark): mark is CutTag =>
  mark.kind === 'split' && mark.cut !== undefined;

export const cutsOf = (node: unknown) => readAuthoredMarks(node).filter(isCut);

const isText = (node: Node) => typeof node.text === 'string';

/**
 * The element a rejected cut joins: the left fragment's properties and tags,
 * except the cut, the right fragment's other cut tags, and only the insert
 * and delete tags both fragments carry, over both fragments' children with
 * the nodes between them in the middle.
 */
const joinFragments = (
  left: Node,
  between: readonly Node[],
  right: Node,
  cut: string,
  dependencies: Dependencies
): Node => {
  const rightMarks = dependencies.marks(right);
  const sharedByRight = (mark: AuthoredMark) =>
    rightMarks.some(
      (other) =>
        other.kind === mark.kind && incarnationOf(other) === incarnationOf(mark)
    );
  const marks = [
    ...dependencies
      .marks(left)
      .filter((mark) =>
        isCut(mark)
          ? mark.cut !== cut
          : (mark.kind !== 'insert' && mark.kind !== 'delete') ||
            sharedByRight(mark)
      ),
    ...rightMarks.filter((mark) => isCut(mark) && mark.cut !== cut),
  ];
  const { children: _children, ...props } = left;

  return {
    ...dependencies.props(props, marks),
    children: [...(left.children ?? []), ...between, ...(right.children ?? [])],
  };
};

/** Tags one fragment carries and the other lacks, which a join would lose. */
const oneSided = (
  mine: readonly AuthoredMark[],
  theirs: readonly AuthoredMark[]
) =>
  mine.filter(
    (mark) =>
      !isCut(mark) &&
      !theirs.some(
        (other) =>
          other.kind === mark.kind &&
          incarnationOf(other) === incarnationOf(mark) &&
          (mark.kind !== 'format' ||
            (other.kind === 'format' && other.key === mark.key))
      )
  );

const contentMarksIn = (
  node: Node,
  dependencies: Dependencies
): AuthoredMark[] => [
  ...dependencies
    .marks(node)
    .filter((mark) => mark.kind === 'insert' || mark.kind === 'delete'),
  ...(node.children ?? []).flatMap((child) =>
    contentMarksIn(child, dependencies)
  ),
];

/**
 * One block's inline children with each rejected cut joined: the fragment
 * holding the cut's `end` and the later fragment holding its `start` become
 * one element, when every node the decision keeps between them is text. A
 * `start` fragment takes back the properties the split dropped only when the
 * decision keeps its `end` fragment nowhere, since a surviving `end` fragment
 * still holds them. A join waits on pending content between the
 * fragments and on any pending tag only one of them carries. `joined` maps
 * each new element to the left fragment it continues.
 */
export const joinRejectedCuts = (
  nodes: readonly Node[],
  decision: Readonly<{
    /** Reads each fragment's insertions, its context's included, and writes the join's. */
    dependencies: Dependencies;
    endSurvives: (cut: string) => boolean;
    rejected: (cut: CutTag) => boolean;
    survives: (node: Node) => boolean;
    wait: (marks: readonly AuthoredMark[]) => void;
  }>
): Readonly<{ joined: ReadonlyMap<Node, Node>; nodes: readonly Node[] }> => {
  const joined = new Map<Node, Node>();

  if (!nodes.some((node) => cutsOf(node).some(decision.rejected))) {
    return { joined, nodes };
  }

  const out: Node[] = [];

  for (const node of nodes) {
    let current = node;

    for (const start of cutsOf(node)) {
      if (start.side !== 'start' || !decision.rejected(start)) continue;

      const leftIndex = out.findLastIndex((candidate) =>
        cutsOf(candidate).some(
          (cut) => cut.cut === start.cut && cut.side === 'end'
        )
      );
      const left = out[leftIndex];

      if (!left || !decision.survives(left)) {
        if (!decision.endSurvives(start.cut)) {
          current = Object.assign({}, current, start.kept);
        }
        continue;
      }

      const between = out.slice(leftIndex + 1);

      if (between.some((other) => !isText(other) && decision.survives(other))) {
        continue;
      }
      const { dependencies } = decision;
      const leftMarks = dependencies.marks(left);
      const rightMarks = dependencies.marks(current);

      decision.wait([
        ...oneSided(leftMarks, rightMarks),
        ...oneSided(rightMarks, leftMarks),
        ...between.flatMap((other) => contentMarksIn(other, dependencies)),
      ]);
      out.splice(leftIndex);
      current = joinFragments(left, between, current, start.cut, dependencies);
      joined.set(current, joined.get(left) ?? left);
    }
    out.push(current);
  }

  return { joined, nodes: out };
};

type Holder = Readonly<{
  cuts: readonly CutTag[];
  path: readonly number[];
  root: string;
}>;
type SearchStart = Readonly<{ at: number; root: string }>;
type RemovedHolder = Holder & Readonly<{ searchStart: SearchStart | null }>;

const keyOf = (cut: string, side: CutTag['side']) => `${cut}:${side}`;

const rootsOf = (value: JsonEditorValue) =>
  new Map<string, readonly Node[]>([
    ['main', value.children],
    ...(Object.entries(value.roots ?? {}) as Array<[string, readonly Node[]]>),
  ]);

type TokenRange = readonly [from: number, to: number];
type ChangedRange = Readonly<{
  after: TokenRange | null;
  before: TokenRange;
  root: string;
}>;

const changedRanges = (
  change: DocumentChange,
  beforeIndexOf: (root: string) => DocumentIndex
) => {
  const ranges: ChangedRange[] = [];

  change.iterChangedRanges((name, fromBefore, toBefore, fromAfter, toAfter) => {
    const root = name ?? 'main';

    if (!change.deleteRoots.has(root)) {
      ranges.push({
        after: [fromAfter, toAfter],
        before: [fromBefore, toBefore],
        root,
      });
    }
  });
  for (const root of change.deleteRoots) {
    ranges.push({ after: null, before: [0, beforeIndexOf(root).length], root });
  }

  return ranges;
};

const holdersOpeningIn = function* (
  index: DocumentIndex,
  root: string,
  [from, to]: TokenRange
): Generator<[string, Holder]> {
  for (const entry of index.nodeRangesTouching(from, to)) {
    if (entry.kind !== 'element' || entry.from < from || entry.from >= to) {
      continue;
    }
    const cuts = cutsOf(index.node(entry.path));
    const holder = { cuts, path: entry.path, root };

    for (const cut of cuts) yield [keyOf(cut.cut, cut.side), holder];
  }
};

type SiblingRun = Readonly<{
  from: number;
  path: readonly number[];
  root: string;
  to: number;
}>;

const siblingRunAt = (
  index: DocumentIndex,
  root: string,
  at: number
): SiblingRun => {
  const boundary = index.childBoundaryAt(at);

  if (boundary) {
    return {
      from: boundary.index,
      path: boundary.parentPath,
      root,
      to: boundary.index,
    };
  }

  const deepest = getDefined(index.openContextAt(at).at(-1));
  const last = getDefined(deepest.path.at(-1));

  return { from: last, path: deepest.path.slice(0, -1), root, to: last + 1 };
};

const alternate = function* (
  left: Generator<Holder>,
  right: Generator<Holder>
): Generator<Holder> {
  let leftDone = false;
  let rightDone = false;

  while (!leftDone || !rightDone) {
    if (!leftDone) {
      const step = left.next();

      if (step.done) leftDone = true;
      else yield step.value;
    }
    if (!rightDone) {
      const step = right.next();

      if (step.done) rightDone = true;
      else yield step.value;
    }
  }
};

const holdersOutward = function* (
  afterRoots: ReadonlyMap<string, readonly Node[]>,
  start?: SiblingRun
): Generator<Holder> {
  const seen = new WeakSet<Node>();
  const subtree = function* (
    node: Node,
    path: readonly number[],
    root: string
  ): Generator<Holder> {
    if (seen.has(node)) return;
    seen.add(node);
    yield { cuts: cutsOf(node), path, root };
    for (const [index, child] of (node.children ?? []).entries()) {
      yield* subtree(child, [...path, index], root);
    }
  };
  const siblingsFrom = function* (
    nodes: readonly Node[],
    path: readonly number[],
    root: string,
    first: number,
    step: -1 | 1
  ): Generator<Holder> {
    for (let index = first; index >= 0 && index < nodes.length; index += step) {
      yield* subtree(getDefined(nodes[index]), [...path, index], root);
    }
  };

  if (start) {
    let { from, path, to } = start;

    for (;;) {
      const nodes =
        path.length === 0
          ? (afterRoots.get(start.root) ?? [])
          : (nodeAt(afterRoots.get(start.root) ?? [], path)?.children ?? []);

      for (let index = from; index < to; index += 1) {
        yield* subtree(getDefined(nodes[index]), [...path, index], start.root);
      }
      yield* alternate(
        siblingsFrom(nodes, path, start.root, from - 1, -1),
        siblingsFrom(nodes, path, start.root, to, 1)
      );
      if (path.length === 0) break;
      from = getDefined(path.at(-1));
      to = from + 1;
      path = path.slice(0, -1);
    }
  }
  for (const [root, nodes] of afterRoots) {
    if (root === start?.root) continue;
    for (const [index, node] of nodes.entries()) {
      yield* subtree(node, [index], root);
    }
  }
};

const nodeAt = (nodes: readonly Node[], path: readonly number[]) => {
  let node: Node | undefined;
  let children = nodes;

  for (const index of path) {
    node = children[index];
    children = node?.children ?? [];
  }

  return node;
};

/**
 * The change that moves the cuts of every fragment a transaction removed:
 * its `end` cuts go to the fragment before it in its family and its `start`
 * cuts to the fragment after it, each found through the removed fragment's
 * other cuts and, past a fragment that went too, through that one's. A cut
 * whose other side went as well was decided and moves nothing. Returns null
 * when nothing moves, otherwise the change over `after` and the index of each
 * root it changed.
 */
export const relinkCuts = (
  change: DocumentChange,
  before: JsonEditorValue,
  after: JsonEditorValue,
  afterIndexOf: (root: string) => DocumentIndex,
  beforeIndexOf: (root: string) => DocumentIndex = (root) =>
    DocumentIndex.fromValue(valueRoot(before, root))
): Readonly<{
  change: DocumentChange;
  indexes: ReadonlyMap<string, DocumentIndex>;
}> | null => {
  const was = new Map<string, RemovedHolder>();
  const is = new Map<string, Holder>();

  for (const range of changedRanges(change, beforeIndexOf)) {
    if (range.before[1] > range.before[0]) {
      const searchStart = range.after && {
        at: range.after[0],
        root: range.root,
      };

      for (const [key, holder] of holdersOpeningIn(
        beforeIndexOf(range.root),
        range.root,
        range.before
      )) {
        was.set(key, { ...holder, searchStart });
      }
    }
    if (range.after && range.after[1] > range.after[0]) {
      for (const [key, holder] of holdersOpeningIn(
        afterIndexOf(range.root),
        range.root,
        range.after
      )) {
        is.set(key, holder);
      }
    }
  }

  const lost = [...was.keys()].filter((key) => !is.has(key));

  if (lost.length === 0) return null;

  const afterRoots = rootsOf(after);
  const found = new Map<string, Holder>();
  const searches = new Map<SearchStart | null, Generator<Holder>>();
  let everyRootRead = false;
  const find = (key: string, start: SearchStart | null): Holder | null => {
    const holder = is.get(key) ?? found.get(key);

    if (holder) return holder;
    // A side the transaction replaced and did not keep is gone.
    if (was.has(key) || everyRootRead) return null;
    let search = searches.get(start);

    if (!search) {
      search = holdersOutward(
        afterRoots,
        start
          ? siblingRunAt(afterIndexOf(start.root), start.root, start.at)
          : undefined
      );
      searches.set(start, search);
    }
    // Pulled by hand: leaving a for-of loop would close the search.
    for (let step = search.next(); !step.done; step = search.next()) {
      const read = step.value;

      for (const cut of read.cuts) found.set(keyOf(cut.cut, cut.side), read);
      if (found.get(key) === read) return read;
    }
    everyRootRead = true;

    return null;
  };
  const other = (side: CutTag['side']) => (side === 'end' ? 'start' : 'end');
  const survivorFrom = (
    holder: RemovedHolder,
    side: CutTag['side'],
    seen: Set<Holder>
  ): Holder | null => {
    if (seen.has(holder)) return null;
    seen.add(holder);
    for (const cut of holder.cuts) {
      if (cut.side === side) continue;
      const key = keyOf(cut.cut, other(cut.side));
      const next = find(key, holder.searchStart);

      if (next) return next;
      const previous = was.get(key);
      const reached = previous && survivorFrom(previous, side, seen);

      if (reached) return reached;
    }

    return null;
  };
  const moves = new Map<string, Map<string, CutTag[]>>();

  for (const key of lost) {
    const holder = getDefined(was.get(key));
    const cut = getDefined(
      holder.cuts.find((item) => keyOf(item.cut, item.side) === key)
    );

    if (!find(keyOf(cut.cut, other(cut.side)), holder.searchStart)) continue;
    const target = survivorFrom(holder, cut.side, new Set());

    if (!target) continue;
    const byPath = moves.get(target.root) ?? new Map<string, CutTag[]>();
    const at = target.path.join(',');

    byPath.set(at, [...(byPath.get(at) ?? []), cut]);
    moves.set(target.root, byPath);
  }
  if (moves.size === 0) return null;

  const changes = new Map<string, RootChange>();
  const indexes = new Map<string, DocumentIndex>();

  for (const [root, byPath] of moves) {
    const index = afterIndexOf(root);
    const rootChange = RootChange.create(
      index,
      [...byPath].map(([at, cuts]) => {
        const { from } = index.nodeRange(at.split(',').map(Number));

        return {
          from,
          properties: { add: { [AUTHORED_MARKS_KEY]: cuts } },
          to: from + 1,
        };
      })
    );

    changes.set(root, rootChange);
    indexes.set(root, rootChange.apply(index));
  }

  return { change: createInternalDocumentChange(changes), indexes };
};
