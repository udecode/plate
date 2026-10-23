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
import { splitHistoryOf } from './layers';
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

/**
 * What a join keeps, without children: the properties `{ ...right, ...left }`
 * over the keys the left holds, each key's format tags from the half that
 * supplies the key, the left's other marks, and the right's other cut tags.
 * The tags a split wrote on the right stand for the left's, so none joins.
 * `cut` is null for a block, whose split leaves no cut tag. An inline join
 * drops the cut and any insert or delete tag the right lacks, since the
 * element's tags cover all of its content. A block keeps them, since the
 * line it takes in keeps its own tags on its children.
 */
export const joinedShell = (
  left: Node,
  right: Node,
  cut: string | null,
  dependencies: Dependencies,
  leftHolds: (key: string) => boolean
): Node => {
  const rightMarks = dependencies.marks(right);
  const history = splitHistoryOf(rightMarks);
  const { children: _left, ...props } = left;
  const {
    children: _right,
    [AUTHORED_MARKS_KEY]: _rightMarks,
    ...rightProps
  } = right;

  for (const key of new Set([
    ...Object.keys(props),
    ...Object.keys(rightProps),
  ])) {
    if (key === AUTHORED_MARKS_KEY || leftHolds(key)) continue;
    if (Object.hasOwn(rightProps, key)) props[key] = rightProps[key];
    else delete props[key];
  }
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
          : cut === null ||
            (mark.kind !== 'insert' && mark.kind !== 'delete') ||
            sharedByRight(mark)
      ),
    ...rightMarks.filter((mark) =>
      isCut(mark)
        ? mark.cut !== cut
        : mark.kind === 'format' && !history.has(mark) && !leftHolds(mark.key)
    ),
  ];

  return dependencies.props(props, marks);
};

/**
 * The right half of a rejected cut whose left half stays apart from it: the
 * tags its split wrote leave, as when the cut is accepted, so it keeps the
 * split's output and never takes the left half's value of a dropped key.
 */
const apartFrom = (node: Node, dependencies: Dependencies): Node => {
  const marks = dependencies.marks(node);
  const history = splitHistoryOf(marks);
  const kept = marks.filter((mark) => !history.has(mark));

  if (kept.length === marks.length) return node;

  const { children, ...props } = node;

  return {
    ...dependencies.props(props, kept),
    ...(children ? { children } : {}),
  };
};

/**
 * One block's inline children with each rejected cut joined: the fragment
 * holding the cut's `end` and the later fragment holding its `start` become
 * one element when `join` says so. `joined` maps each new element to the
 * left fragment it continues. A later fragment whose left fragment survives
 * apart from it, here or in another block, keeps the split's output.
 */
export const joinRejectedCuts = (
  nodes: readonly Node[],
  decision: Readonly<{
    /** Reads each fragment's insertions, its context's included, and writes the join's. */
    dependencies: Dependencies;
    /**
     * The keys the left fragment supplies when the fragments join, or null
     * when they stay apart: `left` as this list holds it, `original` the
     * fragment it continues, and the nodes `between` them.
     */
    join: (
      halves: Readonly<{
        between: readonly Node[];
        cut: CutTag;
        left: Node;
        original: Node;
        right: Node;
      }>
    ) => ((key: string) => boolean) | null;
    rejected: (cut: CutTag) => boolean;
    /** Whether a cut's left fragment in another block stands when the cut decides. */
    standsApart: (cut: CutTag) => boolean;
    survives: (node: Node) => boolean;
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

      if (!left) {
        if (decision.standsApart(start)) {
          current = apartFrom(current, decision.dependencies);
        }
        continue;
      }
      if (!decision.survives(left)) continue;

      const between = out.slice(leftIndex + 1);
      const original = joined.get(left) ?? left;

      const leftHolds = decision.join({
        between,
        cut: start,
        left,
        original,
        right: current,
      });

      if (!leftHolds) {
        current = apartFrom(current, decision.dependencies);
        continue;
      }
      out.splice(leftIndex);
      current = {
        ...joinedShell(
          left,
          current,
          start.cut,
          decision.dependencies,
          leftHolds
        ),
        children: [
          ...(left.children ?? []),
          ...between,
          ...(current.children ?? []),
        ],
      };
      joined.set(current, original);
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
