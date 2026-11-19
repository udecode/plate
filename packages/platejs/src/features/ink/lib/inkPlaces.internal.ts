import type { EditorUniqueHolder } from '../../../core';
import type { EditorCoreStateView, NodeKey } from '../../../facade';
import type { InkCopy, InkCopyPlace } from './BaseInkPlugin';
import { goneIn, type SavedRecords } from './inkGone.internal';
import { inkText } from './inkMatch.internal';

type Side = 'next' | 'previous';

type HeldPlace = Extract<InkCopyPlace, { key: NodeKey }>;

type GonePlace = Extract<InkCopyPlace, { kind: 'gone' }>;

type InkPlaces = {
  identity: object;
  copies: Map<string, InkCopy>;
  blocks: Map<string, Map<string, InkCopy>>;
  held: Map<string, HeldPlace>;
  gone: Map<string, GonePlace>;
  chainEnds: Record<Side, Map<string, string>>;
};

type InkState = Pick<
  EditorCoreStateView,
  'nodes' | 'schema' | 'unique' | 'value'
>;

export type InkPlaceRead = Readonly<{
  copy: (id: string) => InkCopy | undefined;
  state: InkState;
}>;

const indexes = new WeakMap<object, InkPlaces>();

const resolveBlock = (places: InkPlaces, state: InkState, id: string) => {
  const holder = state.unique.holder('id', id);
  const [node] = (holder && state.nodes.get(holder.key)) || [];

  if (!holder || !node) return;

  const text = inkText(state.schema, node);

  for (const [copyId, copy] of places.blocks.get(id) ?? []) {
    places.held.set(copyId, {
      key: holder.key,
      kind: text === copy.text ? 'live' : 'changed',
    });
  }
};

const trackCopy = (places: InkPlaces, read: InkPlaceRead, id: string) => {
  const tracked = places.copies.get(id);

  if (tracked) return tracked;

  const copy = read.copy(id);

  if (!copy) return undefined;

  const block = places.blocks.get(copy.block);

  places.copies.set(id, copy);
  if (block) block.set(id, copy);
  else places.blocks.set(copy.block, new Map([[id, copy]]));
  resolveBlock(places, read.state, copy.block);

  return copy;
};

const nearestPresent = (
  places: InkPlaces,
  state: InkState,
  records: SavedRecords | undefined,
  id: string,
  side: Side
) => {
  const chainEnds = places.chainEnds[side];
  const walked = new Set([id]);
  let end = id;
  let at = chainEnds.get(id) ?? goneIn(records, id)?.[side];
  let found: EditorUniqueHolder | undefined;

  while (at !== undefined && !walked.has(at)) {
    end = at;

    const holder = state.unique.holder('id', at);

    if (holder) {
      found = holder;
      break;
    }
    walked.add(at);
    at = chainEnds.get(at) ?? goneIn(records, at)?.[side];
  }
  for (const passed of walked) {
    if (passed !== end) chainEnds.set(passed, end);
  }

  return found;
};

const placeOf = (
  places: InkPlaces,
  read: InkPlaceRead,
  copyId: string
): InkCopyPlace | undefined => {
  const copy = trackCopy(places, read, copyId);

  if (!copy) return undefined;

  const known = places.held.get(copyId) ?? places.gone.get(copyId);

  if (known) return known;

  const { records } = read.state.value();
  const previous = nearestPresent(
    places,
    read.state,
    records,
    copy.block,
    'previous'
  );
  const anchor =
    previous ?? nearestPresent(places, read.state, records, copy.block, 'next');
  const gone: GonePlace = {
    beside: anchor
      ? { at: previous ? 'after' : 'before', key: anchor.key }
      : { at: 'start' },
    kind: 'gone',
  };

  places.gone.set(copyId, gone);

  return gone;
};

const placesOf = ({ state }: InkPlaceRead) => {
  const value = state.value();
  const identity = state.schema.identity();
  const kept = indexes.get(value);

  if (kept?.identity === identity) return kept;

  const places: InkPlaces = {
    blocks: new Map(),
    chainEnds: { next: new Map(), previous: new Map() },
    copies: new Map(),
    gone: new Map(),
    held: new Map(),
    identity,
  };

  indexes.set(value, places);

  return places;
};

export const readInkPlace = (read: InkPlaceRead, copyId: string) =>
  placeOf(placesOf(read), read, copyId);
