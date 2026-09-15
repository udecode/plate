import type { NativeAuthoredFragmentSlot } from '../core/authored-runtime';
import { getDefined } from '../internal/get-defined';
import type { AuthoredRangeProjection } from './anchors';
import {
  matchingAuthoredIntervals,
  writeAuthoredInterval,
  type AuthoredIntervals,
} from './intervals';
import type { AuthoredPosition, AuthoredSpan } from './positions';
import {
  readRecord,
  records,
  removeRecord,
  writeRecord,
  type RecordTree,
} from './record-tree';
import { resolveAuthoredRetainedPosition } from './steps';

export type AuthoredFragmentOrder = Readonly<{
  after: AuthoredPosition['right'];
  before: AuthoredPosition['left'];
  key: string;
  position: AuthoredPosition;
  spans: readonly AuthoredSpan[];
}>;

type Binding = Readonly<{
  order: AuthoredFragmentOrder | null;
  root: string;
  slot: NativeAuthoredFragmentSlot;
}>;

const orderCoincidentFragments = <T extends Binding>(
  entries: readonly T[]
): T[] => {
  const byId = new Map(entries.map((entry) => [entry.slot.id, entry]));
  const following = new Map<string, Set<string>>();
  const preceding = new Map<string, number>();
  const origins = new Map<string, AuthoredIntervals<string>>();
  const spans = new Map<
    string,
    Array<{ from: number; id: string; to: number }>
  >();
  const connect = (before: string, after: string) => {
    if (before === after) return;
    const next = following.get(before) ?? new Set<string>();
    if (next.has(after)) return;
    next.add(after);
    following.set(before, next);
    preceding.set(after, (preceding.get(after) ?? 0) + 1);
  };
  for (const entry of entries) {
    entry.order?.spans.forEach((span, index) => {
      const interval = {
        from: span.offset,
        id: JSON.stringify([entry.slot.id, index]),
        insertion: false,
        value: entry.slot.id,
        to: span.offset + span.length,
      };
      origins.set(
        span.origin,
        writeAuthoredInterval(origins.get(span.origin) ?? null, interval)
      );
      const parts = spans.get(span.origin) ?? [];
      parts.push({ from: interval.from, id: entry.slot.id, to: interval.to });
      spans.set(span.origin, parts);
    });
  }
  for (const parts of spans.values()) {
    parts.sort(
      (a, b) =>
        a.from - b.from ||
        a.to - b.to ||
        (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
    );
    for (let index = 1; index < parts.length; index++) {
      const previous = parts[index - 1];
      const current = parts[index];
      if (previous.to <= current.from) connect(previous.id, current.id);
    }
  }
  for (const entry of entries) {
    if (!entry.order) continue;
    for (const side of ['before', 'after'] as const) {
      const endpoint = entry.order[side];
      if (!endpoint) continue;
      const offset = endpoint.offset - (side === 'before' ? 1 : 0);
      for (const { value: id } of matchingAuthoredIntervals(
        origins.get(endpoint.origin) ?? null,
        offset,
        offset + 1
      )) {
        if (side === 'before') connect(id, entry.slot.id);
        else connect(entry.slot.id, id);
      }
    }
  }
  let remaining: RecordTree<T> | null = null;
  let ready: RecordTree<T> | null = null;
  const key = (entry: T) => entry.order?.key ?? entry.slot.id;
  for (const entry of entries) {
    remaining = writeRecord(remaining, key(entry), entry);
    if (!preceding.get(entry.slot.id)) {
      ready = writeRecord(ready, key(entry), entry);
    }
  }
  const result: T[] = [];
  while (remaining) {
    // Conflicting origin constraints retain deterministic operation order.
    const [nextKey, entry] = getDefined(
      records(ready ?? remaining).next().value
    );
    remaining = removeRecord(remaining, nextKey);
    ready = removeRecord(ready, nextKey);
    result.push(entry);
    for (const id of following.get(entry.slot.id) ?? []) {
      const count = getDefined(preceding.get(id)) - 1;
      preceding.set(id, count);
      const next = getDefined(byId.get(id));
      if (count === 0 && readRecord(remaining, key(next))) {
        ready = writeRecord(ready, key(next), next);
      }
    }
  }
  return result;
};

export const orderAuthoredFragments = <T extends Binding>(
  entries: readonly T[],
  projection: AuthoredRangeProjection
): readonly T[] => {
  if (entries.length < 2) return entries;
  const positioned = entries
    .map((entry) => {
      const positions = readRecord(projection.positions, entry.root)?.positions;
      return {
        at:
          entry.order && positions
            ? (resolveAuthoredRetainedPosition(
                projection.state,
                positions,
                entry.order.position
              ) ?? 0)
            : 0,
        entry,
      };
    })
    .sort(
      (a, b) =>
        a.at - b.at ||
        (a.entry.slot.side < b.entry.slot.side
          ? -1
          : a.entry.slot.side > b.entry.slot.side
            ? 1
            : 0)
    );
  const result: T[] = [];
  let start = 0;
  while (start < positioned.length) {
    let end = start + 1;
    while (
      end < positioned.length &&
      positioned[end].at === positioned[start].at &&
      positioned[end].entry.slot.side === positioned[start].entry.slot.side
    ) {
      end += 1;
    }
    const group = positioned.slice(start, end).map(({ entry }) => entry);
    result.push(
      ...(group.length > 1 ? orderCoincidentFragments(group) : group)
    );
    start = end;
  }
  return result;
};
