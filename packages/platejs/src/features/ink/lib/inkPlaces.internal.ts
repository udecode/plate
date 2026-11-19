import type { EditorUniqueHolder } from '../../../core';
import {
  type EditorCommit,
  type EditorCoreStateView,
  getActiveEditorUpdateId,
  getEditorCommitValue,
  getEditorRuntimeOwner,
  getRecordSetVersion,
  getSnapshotVersion,
  getValueRecords,
  type NodeKey,
  type RecordSetVersion,
  recordSetChanges,
  readShownDocument,
  type RuntimeAnyEditor,
  withStoredAuthoredRead,
} from '../../../facade';
import type { InkCopy, InkCopyPlace } from './BaseInkPlugin';
import { GONE, goneIn, idOf, type SavedRecords } from './inkGone.internal';
import { inkText } from './inkMatch.internal';

export const COPIES = 'ink-copies';

type Side = 'next' | 'previous';

type HeldPlace = Extract<InkCopyPlace, { key: NodeKey }>;

type GonePlace = Extract<InkCopyPlace, { kind: 'gone' }>;

type InkPlaces = {
  identity: object;
  copies: Map<string, InkCopy>;
  blocks: Map<string, { copies: Map<string, InkCopy>; key: NodeKey | null }>;
  blockOfKey: Map<NodeKey, string>;
  held: Map<string, HeldPlace>;
  gone: Map<string, GonePlace>;
  chainEnds: Record<Side, Map<string, string>>;
  walked: Set<string>;
};

type CommittedPlaces = {
  places: InkPlaces;
  sets: Record<typeof COPIES | typeof GONE, RecordSetVersion>;
  version: number;
};

type InkState = Pick<
  EditorCoreStateView,
  'nodes' | 'schema' | 'unique' | 'value'
>;

export type InkPlaceRead = Readonly<{
  copy: (id: string) => InkCopy | undefined;
  editor: RuntimeAnyEditor;
  state: InkState;
}>;

const committed = new WeakMap<object, CommittedPlaces>();

const shownPlaces = new WeakMap<
  object,
  { places: InkPlaces; version: number }
>();

const metrics = { hops: 0, resolved: 0 };

export const getInkPlaceMetrics = () => Object.freeze({ ...metrics });

const emptyPlaces = (identity: object): InkPlaces => ({
  blockOfKey: new Map(),
  blocks: new Map(),
  chainEnds: { next: new Map(), previous: new Map() },
  copies: new Map(),
  gone: new Map(),
  held: new Map(),
  identity,
  walked: new Set(),
});

const resolveBlock = (places: InkPlaces, state: InkState, id: string) => {
  const block = places.blocks.get(id);

  if (!block) return;
  metrics.resolved += 1;

  const holder = state.unique.holder('id', id);
  const [node] = (holder && state.nodes.get(holder.key)) || [];
  const at = holder && node ? { key: holder.key, node } : undefined;
  const key = at?.key ?? null;

  if (block.key !== key) {
    if (block.key !== null && places.blockOfKey.get(block.key) === id) {
      places.blockOfKey.delete(block.key);
    }
    if (key !== null) places.blockOfKey.set(key, id);
    block.key = key;
  }

  const text = at && inkText(state.schema, at.node);

  for (const [copyId, copy] of block.copies) {
    if (at) {
      places.held.set(copyId, {
        key: at.key,
        kind: text === copy.text ? 'live' : 'changed',
      });
      places.gone.delete(copyId);
    } else {
      places.held.delete(copyId);
    }
  }
};

const trackCopy = (places: InkPlaces, read: InkPlaceRead, id: string) => {
  const tracked = places.copies.get(id);

  if (tracked) return tracked;

  const copy = read.copy(id);

  if (!copy) return undefined;

  const block = places.blocks.get(copy.block);

  places.copies.set(id, copy);
  if (block) block.copies.set(id, copy);
  else {
    places.blocks.set(copy.block, {
      copies: new Map([[id, copy]]),
      key: null,
    });
  }
  resolveBlock(places, read.state, copy.block);

  return copy;
};

const untrackCopy = (places: InkPlaces, id: string) => {
  const copy = places.copies.get(id);
  const block = copy && places.blocks.get(copy.block);

  if (!copy || !block) return;
  places.copies.delete(id);
  places.held.delete(id);
  places.gone.delete(id);
  block.copies.delete(id);
  if (block.copies.size > 0) return;
  places.blocks.delete(copy.block);
  if (block.key !== null && places.blockOfKey.get(block.key) === copy.block) {
    places.blockOfKey.delete(block.key);
  }
};

const startEpoch = (places: InkPlaces) => {
  places.chainEnds.next.clear();
  places.chainEnds.previous.clear();
  places.walked.clear();
  places.gone.clear();
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
    metrics.hops += 1;
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
    places.walked.add(passed);
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

const placesOf = ({ editor, state }: InkPlaceRead) => {
  const identity = state.schema.identity();
  const owner = getEditorRuntimeOwner(editor);
  const version = getSnapshotVersion(owner);
  const document =
    readShownDocument(editor) ??
    (getActiveEditorUpdateId(editor) ? state.value() : null);

  if (document) {
    const shown = shownPlaces.get(document);

    if (shown?.version === version && shown.places.identity === identity) {
      return shown.places;
    }

    const places = emptyPlaces(identity);

    shownPlaces.set(document, { places, version });

    return places;
  }

  const kept = committed.get(owner);

  if (kept?.version === version && kept.places.identity === identity) {
    return kept.places;
  }

  const store = getValueRecords(state.value());
  const places = emptyPlaces(identity);

  committed.set(owner, {
    places,
    sets: {
      [COPIES]: getRecordSetVersion(store, COPIES),
      [GONE]: getRecordSetVersion(store, GONE),
    },
    version,
  });

  return places;
};

export const readInkPlace = (read: InkPlaceRead, copyId: string) =>
  placeOf(placesOf(read), read, copyId);

const addArrivedBlocks = (
  places: InkPlaces,
  state: InkState,
  keys: Iterable<NodeKey>,
  dirty: Set<string>
) => {
  for (const key of keys) {
    const [node] = state.nodes.get(key) ?? [];
    const id = node && idOf(node);

    if (id === undefined) continue;
    if (places.blocks.has(id)) dirty.add(id);
    if (places.walked.has(id)) startEpoch(places);
  }
};

export const advanceInkPlaces = (
  editor: RuntimeAnyEditor,
  commit: EditorCommit
) => {
  const owner = getEditorRuntimeOwner(editor);
  const kept = committed.get(owner);

  if (!kept || commit.version <= kept.version) return;
  if (
    commit.previousVersion !== kept.version ||
    commit.changed.hasAny('replace')
  ) {
    committed.delete(owner);

    return;
  }

  const { places, sets } = kept;
  const { changed } = commit;
  const store = getValueRecords(getEditorCommitValue(commit));
  const changedIn = (set: keyof typeof sets) => {
    const before = sets[set];

    sets[set] = getRecordSetVersion(store, set);

    return recordSetChanges(before, sets[set]);
  };

  if (changedIn(GONE).some((id) => places.walked.has(id))) {
    startEpoch(places);
  }
  for (const id of changedIn(COPIES)) untrackCopy(places, id);

  const dirty = new Set<string>();
  const moved = changed.hasAny('structure') || changed.hasAny('properties');
  const keys = moved
    ? [...changed.nodeKeysAll('node'), ...changed.nodeKeysAll('presence')]
    : changed.nodeKeysAll('node');

  for (const key of keys) {
    const block = places.blockOfKey.get(key);

    if (block !== undefined) dirty.add(block);
  }

  const watches = places.copies.size > 0 || places.walked.size > 0;

  if (moved) places.gone.clear();
  if (dirty.size > 0 || (moved && watches)) {
    withStoredAuthoredRead(editor, () =>
      editor.read((state) => {
        if (state.schema.identity() !== places.identity) {
          committed.delete(owner);

          return;
        }
        if (moved) addArrivedBlocks(places, state, keys, dirty);
        for (const block of dirty) resolveBlock(places, state, block);
      })
    );
  }
  kept.version = commit.version;
};
