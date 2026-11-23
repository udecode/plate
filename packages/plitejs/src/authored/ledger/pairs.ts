import type { DocumentIndex } from '../../core/change/document-index';
import type { JsonNode } from '../../core/change/tokens';
import { getDefined } from '../../internal/get-defined';
import { type BlockOccurrence, isStructureMark, sameShape } from '../changes';
import { isEditingChange } from '../facts/editing';
import { tokenLength } from '../tree/alignment';
import { isTextBlock } from '../tree/resolve';
import { countLedgerWork } from './work';

export type PairedChanges = Readonly<{
  /**
   * The join and block split occurrences inside the block, below its own
   * node, by where their nodes open, in pre-order. An inline element's split
   * is not one.
   */
  joinsAndSplits: ReadonlyArray<Readonly<{ from: number; id: string }>>;
  occurrences: ReadonlyMap<string, readonly BlockOccurrence[]>;
  /** Each occurrence's change and where its node opens in the block, in pre-order. */
  ordered: ReadonlyArray<Readonly<{ from: number; id: string }>>;
}>;

/** A stored token range of one root. */
export type Span = readonly [
  from: number,
  to: number,
  /** The only preview whose blocks it names. */
  mode?: 'accepted' | 'proposed',
];

// The preview that shows a line a split or join mark is on inside the line
// before it: the split rejected or the join accepted.
const MERGED_IN: Partial<Record<string, 'accepted' | 'proposed'>> = {
  join: 'proposed',
  split: 'accepted',
};

export type Pairing = {
  /**
   * What a node is in both versions: its node key where it has one, which
   * stays with a block a commit rewrites or moves, or else the node itself.
   */
  identity: (node: JsonNode) => unknown;
  /**
   * The new ranges of the blocks whose pairs were gained or lost, or null
   * when only `touched` is read.
   */
  sites: Span[] | null;
  /** The changes whose occurrences may differ. */
  touched: Set<string>;
  /**
   * Whether the two sides read under different verdicts, so a node both
   * keep may still pair other changes.
   */
  verdicts: boolean;
};

/** One version of a top-level block and where it starts in its root. */
export type PairedSide = Readonly<{ changes: PairedChanges; start: number }>;

export type PairedBlock = Readonly<{ block: JsonNode; changes: PairedChanges }>;

const firstAt = (
  list: ReadonlyArray<Readonly<{ from: number }>>,
  from: number
) => {
  let low = 0;
  let high = list.length;

  while (low < high) {
    const middle = (low + high) >> 1;

    if (getDefined(list[middle]).from < from) low = middle + 1;
    else high = middle;
  }

  return low;
};

export const firstFrom = (changes: PairedChanges, from: number) =>
  firstAt(changes.ordered, from);

const idsIn = (
  changes: PairedChanges,
  from: number,
  to: number,
  into: Set<string>
) => {
  for (
    let at = firstFrom(changes, from);
    at < changes.ordered.length && getDefined(changes.ordered[at]).from < to;
    at += 1
  ) {
    into.add(getDefined(changes.ordered[at]).id);
  }

  return into;
};

const holdsChanges = (changes: PairedChanges, node: JsonNode, at: number) => {
  const first = changes.ordered[firstFrom(changes, at)];

  return !!first && first.from < at + tokenLength(node);
};

const isAtomic = (node: JsonNode) =>
  typeof node.text === 'string' || isTextBlock(node);

/**
 * The pending changes on `node` itself or on its own text, never on a block
 * inside it: a block's pairs, keyed to compare. Editing's own marks hold no
 * card, so no read shows them.
 */
const pairsOf = (changes: PairedChanges, node: JsonNode, at: number) => {
  countLedgerWork('pairsCompared');

  return [
    ...idsIn(
      changes,
      at,
      isAtomic(node) ? at + tokenLength(node) : at + 1,
      new Set()
    ),
  ]
    .filter((id) => !isEditingChange(id))
    .sort()
    .join('\n');
};

const ownIds = (changes: PairedChanges, at: number, into: Set<string>) =>
  idsIn(changes, at, at + 1, into);

const mergedIn = ({ at, changes }: Side) => {
  const modes = new Set<'accepted' | 'proposed'>();

  for (const id of ownIds(changes, at, new Set())) {
    for (const { from, mark } of changes.occurrences.get(id) ?? []) {
      const mode = from === at ? MERGED_IN[mark.kind] : undefined;

      if (mode) modes.add(mode);
    }
  }

  return modes;
};

const onlyStructure = (changes: PairedChanges, ids: Set<string>, at: number) =>
  [...ids].every((id) =>
    (changes.occurrences.get(id) ?? []).every(
      (occurrence) => occurrence.from !== at || isStructureMark(occurrence.mark)
    )
  );

// A block replaced by another element, such as the quote a wrap adds around
// it, takes another node key.
const sameElement = (left: JsonNode, right: JsonNode) =>
  typeof left.text === 'string' ||
  typeof right.text === 'string' ||
  sameShape(left, right);

type Side = Readonly<{
  /** Where the node opens in its top-level block. */
  at: number;
  changes: PairedChanges;
  node: JsonNode;
  /** Where the node opens in its root. */
  site: number;
}>;

const site = (out: Pairing, from: number, to: number) => {
  out.sites?.push([from, to]);
};

/**
 * Add the sites of the previews that show a line inside the line before it,
 * as Accepted shows a split line and Proposed a joined one, where a line
 * stops or starts showing inside the line before it: the end of the line it
 * showed inside, and the line itself.
 */
const mergedSites = (
  before: readonly Side[],
  after: readonly Side[],
  moved: ReadonlyMap<unknown, Side>,
  left: readonly Side[],
  right: readonly Side[],
  from: number,
  out: Pairing
) => {
  if (!out.sites) return;

  const nextOf = new Map<Side, Side>();

  for (const next of after) {
    const old = moved.get(out.identity(next.node));

    if (old) nextOf.set(old, next);
  }
  left.forEach((old, offset) => nextOf.set(old, getDefined(right[offset])));

  const oldOf = new Map([...nextOf].map(([old, next]) => [next, old]));
  const oldRank = new Map(before.map((side, index) => [side, index]));
  const newRank = new Map(after.map((side, index) => [side, index]));
  // Whether `next` shows inside the counterpart of the line `old` shows
  // inside, the stretch's own neighbor when both open it.
  const sameLine = (old: Side, next: Side) => {
    const previous = before[getDefined(oldRank.get(old)) - 1];
    const now = after[getDefined(newRank.get(next)) - 1];

    return previous ? nextOf.get(previous) === now : now === undefined;
  };

  for (const [index, old] of before.entries()) {
    const next = nextOf.get(old);
    const kept = next && sameLine(old, next) ? mergedIn(next) : new Set();
    const previous = before[index - 1];
    const into = previous ? nextOf.get(previous) : undefined;
    const end = into ? into.site + tokenLength(into.node) : from;

    if (previous && !into) continue;
    for (const mode of mergedIn(old)) {
      if (!kept.has(mode) && end > 0) out.sites.push([end - 1, end, mode]);
    }
  }
  for (const next of after) {
    const old = oldOf.get(next);
    const kept = old && sameLine(old, next) ? mergedIn(old) : new Set();

    for (const mode of mergedIn(next)) {
      if (!kept.has(mode)) {
        out.sites.push([next.site, next.site + tokenLength(next.node), mode]);
      }
    }
  }
};

/**
 * Pair the nodes a commit replaced, `before` with `after`, whose new nodes
 * open at `from` in their root. A node both versions hold, by its
 * `identity`, pairs with itself, and the rest pair in order. Each new node
 * whose pairs differ is a site. When the stretch adds or removes a node or
 * changes one's element, and a pair in order differs or a node it adds or
 * removes holds a change, so is each new node paired in order, or where the
 * removed nodes stood when it adds none, since the nodes it splits, merges or
 * rewraps can show what another held, as a lifted child shows its quote's
 * unwrap.
 */
const pairRun = (
  before: readonly Side[],
  after: readonly Side[],
  from: number,
  out: Pairing,
  pair: (left: Side, right: Side, force: boolean) => void
) => {
  const { identity } = out;
  // A copy can carry the key of the node it copies, so only a key each
  // version holds once names one node.
  const once = (sides: readonly Side[]) => {
    const seen = new Map<unknown, Side | null>();

    for (const side of sides) {
      const id = identity(side.node);

      seen.set(id, seen.has(id) ? null : side);
    }

    return seen;
  };
  const kept = once(after);
  const moved = new Map<unknown, Side>();

  for (const [id, side] of once(before)) {
    if (side && kept.get(id)) moved.set(id, side);
  }

  const left = before.filter(({ node }) => !moved.has(identity(node)));
  const right = after.filter(({ node }) => !moved.has(identity(node)));
  const paired = Math.min(left.length, right.length);
  const differing: Side[] = [];
  let reshaped = left.length !== right.length;
  const compare = (old: Side, next: Side, force: boolean) => {
    if (
      pairsOf(old.changes, old.node, old.at) !==
      pairsOf(next.changes, next.node, next.at)
    ) {
      differing.push(next);
    }
    if (!sameElement(old.node, next.node)) reshaped = true;
    pair(old, next, force);
  };

  // A node both versions hold, rewritten or moved, pairs with itself; one
  // they hold unchanged pairs other changes only under another verdict.
  for (const next of after) {
    const old = moved.get(identity(next.node));

    if (old && (old.node !== next.node || out.verdicts)) {
      compare(old, next, old.node === next.node);
    }
  }

  const matched = differing.length;

  for (let offset = 0; offset < paired; offset += 1) {
    compare(getDefined(left[offset]), getDefined(right[offset]), false);
  }

  let holds = differing.length > matched;

  for (const side of [...left.slice(paired), ...right.slice(paired)]) {
    if (holdsChanges(side.changes, side.node, side.at)) {
      holds = true;
      idsIn(
        side.changes,
        side.at,
        side.at + tokenLength(side.node),
        out.touched
      );
    }
  }
  for (const next of differing) {
    site(out, next.site, next.site + tokenLength(next.node));
  }
  mergedSites(before, after, moved, left.slice(0, paired), right, from, out);
  if (!reshaped || !holds) return;
  for (const next of right) {
    site(out, next.site, next.site + tokenLength(next.node));
  }
  if (right.length > 0) return;

  // Only removals: the site is where the first removed node stood, which a
  // preview can show inside a merged line.
  const rank = new Map(before.map((side, index) => [side, index]));
  const removed = Math.min(...left.map((side) => getDefined(rank.get(side))));
  let point = from;

  for (const next of after) {
    const old = moved.get(identity(next.node));

    if (old && getDefined(rank.get(old)) < removed) {
      point = next.site + tokenLength(next.node);
    }
  }
  site(out, point, point);
};

/**
 * Pair `before` with `after`, the node that replaced it, opening at `oldAt`
 * and `newAt` in their top-level blocks. `force` compares a node both sides
 * keep, read under other verdicts.
 */
const pairNodes = (
  old: PairedSide,
  next: PairedSide,
  before: JsonNode,
  after: JsonNode,
  oldAt: number,
  newAt: number,
  out: Pairing,
  force = false
) => {
  if (before === after && !force) return;
  if (isAtomic(before) || isAtomic(after)) {
    idsIn(old.changes, oldAt, oldAt + tokenLength(before), out.touched);
    idsIn(next.changes, newAt, newAt + tokenLength(after), out.touched);
    return;
  }

  const own = ownIds(old.changes, oldAt, new Set());
  const nextOwn = ownIds(next.changes, newAt, new Set());

  // A structure change reads its element's shape, so typing inside one of its
  // blocks leaves it alone; any other change reads the content under it.
  if (
    force ||
    [...own].sort().join('\n') !== [...nextOwn].sort().join('\n') ||
    !onlyStructure(next.changes, nextOwn, newAt) ||
    !sameShape(before, after)
  ) {
    for (const id of own) out.touched.add(id);
    for (const id of nextOwn) out.touched.add(id);
  }
  pairChildren(
    old,
    next,
    before.children ?? [],
    after.children ?? [],
    oldAt + 1,
    newAt + 1,
    out,
    force
  );
};

/**
 * Pair the children a commit replaced, between the children both versions
 * keep, as `pairRun` pairs them.
 */
const pairChildren = (
  old: PairedSide,
  next: PairedSide,
  before: readonly JsonNode[],
  after: readonly JsonNode[],
  oldAt: number,
  newAt: number,
  out: Pairing,
  force: boolean
) => {
  let head = 0;
  let oldPosition = oldAt;
  let newPosition = newAt;
  // A child both versions keep pairs the same changes unless a verdict
  // changed what it holds.
  const kept = (left: JsonNode, oldStart: number, newStart: number) => {
    if (!out.verdicts) return;
    if (
      pairsOf(old.changes, left, oldStart) !==
      pairsOf(next.changes, left, newStart)
    ) {
      site(
        out,
        next.start + newStart,
        next.start + newStart + tokenLength(left)
      );
    }
    pairNodes(old, next, left, left, oldStart, newStart, out, true);
  };

  let oldEnd = before.length;
  let newEnd = after.length;
  let oldTail =
    oldAt + before.reduce((sum, node) => sum + tokenLength(node), 0);
  let newTail = newAt + after.reduce((sum, node) => sum + tokenLength(node), 0);
  const childrenEnd = newTail;

  // Under `force` every child is the same node, compared whole below.
  if (!force) {
    while (
      head < before.length &&
      head < after.length &&
      before[head] === after[head]
    ) {
      const left = getDefined(before[head]);

      kept(left, oldPosition, newPosition);
      oldPosition += tokenLength(left);
      newPosition += tokenLength(left);
      head += 1;
    }
    while (
      oldEnd > head &&
      newEnd > head &&
      before[oldEnd - 1] === after[newEnd - 1]
    ) {
      const left = getDefined(before[oldEnd - 1]);

      oldTail -= tokenLength(left);
      newTail -= tokenLength(left);
      kept(left, oldTail, newTail);
      oldEnd -= 1;
      newEnd -= 1;
    }
  }
  if (head === oldEnd && head === newEnd) return;

  const sides = (
    { changes, start }: PairedSide,
    nodes: readonly JsonNode[],
    from: number
  ) => {
    let at = from;

    return nodes.map((node) => {
      const side = { at, changes, node, site: start + at };

      at += tokenLength(node);

      return side;
    });
  };
  pairRun(
    sides(old, before.slice(head, oldEnd), oldPosition),
    sides(next, after.slice(head, newEnd), newPosition),
    next.start + newPosition,
    out,
    (left, right, again) =>
      pairNodes(
        old,
        next,
        left.node,
        right.node,
        left.at,
        right.at,
        out,
        force || again
      )
  );

  // A join or block split revision reads its path, which the stretch shifts
  // inside it, and after it when it adds or removes children.
  const shifted = before.length === after.length ? newTail : childrenEnd;
  const { joinsAndSplits } = next.changes;

  for (
    let at = firstAt(joinsAndSplits, newPosition);
    at < joinsAndSplits.length && getDefined(joinsAndSplits[at]).from < shifted;
    at += 1
  ) {
    out.touched.add(getDefined(joinsAndSplits[at]).id);
  }
};

/**
 * Pair the top-level blocks one stretch replaced, `before` from token
 * `oldFrom` with `after` from `newFrom`, as `pairRun` pairs them.
 */
export const pairStretch = (
  before: readonly PairedBlock[],
  after: readonly PairedBlock[],
  oldFrom: number,
  newFrom: number,
  out: Pairing
) => {
  const sides = (blocks: readonly PairedBlock[], from: number) => {
    let start = from;

    return blocks.map(({ block, changes }) => {
      const side = { at: 0, changes, node: block, site: start };

      start += tokenLength(block);

      return side;
    });
  };

  pairRun(
    sides(before, oldFrom),
    sides(after, newFrom),
    newFrom,
    out,
    (left, right, force) =>
      pairNodes(
        { changes: left.changes, start: left.site },
        { changes: right.changes, start: right.site },
        left.node,
        right.node,
        0,
        0,
        out,
        force
      )
  );
};

/** Where the block at `rank` of `index` opens, or its end past the last. */
export const startOf = (index: DocumentIndex, rank: number) =>
  rank >= index.size ? index.length : index.childPosition([], rank);

/** The rank of the top-level block of `index` holding `position`. */
export const rankAt = (index: DocumentIndex, position: number) => {
  let low = 0;
  let high = index.size - 1;

  while (low < high) {
    const middle = Math.ceil((low + high) / 2);

    if (startOf(index, middle) <= position) low = middle;
    else high = middle - 1;
  }

  return low;
};

/**
 * Where `spans` of `from` land in `to`, a later version of its root: a span
 * inside a block `to` replaced covers the block of the same `identity`, or
 * what replaced it when none is.
 */
export const mapSpans = (
  from: DocumentIndex,
  to: DocumentIndex,
  spans: readonly Span[],
  identity: Pairing['identity']
): Span[] => {
  if (from === to) return [...spans];

  const edits = from.changedChildren(to);
  let placed: Map<unknown, number> | null = null;
  // A block moved past unchanged ones lands in another edit than it left.
  const counterpartInAnyEdit = (rank: number) => {
    if (!placed) {
      placed = new Map();
      for (const edit of edits) {
        for (let next = edit[2]; next < edit[3]; next += 1) {
          const id = identity(getDefined(to.nodes.at(next)));

          if (!placed.has(id)) placed.set(id, next);
        }
      }
    }

    return placed.get(identity(getDefined(from.nodes.at(rank)))) ?? -1;
  };
  const counterpartInEdit = (
    edit: readonly [number, number, number, number],
    rank: number
  ) => {
    const id = identity(getDefined(from.nodes.at(rank)));

    for (let next = edit[2]; next < edit[3]; next += 1) {
      if (identity(getDefined(to.nodes.at(next))) === id) return next;
    }

    return -1;
  };
  const inside = (
    edit: readonly [number, number, number, number],
    position: number,
    end: boolean
  ) => {
    const [fromA, toA, fromB, toB] = edit;
    let rank = fromA;

    while (
      rank < toA - 1 &&
      (end
        ? position > startOf(from, rank + 1)
        : position >= startOf(from, rank + 1))
    ) {
      rank += 1;
    }

    const next = counterpartInAnyEdit(rank);

    if (next !== -1) return startOf(to, end ? next + 1 : next);

    // A removed node's site covers the nodes the edit added, or is where
    // the node stood when it added none.
    const kept = new Set<number>();

    for (let old = fromA; old < toA; old += 1) {
      kept.add(counterpartInEdit(edit, old));
    }

    const added: number[] = [];

    for (let at = fromB; at < toB; at += 1) if (!kept.has(at)) added.push(at);
    if (added.length > 0) {
      return startOf(
        to,
        end ? getDefined(added.at(-1)) + 1 : getDefined(added[0])
      );
    }
    for (let old = rank + 1; old < toA; old += 1) {
      const after = counterpartInEdit(edit, old);

      if (after !== -1) return startOf(to, after);
    }

    return startOf(to, toB);
  };
  const map = (position: number, end: boolean) => {
    let shift = 0;

    for (const edit of edits) {
      const oldFrom = startOf(from, edit[0]);
      const oldTo = startOf(from, edit[1]);

      if (end ? position <= oldFrom : position < oldFrom) break;
      if (end ? position <= oldTo : position < oldTo) {
        return inside(edit, position, end);
      }
      shift = startOf(to, edit[3]) - oldTo;
    }

    return position + shift;
  };

  return spans.map(([head, tail, mode]) => {
    const mapped = map(head, false);

    return [mapped, Math.max(mapped, map(tail, true)), mode];
  });
};
