import { failInvariant } from '../../../internal/failInvariant';
import type { ListLevels } from './listIndex.internal';

export const DEFAULT_LIST_ID = '';

export type ListFacts = Readonly<{
  id: string;
  level: number;
  levels: ListLevels | undefined;
  numbered: boolean;
  restart: number | undefined;
  start: number | undefined;
}>;

export type ListEntry<TKey> = {
  facts: ListFacts;
  readonly key: TKey;
  ordinal: number | undefined;
};

export type EntryOrder<TKey> = (
  left: ListEntry<TKey>,
  right: ListEntry<TKey>
) => number;

type Chunk<TKey> = Array<ListEntry<TKey>>;

type ChunkedLane<TKey> = Array<Chunk<TKey>>;

type Cursor = { chunk: number; index: number };

type Closer<TKey> = {
  cursor: Cursor | null;
  lane: ChunkedLane<TKey>;
  level: number;
};

export type ListLanes<TKey> = {
  items: Map<number, ChunkedLane<TKey>>;
  numbered: Map<number, ChunkedLane<TKey>>;
  size: number;
};

const CHUNK_LIMIT = 128;
const CHUNK_FLOOR = 16;
const GALLOP_AFTER = 4;

const rebuildsInOnePass = (changed: number, size: number) => changed * 8 > size;

export const numberingMetrics = { compares: 0, moved: 0, visited: 0 };

const compare = <TKey>(
  order: EntryOrder<TKey>,
  left: ListEntry<TKey>,
  right: ListEntry<TKey>
) => {
  numberingMetrics.compares += 1;

  return order(left, right);
};

const lastOf = <T>(items: readonly T[]) =>
  items.at(-1) ?? failInvariant('A lane or chunk is empty.');

const restartLimit = (facts: ListFacts) => {
  const restartAfter = facts.levels?.[facts.level]?.restartAfter;

  return restartAfter === 0
    ? Number.NEGATIVE_INFINITY
    : Math.min(facts.level - 1, restartAfter ?? facts.level - 1);
};

const ordinalOf = (facts: ListFacts, previous: number | undefined) =>
  facts.restart ??
  (previous === undefined
    ? (facts.start ?? facts.levels?.[facts.level]?.start ?? 1)
    : previous + 1);

const latestAtOrAbove = (
  ancestors: ReadonlyArray<{ index: number; level: number }>,
  limit: number
) => {
  let low = 0;
  let high = ancestors.length;

  while (low < high) {
    const middle = (low + high) >> 1;

    numberingMetrics.compares += 1;
    if (ancestors[middle].level <= limit) low = middle + 1;
    else high = middle;
  }

  return low === 0 ? -1 : ancestors[low - 1].index;
};

const setOrdinal = <TKey>(
  entry: ListEntry<TKey>,
  ordinal: number | undefined,
  onChange?: (entry: ListEntry<TKey>) => void
) => {
  if (entry.ordinal === ordinal) return;
  entry.ordinal = ordinal;
  onChange?.(entry);
};

export const countAll = <TKey>(
  inDocumentOrder: ReadonlyArray<ListEntry<TKey>>,
  onChange?: (entry: ListEntry<TKey>) => void
) => {
  const lastNumbered = new Map<number, number>();
  const ancestors: Array<{ index: number; level: number }> = [];

  inDocumentOrder.forEach((entry, index) => {
    const { facts } = entry;

    if (facts.numbered) {
      const previous = lastNumbered.get(facts.level);
      const continued =
        previous !== undefined &&
        latestAtOrAbove(ancestors, restartLimit(facts)) < previous
          ? inDocumentOrder[previous].ordinal
          : undefined;

      setOrdinal(entry, ordinalOf(facts, continued), onChange);
      lastNumbered.set(facts.level, index);
    } else setOrdinal(entry, undefined, onChange);
    while (
      (ancestors.at(-1)?.level ?? Number.NEGATIVE_INFINITY) >= facts.level
    ) {
      ancestors.pop();
    }
    ancestors.push({ index, level: facts.level });
  });
  numberingMetrics.visited += inDocumentOrder.length;
};

const lowerBound = <TKey>(
  lane: ChunkedLane<TKey>,
  entry: ListEntry<TKey>,
  order: EntryOrder<TKey>
): Cursor | null => {
  let low = 0;
  let high = lane.length;

  while (low < high) {
    const middle = (low + high) >> 1;
    const chunk = lane[middle];

    if (compare(order, lastOf(chunk), entry) < 0) low = middle + 1;
    else high = middle;
  }
  if (low === lane.length) return null;

  const chunk = lane[low];
  let start = 0;
  let end = chunk.length;

  while (start < end) {
    const middle = (start + end) >> 1;

    if (compare(order, chunk[middle], entry) < 0) start = middle + 1;
    else end = middle;
  }

  return { chunk: low, index: start };
};

const at = <TKey>(lane: ChunkedLane<TKey>, cursor: Cursor) =>
  lane[cursor.chunk][cursor.index];

const endOf = <TKey>(lane: ChunkedLane<TKey>): Cursor => ({
  chunk: lane.length - 1,
  index: lastOf(lane).length,
});

const searchChunk = <TKey>(
  chunk: Chunk<TKey>,
  from: number,
  entry: ListEntry<TKey>,
  order: EntryOrder<TKey>
) => {
  let low = from;
  let high = chunk.length;

  while (low < high) {
    const middle = (low + high) >> 1;

    if (compare(order, chunk[middle], entry) < 0) low = middle + 1;
    else high = middle;
  }

  return low;
};

const gallop = <TKey>(
  lane: ChunkedLane<TKey>,
  cursor: Cursor,
  entry: ListEntry<TKey>,
  order: EntryOrder<TKey>
): Cursor | null => {
  const last = (chunk: number) => lastOf(lane[chunk]);

  if (compare(order, last(cursor.chunk), entry) >= 0) {
    return {
      chunk: cursor.chunk,
      index: searchChunk(lane[cursor.chunk], cursor.index, entry, order),
    };
  }

  let low = cursor.chunk + 1;
  let high = low;
  let step = 1;

  while (high < lane.length && compare(order, last(high), entry) < 0) {
    low = high + 1;
    high = low + step;
    step *= 2;
  }
  high = Math.min(high, lane.length);
  while (low < high) {
    const middle = (low + high) >> 1;

    if (compare(order, last(middle), entry) < 0) low = middle + 1;
    else high = middle;
  }

  return low === lane.length
    ? null
    : { chunk: low, index: searchChunk(lane[low], 0, entry, order) };
};

const advance = <TKey>(lane: ChunkedLane<TKey>, cursor: Cursor) => {
  cursor.index += 1;
  if (cursor.index < lane[cursor.chunk].length) return true;
  cursor.chunk += 1;
  cursor.index = 0;

  return cursor.chunk < lane.length;
};

const before = <TKey>(lane: ChunkedLane<TKey>, cursor: Cursor) =>
  cursor.index > 0
    ? lane[cursor.chunk][cursor.index - 1]
    : lane[cursor.chunk - 1]?.at(-1);

const laneOf = <TKey>(map: Map<number, ChunkedLane<TKey>>, level: number) => {
  let lane = map.get(level);

  if (!lane) {
    lane = [];
    map.set(level, lane);
  }

  return lane;
};

const insert = <TKey>(
  lane: ChunkedLane<TKey>,
  entry: ListEntry<TKey>,
  order: EntryOrder<TKey>
): Cursor => {
  if (lane.length === 0) {
    lane.push([entry]);

    return { chunk: 0, index: 0 };
  }

  const cursor = lowerBound(lane, entry, order) ?? endOf(lane);
  const chunk = lane[cursor.chunk];

  chunk.splice(cursor.index, 0, entry);
  numberingMetrics.moved += chunk.length - cursor.index;
  if (chunk.length > CHUNK_LIMIT) {
    lane.splice(cursor.chunk + 1, 0, chunk.splice(CHUNK_LIMIT / 2));
    numberingMetrics.moved += CHUNK_LIMIT / 2 + lane.length - cursor.chunk;
    if (cursor.index >= CHUNK_LIMIT / 2) {
      return { chunk: cursor.chunk + 1, index: cursor.index - CHUNK_LIMIT / 2 };
    }
  }

  return cursor;
};

const mergeSmall = <TKey>(lane: ChunkedLane<TKey>, index: number) => {
  if (lane[index].length >= CHUNK_FLOOR || lane.length === 1) return;

  const first = index + 1 < lane.length ? index : index - 1;
  const merged = [...lane[first], ...lane[first + 1]];
  const half = merged.length >> 1;

  numberingMetrics.moved += merged.length + lane.length - first;
  lane.splice(
    first,
    2,
    ...(merged.length > CHUNK_LIMIT
      ? [merged.slice(0, half), merged.slice(half)]
      : [merged])
  );
};

const remove = <TKey>(
  map: Map<number, ChunkedLane<TKey>>,
  entry: ListEntry<TKey>,
  level: number,
  placedIn: EntryOrder<TKey>
) => {
  const lane = map.get(level);
  const cursor = lane && lowerBound(lane, entry, placedIn);

  if (!lane || !cursor || at(lane, cursor) !== entry) {
    throw new Error('A list entry is not where its lane order puts it.');
  }

  const chunk = lane[cursor.chunk];

  chunk.splice(cursor.index, 1);
  numberingMetrics.moved += chunk.length - cursor.index;
  if (chunk.length === 0) {
    lane.splice(cursor.chunk, 1);
    numberingMetrics.moved += lane.length - cursor.chunk;
    if (lane.length === 0) map.delete(level);
  } else mergeSmall(lane, cursor.chunk);
};

const chunked = <TKey>(entries: Chunk<TKey>): ChunkedLane<TKey> => {
  const lane: ChunkedLane<TKey> = [];

  for (let start = 0; start < entries.length; start += CHUNK_LIMIT / 2) {
    lane.push(entries.slice(start, start + CHUNK_LIMIT / 2));
  }

  return lane;
};

const firstAfterInNumberedLanes = <TKey>(
  lanes: ListLanes<TKey>,
  point: ListEntry<TKey>,
  fromLevel: number,
  order: EntryOrder<TKey>
) => {
  const seeds: Array<ListEntry<TKey>> = [];

  for (const [level, lane] of lanes.numbered) {
    if (level < fromLevel) continue;

    const cursor = lowerBound(lane, point, order);

    if (cursor) seeds.push(at(lane, cursor));
  }

  return seeds;
};

export const createLanes = <TKey>(
  inDocumentOrder: Iterable<ListEntry<TKey>>
): ListLanes<TKey> => {
  const items = new Map<number, Chunk<TKey>>();
  const numbered = new Map<number, Chunk<TKey>>();
  const lanes: ListLanes<TKey> = {
    items: new Map(),
    numbered: new Map(),
    size: 0,
  };
  const append = (map: Map<number, Chunk<TKey>>, entry: ListEntry<TKey>) => {
    const level = map.get(entry.facts.level);

    if (level) level.push(entry);
    else map.set(entry.facts.level, [entry]);
  };

  for (const entry of inDocumentOrder) {
    lanes.size += 1;
    append(items, entry);
    if (entry.facts.numbered) append(numbered, entry);
  }
  for (const [level, entries] of items) {
    lanes.items.set(level, chunked(entries));
  }
  for (const [level, entries] of numbered) {
    lanes.numbered.set(level, chunked(entries));
  }

  return lanes;
};

export const placeEntry = <TKey>(
  lanes: ListLanes<TKey>,
  entry: ListEntry<TKey>,
  order: EntryOrder<TKey>
) => {
  const { level, numbered } = entry.facts;

  lanes.size += 1;
  insert(laneOf(lanes.items, level), entry, order);

  const seeds = firstAfterInNumberedLanes(lanes, entry, level + 1, order);

  if (numbered) {
    const lane = laneOf(lanes.numbered, level);
    const cursor = insert(lane, entry, order);

    seeds.push(entry);
    if (advance(lane, cursor)) seeds.push(at(lane, cursor));
  }

  return seeds;
};

const stepBack = <TKey>(lane: ChunkedLane<TKey>, cursor: Cursor) => {
  if (cursor.index > 0) {
    cursor.index -= 1;

    return true;
  }
  if (cursor.chunk === 0) return false;
  cursor.chunk -= 1;
  cursor.index = lane[cursor.chunk].length - 1;

  return true;
};

const nearestAnchor = <TKey>(
  lane: ChunkedLane<TKey>,
  from: Cursor,
  step: (lane: ChunkedLane<TKey>, cursor: Cursor) => boolean,
  isAnchor: (entry: ListEntry<TKey>) => boolean,
  reach: number
): ListEntry<TKey> | 'beyond-reach' | 'edge' => {
  const cursor = { ...from };

  for (let seen = 0; seen < reach; seen += 1) {
    const entry = at(lane, cursor);

    if (isAnchor(entry)) return entry;
    if (!step(lane, cursor)) return 'edge';
  }

  return 'beyond-reach';
};

export const sitsBetweenAnchors = <TKey>(
  lanes: ListLanes<TKey>,
  entry: ListEntry<TKey>,
  placedIn: EntryOrder<TKey>,
  order: EntryOrder<TKey>,
  isAnchor: (entry: ListEntry<TKey>) => boolean,
  reach: number
) => {
  for (const [level, lane] of lanes.items) {
    const cursor = lowerBound(lane, entry, placedIn);
    const own = level === entry.facts.level;

    if (own && (!cursor || at(lane, cursor) !== entry)) return false;

    const back = cursor ? { ...cursor } : endOf(lane);
    const previous = stepBack(lane, back)
      ? nearestAnchor(lane, back, stepBack, isAnchor, reach)
      : 'edge';
    const forward = cursor ? { ...cursor } : null;
    const next =
      forward && (!own || advance(lane, forward))
        ? nearestAnchor(lane, forward, advance, isAnchor, reach)
        : 'edge';

    if (previous === 'beyond-reach' || next === 'beyond-reach') return false;
    if (previous !== 'edge' && compare(order, previous, entry) >= 0) {
      return false;
    }
    if (next !== 'edge' && compare(order, entry, next) >= 0) return false;
  }

  return true;
};

export const removeEntry = <TKey>(
  lanes: ListLanes<TKey>,
  entry: ListEntry<TKey>,
  placedWith: ListFacts,
  placedIn: EntryOrder<TKey>
) => {
  const { level, numbered } = placedWith;

  lanes.size -= 1;
  remove(lanes.items, entry, level, placedIn);
  if (numbered) remove(lanes.numbered, entry, level, placedIn);

  return firstAfterInNumberedLanes(
    lanes,
    entry,
    numbered ? level : level + 1,
    placedIn
  );
};

const closersAfter = <TKey>(
  lanes: ListLanes<TKey>,
  level: number,
  previous: ListEntry<TKey>,
  order: EntryOrder<TKey>
): Array<Closer<TKey>> => {
  const closers: Array<Closer<TKey>> = [];

  for (const [closerLevel, lane] of lanes.items) {
    if (closerLevel < level) {
      closers.push({
        cursor: lowerBound(lane, previous, order),
        lane,
        level: closerLevel,
      });
    }
  }

  return closers;
};

const passClosers = <TKey>(
  closers: ReadonlyArray<Closer<TKey>>,
  entry: ListEntry<TKey>,
  order: EntryOrder<TKey>
) => {
  const limit = restartLimit(entry.facts);
  let closed = false;

  for (const closer of closers) {
    let steps = 0;

    while (
      closer.cursor &&
      compare(order, at(closer.lane, closer.cursor), entry) < 0
    ) {
      if (closer.level <= limit) closed = true;
      if (steps === GALLOP_AFTER) {
        closer.cursor = gallop(closer.lane, closer.cursor, entry, order);
        break;
      }
      steps += 1;
      if (!advance(closer.lane, closer.cursor)) closer.cursor = null;
    }
  }

  return closed;
};

const walkLane = <TKey>(
  lanes: ListLanes<TKey>,
  level: number,
  cursor: Cursor,
  order: EntryOrder<TKey>,
  onChange: (entry: ListEntry<TKey>) => void,
  stopWhereHeld: boolean
) => {
  const lane =
    lanes.numbered.get(level) ?? failInvariant('A walked level has no lane.');
  let previous = before(lane, cursor);
  let closers: Array<Closer<TKey>> | undefined;
  let walked: ListEntry<TKey> | undefined;

  do {
    const entry = at(lane, cursor);
    let ordinal: number | undefined;

    if (previous) {
      closers ??= closersAfter(lanes, level, previous, order);
      ordinal = ordinalOf(
        entry.facts,
        passClosers(closers, entry, order) ? undefined : previous.ordinal
      );
    } else ordinal = ordinalOf(entry.facts, undefined);

    numberingMetrics.visited += 1;
    walked = entry;
    if (stopWhereHeld && ordinal === entry.ordinal) break;
    setOrdinal(entry, ordinal, onChange);
    previous = entry;
  } while (advance(lane, cursor));

  return walked;
};

export const recountLanes = <TKey>(
  lanes: ListLanes<TKey>,
  seeds: Iterable<ListEntry<TKey>>,
  order: EntryOrder<TKey>,
  onChange: (entry: ListEntry<TKey>) => void
) => {
  const byLevel = new Map<number, Array<ListEntry<TKey>>>();

  for (const seed of seeds) {
    if (!seed.facts.numbered) continue;

    const levelSeeds = byLevel.get(seed.facts.level) ?? [];

    levelSeeds.push(seed);
    byLevel.set(seed.facts.level, levelSeeds);
  }
  for (const [level, levelSeeds] of byLevel) {
    const lane = lanes.numbered.get(level);

    if (!lane) continue;

    let walked: ListEntry<TKey> | undefined;

    levelSeeds.sort((left, right) => compare(order, left, right));
    for (const seed of levelSeeds) {
      if (walked && compare(order, seed, walked) <= 0) continue;

      const cursor = lowerBound(lane, seed, order);

      if (cursor) {
        walked = walkLane(lanes, level, cursor, order, onChange, true);
      }
    }
  }
};

const gallopMerge = <TKey>(
  kept: Chunk<TKey>,
  added: Chunk<TKey>,
  order: EntryOrder<TKey>
) => {
  if (added.length === 0) return kept;

  const merged: Chunk<TKey> = [];
  let from = 0;

  for (const entry of added) {
    let step = 1;
    let low = from;
    let high = from;

    while (high < kept.length && compare(order, kept[high], entry) < 0) {
      low = high + 1;
      high = from + step;
      step *= 2;
    }
    high = Math.min(high, kept.length);
    while (low < high) {
      const middle = (low + high) >> 1;

      if (compare(order, kept[middle], entry) < 0) low = middle + 1;
      else high = middle;
    }
    for (let index = from; index < low; index += 1) merged.push(kept[index]);
    merged.push(entry);
    from = low;
  }
  for (let index = from; index < kept.length; index += 1) {
    merged.push(kept[index]);
  }

  return merged;
};

const moveEntries = <TKey>(
  lanes: ListLanes<TKey>,
  removed: ReadonlyMap<ListEntry<TKey>, ListFacts>,
  placed: ReadonlyArray<ListEntry<TKey>>,
  placedIn: EntryOrder<TKey>,
  order: EntryOrder<TKey>,
  onChange: (entry: ListEntry<TKey>) => void
) => {
  const seeds = new Set<ListEntry<TKey>>();

  for (const [entry, facts] of removed) {
    seeds.delete(entry);
    for (const seed of removeEntry(lanes, entry, facts, placedIn)) {
      seeds.add(seed);
    }
  }
  for (const entry of placed) {
    for (const seed of placeEntry(lanes, entry, order)) seeds.add(seed);
  }
  recountLanes(lanes, seeds, order, onChange);

  return lanes;
};

const rebuildLanes = <TKey>(
  lanes: ListLanes<TKey>,
  removed: ReadonlyMap<ListEntry<TKey>, ListFacts>,
  placed: ReadonlyArray<ListEntry<TKey>>,
  order: EntryOrder<TKey>,
  onChange: (entry: ListEntry<TKey>) => void
) => {
  const added = [...placed].sort((left, right) => compare(order, left, right));
  const rebuilt = createLanes<TKey>([]);
  const levels = new Set([
    ...lanes.items.keys(),
    ...added.map((entry) => entry.facts.level),
  ]);

  for (const level of levels) {
    const items = gallopMerge(
      (lanes.items.get(level) ?? [])
        .flat()
        .filter((entry) => !removed.has(entry)),
      added.filter((entry) => entry.facts.level === level),
      order
    );
    const numbered = items.filter((entry) => entry.facts.numbered);

    numberingMetrics.moved += items.length;
    rebuilt.size += items.length;
    if (items.length > 0) rebuilt.items.set(level, chunked(items));
    if (numbered.length > 0) rebuilt.numbered.set(level, chunked(numbered));
  }
  for (const level of rebuilt.numbered.keys()) {
    walkLane(rebuilt, level, { chunk: 0, index: 0 }, order, onChange, false);
  }

  return rebuilt;
};

export const changeLanes = <TKey>(
  lanes: ListLanes<TKey>,
  removed: ReadonlyMap<ListEntry<TKey>, ListFacts>,
  placed: ReadonlyArray<ListEntry<TKey>>,
  placedIn: EntryOrder<TKey>,
  order: EntryOrder<TKey>,
  onChange: (entry: ListEntry<TKey>) => void
): ListLanes<TKey> =>
  rebuildsInOnePass(removed.size + placed.length, lanes.size)
    ? rebuildLanes(lanes, removed, placed, order, onChange)
    : moveEntries(lanes, removed, placed, placedIn, order, onChange);
