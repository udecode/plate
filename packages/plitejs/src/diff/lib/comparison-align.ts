import type {
  ComparisonDocumentIndex,
  ComparisonIndexNode,
} from './comparison-index';
import { disjointSets } from './comparison-internal';
import type { ComparedChange, ComparisonEffect } from './comparison-types';

type Range = Readonly<{ from: number; to: number }>;

export type Sides<T> = Readonly<{ after: T; before: T }>;

export type Footprint = Readonly<{
  effect: ComparisonEffect;
  from: number;
  owner: string;
  to: number;
}>;

export type Unit = Readonly<{
  element: ComparisonIndexNode | null;
  from: number;
  nodes: readonly ComparisonIndexNode[];
  to: number;
}>;

export type WholeRange = {
  effects: Set<string>;
  end: number;
  footprints: Footprint[];
  start: number;
};

export type Classified = Readonly<{
  inside: ReadonlyMap<number, readonly Footprint[]>;
  ranges: readonly WholeRange[];
}>;

export type DescribedPairs = ReadonlyMap<string, Range>;

export type Anchor = Readonly<{
  after: number;
  before: number;
  ranges: Sides<WholeRange> | null;
}>;

type UnitSpan = Readonly<{ end: number; start: number }>;

export type AlignStep =
  | Readonly<{ anchor: Anchor; kind: 'anchor' }>
  | Readonly<{
      after: UnitSpan | null;
      before: UnitSpan | null;
      footprints: Sides<readonly Footprint[]>;
      kind: 'run';
    }>;

type AlignInput = Readonly<{
  classified: Sides<Classified>;
  described: DescribedPairs;
  root: string | null;
  units: Sides<readonly Unit[]>;
}>;

const SIDES = ['before', 'after'] as const;

export const unitsOf = (
  index: ComparisonDocumentIndex,
  childIndexes: readonly number[]
): readonly Unit[] => {
  const units: Unit[] = [];
  let stretch: ComparisonIndexNode[] = [];
  const flush = () => {
    const first = stretch[0];
    const last = stretch.at(-1);

    if (first && last) {
      units.push({
        element: null,
        from: first.from,
        nodes: stretch,
        to: last.to,
      });
    }
    stretch = [];
  };

  for (const childIndex of childIndexes) {
    const node = index.nodes[childIndex];

    if (node.kind === 'text') {
      stretch.push(node);
      continue;
    }
    flush();
    units.push({ element: node, from: node.from, nodes: [node], to: node.to });
  }
  flush();

  return units;
};

const unitAt = (
  units: readonly Unit[],
  position: number,
  field: 'from' | 'to'
) => {
  let low = 0;
  let high = units.length - 1;

  while (low <= high) {
    const middle = (low + high) >> 1;
    const value = units[middle][field];

    if (value === position) return middle;
    if (value < position) low = middle + 1;
    else high = middle - 1;
  }

  return -1;
};

const unitContaining = (units: readonly Unit[], from: number, to: number) => {
  let low = 0;
  let high = units.length - 1;

  while (low <= high) {
    const middle = (low + high) >> 1;
    const unit = units[middle];

    if (unit.to <= from) low = middle + 1;
    else if (unit.from > from) high = middle - 1;
    else return unit.from <= from && to <= unit.to ? middle : -1;
  }

  return -1;
};

export const classify = (
  units: readonly Unit[],
  footprints: readonly Footprint[]
): Classified | null => {
  const wholes: WholeRange[] = [];
  const inside = new Map<number, Footprint[]>();

  for (const footprint of footprints) {
    if (footprint.from === footprint.to) {
      const at = unitContaining(units, footprint.from, footprint.to);
      const unit = units[at];

      if (unit && unit.from < footprint.from && footprint.from < unit.to) {
        inside.set(at, [...(inside.get(at) ?? []), footprint]);
      }
      continue;
    }
    const start = unitAt(units, footprint.from, 'from');
    const end = unitAt(units, footprint.to, 'to');

    if (start !== -1 && end !== -1 && start <= end) {
      wholes.push({
        effects: new Set([footprint.effect.id]),
        end,
        footprints: [footprint],
        start,
      });
      continue;
    }
    const at = unitContaining(units, footprint.from, footprint.to);

    if (at === -1) return null;
    inside.set(at, [...(inside.get(at) ?? []), footprint]);
  }

  const ranges: WholeRange[] = [];

  for (const whole of wholes.toSorted(
    (left, right) => left.start - right.start
  )) {
    const last = ranges.at(-1);

    if (last && whole.start <= last.end) {
      last.end = Math.max(last.end, whole.end);
      for (const effect of whole.effects) last.effects.add(effect);
      last.footprints.push(...whole.footprints);
    } else {
      ranges.push(whole);
    }
  }
  for (const range of ranges) {
    for (let unit = range.start; unit <= range.end; unit += 1) {
      range.footprints.push(...(inside.get(unit) ?? []));
      inside.delete(unit);
    }
  }

  return { inside, ranges };
};

const spanKey = (root: string | null, from: number, to: number) =>
  `${root === null ? '' : `${root}#`}${from}:${to}`;

export const describedPairsOf = (
  groups: readonly ComparedChange[]
): DescribedPairs => {
  const pairs = new Map<string, Range>();

  for (const { correspondence } of groups) {
    for (const { after, before, kind } of correspondence) {
      const [from] = before;
      const [to] = after;

      if (
        kind === 'primary' &&
        before.length === 1 &&
        after.length === 1 &&
        from.root === to.root
      ) {
        pairs.set(spanKey(from.root, from.from, from.to), to);
      }
    }
  }

  return pairs;
};

const describedPair = (
  described: DescribedPairs,
  root: string | null,
  before: Unit,
  after: Unit
) => {
  const pair = described.get(spanKey(root, before.from, before.to));

  return (
    before.element !== null &&
    after.element !== null &&
    pair?.from === after.from &&
    pair.to === after.to
  );
};

const places = (range: WholeRange, unit: Unit) =>
  range.footprints.some(
    ({ effect, from, to }) =>
      effect.kind === 'placement' && from === unit.from && to === unit.to
  );

const longestIncreasingByAfter = (candidates: readonly Anchor[]) => {
  const tails: number[] = [];
  const previous = candidates.map(() => -1);

  candidates.forEach((candidate, index) => {
    let low = 0;
    let high = tails.length;

    while (low < high) {
      const middle = (low + high) >> 1;

      if (candidates[tails[middle]].after < candidate.after) low = middle + 1;
      else high = middle;
    }
    if (low > 0) previous[index] = tails[low - 1];
    tails[low] = index;
  });
  const kept: Anchor[] = [];

  for (let at = tails.at(-1) ?? -1; at !== -1; at = previous[at]) {
    kept.push(candidates[at]);
  }

  return kept.reverse();
};

const anchorsOf = ({
  classified,
  described,
  root,
  units,
}: AlignInput): readonly Anchor[] | null => {
  const loose = (side: 'after' | 'before') => {
    const covered = new Uint8Array(units[side].length);

    for (const range of classified[side].ranges) {
      covered.fill(1, range.start, range.end + 1);
    }

    return units[side].flatMap((_unit, index) => (covered[index] ? [] : index));
  };
  const looseBefore = loose('before');
  const looseAfter = loose('after');

  if (looseBefore.length !== looseAfter.length) return null;
  const candidates: Anchor[] = looseBefore.map((before, index) => ({
    after: looseAfter[index],
    before,
    ranges: null,
  }));
  const holders = new Map<string, number>();

  for (const side of SIDES) {
    for (const range of classified[side].ranges) {
      for (const id of range.effects) {
        holders.set(id, (holders.get(id) ?? 0) + 1);
      }
    }
  }
  const single = new Map(
    classified.after.ranges
      .filter(({ end, start }) => start === end)
      .map((range) => [range.start, range])
  );

  for (const range of classified.before.ranges) {
    if (range.start !== range.end) continue;
    const before = units.before[range.start];
    const pair = described.get(spanKey(root, before.from, before.to));
    const at = pair ? unitAt(units.after, pair.from, 'from') : -1;
    const partner = single.get(at);

    if (
      !partner ||
      !describedPair(described, root, before, units.after[at]) ||
      ![...range.effects].some((id) => partner.effects.has(id)) ||
      places(range, before) ||
      places(partner, units.after[at])
    ) {
      continue;
    }
    const exclusive = [...range.effects, ...partner.effects].every(
      (id) =>
        holders.get(id) ===
        Number(range.effects.has(id)) + Number(partner.effects.has(id))
    );

    if (exclusive) {
      candidates.push({
        after: at,
        before: range.start,
        ranges: { after: partner, before: range },
      });
    }
  }
  const kept = longestIncreasingByAfter(
    candidates.toSorted((left, right) => left.before - right.before)
  );
  const keptLoose = kept.filter(({ ranges }) => ranges === null).length;

  return keptLoose === looseBefore.length ? kept : null;
};

type Run = Readonly<{
  index: number;
  range: WholeRange;
  side: 'after' | 'before';
}>;

type Component = {
  after: UnitSpan | null;
  before: UnitSpan | null;
  members: number[];
};

type Paired = Component & Readonly<{ after: UnitSpan; before: UnitSpan }>;

const isPaired = (component: Component): component is Paired =>
  component.after !== null && component.before !== null;

const startOf = (span: UnitSpan | null) =>
  span ? span.start : Number.POSITIVE_INFINITY;

const gapComponents = (all: readonly Run[]): readonly Component[] => {
  const sets = disjointSets(all.length);
  const holding = new Map<string, number[]>();

  all.forEach(({ range }, at) => {
    for (const id of range.effects) {
      const members = holding.get(id);

      if (members) members.push(at);
      else holding.set(id, [at]);
    }
  });
  for (const members of holding.values()) {
    const first = members.find((at) => all[at].side === 'after');

    if (first !== undefined && all[members[0]].side === 'before') {
      sets.join(members[0], first);
    }
    for (let at = 1; at < members.length; at += 1) {
      const [previous, run] = [all[members[at - 1]], all[members[at]]];

      if (
        previous.side === run.side &&
        previous.range.end + 1 === run.range.start
      ) {
        sets.join(members[at - 1], members[at]);
      }
    }
  }
  const components = () => {
    const byRoot = new Map<number, Component>();

    all.forEach(({ index, side }, at) => {
      const key = sets.find(at);
      const component = byRoot.get(key) ?? {
        after: null,
        before: null,
        members: [],
      };
      const span = component[side];

      component.members.push(at);
      component[side] = {
        end: Math.max(span?.end ?? index, index),
        start: Math.min(span?.start ?? index, index),
      };
      byRoot.set(key, component);
    });

    return [...byRoot.values()];
  };
  const join = (left: Component, right: Component) =>
    sets.join(left.members[0], right.members[0]);

  for (let merged = true; merged;) {
    merged = false;
    for (const side of SIDES) {
      const spanning = components()
        .filter((component) => component[side] !== null)
        .toSorted((left, right) => startOf(left[side]) - startOf(right[side]));

      for (let at = 1; at < spanning.length; at += 1) {
        const [previous, component] = [spanning[at - 1], spanning[at]];

        if (startOf(component[side]) <= (previous[side]?.end ?? -1)) {
          merged = join(previous, component) || merged;
        }
      }
    }
    const paired = components()
      .filter(isPaired)
      .toSorted((left, right) => left.before.start - right.before.start);

    for (let at = 1; at < paired.length; at += 1) {
      if (paired[at].after.start < paired[at - 1].after.start) {
        merged = join(paired[at - 1], paired[at]) || merged;
      }
    }
  }

  return components();
};

const orderGap = (
  runs: Sides<readonly WholeRange[]>,
  units: Sides<readonly Unit[]>,
  root: string | null
): AlignStep[] => {
  const all: Run[] = SIDES.flatMap((side) =>
    runs[side].map((range, index) => ({ index, range, side }))
  );
  const final = gapComponents(all);
  const step = (component: Component): AlignStep => {
    const footprints = { after: [] as Footprint[], before: [] as Footprint[] };
    const unitSpan = (side: 'after' | 'before') => {
      const span = component[side];

      return span
        ? { end: runs[side][span.end].end, start: runs[side][span.start].start }
        : null;
    };

    for (const member of component.members) {
      footprints[all[member].side].push(...all[member].range.footprints);
    }

    return {
      after: unitSpan('after'),
      before: unitSpan('before'),
      footprints,
      kind: 'run',
    };
  };
  const firstWrite = new Map<string, number>();

  for (const { range } of all) {
    for (const { effect, owner } of range.footprints) {
      for (const span of effect.after) {
        if (
          span.root === root &&
          span.from < (firstWrite.get(owner) ?? Number.POSITIVE_INFINITY)
        ) {
          firstWrite.set(owner, span.from);
        }
      }
    }
  }
  const firstWriteOf = (component: Component) => {
    let first = Number.POSITIVE_INFINITY;

    for (const member of component.members) {
      for (const { owner } of all[member].range.footprints) {
        first = Math.min(
          first,
          firstWrite.get(owner) ?? Number.POSITIVE_INFINITY
        );
      }
    }

    return Number.isFinite(first) ? first : -1;
  };
  const removed = final
    .filter(({ after }) => after === null)
    .toSorted((left, right) => startOf(left.before) - startOf(right.before));
  const added = final
    .filter(({ before }) => before === null)
    .toSorted((left, right) => startOf(left.after) - startOf(right.after));
  const addedFrom = (component: Component) =>
    units.after[runs.after[startOf(component.after)].start].from;
  const steps: AlignStep[] = [];
  let removedAt = 0;
  let addedAt = 0;
  const flush = (beforeLimit: number, afterLimit: number) => {
    let removal = removed[removedAt];
    let addition = added[addedAt];

    while (
      (removal && startOf(removal.before) < beforeLimit) ||
      (addition && startOf(addition.after) < afterLimit)
    ) {
      const takeRemoval =
        removal &&
        startOf(removal.before) < beforeLimit &&
        !(
          addition &&
          startOf(addition.after) < afterLimit &&
          firstWriteOf(removal) >= addedFrom(addition)
        );

      if (takeRemoval) {
        steps.push(step(removal));
        removedAt += 1;
      } else if (addition) {
        steps.push(step(addition));
        addedAt += 1;
      } else {
        return;
      }
      removal = removed[removedAt];
      addition = added[addedAt];
    }
  };

  for (const component of final
    .filter(isPaired)
    .toSorted((left, right) => left.before.start - right.before.start)) {
    flush(component.before.start, component.after.start);
    steps.push(step(component));
  }
  flush(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);

  return steps;
};

export const alignLevel = (input: AlignInput): readonly AlignStep[] | null => {
  const anchors = anchorsOf(input);

  if (!anchors) return null;
  const { classified, root, units } = input;
  const steps: AlignStep[] = [];
  const next = { after: 0, before: 0 };

  for (let at = 0; at <= anchors.length; at += 1) {
    const anchor = anchors.at(at);
    const runs = { after: [] as WholeRange[], before: [] as WholeRange[] };

    for (const side of SIDES) {
      const limit = anchor ? anchor[side] : units[side].length;
      const { ranges } = classified[side];

      while ((ranges[next[side]]?.start ?? limit) < limit) {
        if (ranges[next[side]].end >= limit) return null;
        runs[side].push(ranges[next[side]]);
        next[side] += 1;
      }
      if (anchor?.ranges) {
        if (ranges[next[side]] !== anchor.ranges[side]) return null;
        next[side] += 1;
      }
    }
    steps.push(...orderGap(runs, units, root));
    if (anchor) steps.push({ anchor, kind: 'anchor' });
  }

  return steps;
};
