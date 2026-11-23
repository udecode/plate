import type { EditorUniqueHolder } from '../../../core';
import {
  type EditorCommit,
  type EditorCoreStateView,
  getActiveEditorUpdateId,
  getEditorCommitNode,
  getEditorCommitValue,
  getEditorRuntimeOwner,
  getRecordSetVersion,
  getSnapshotVersion,
  getValueRecords,
  type Node,
  type NodeKey,
  type RecordSetVersion,
  recordSetChanges,
  readShownDocument,
  type RuntimeAnyEditor,
  withStoredAuthoredRead,
} from '../../../facade';
import type { InkCopy, InkCopyPlace, InkMark } from './BaseInkPlugin';
import {
  COPIES,
  GONE,
  goneIn,
  idOf,
  type SavedRecords,
} from './inkGone.internal';
import { inkText } from './inkMatch.internal';

export const MARKS = 'ink-marks';

type Side = 'next' | 'previous';

type HeldPlace = Extract<InkCopyPlace, { key: NodeKey }>;

type GonePlace = Extract<InkCopyPlace, { kind: 'gone' }>;

export type InkMarkSign = Readonly<{
  place: InkCopyPlace;
  state: 'changed' | 'deleted';
}>;

type KeptSign = {
  copies: readonly InkCopy[];
  shown?: { copy: InkCopy; sign: InkMarkSign };
};

type InkPlaces = {
  identity: object;
  schema: InkState['schema'];
  copies: Map<string, InkCopy>;
  blocks: Map<
    string,
    {
      copies: Map<string, InkCopy>;
      holder: BlockHolder | null;
      signed: Set<string>;
    }
  >;
  blockOfKey: Map<NodeKey, string>;
  held: Map<string, HeldPlace>;
  gone: Map<string, GonePlace>;
  chainEnds: Record<Side, Map<string, string>>;
  walked: Set<string>;
  signs: Map<string, KeptSign>;
};

type CommittedPlaces = {
  places: InkPlaces;
  sets: Record<typeof COPIES | typeof GONE | typeof MARKS, RecordSetVersion>;
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

const metrics = { holders: 0, hops: 0, reads: 0, resolved: 0 };

export const getInkPlaceMetrics = () => Object.freeze({ ...metrics });

const emptyPlaces = (schema: InkState['schema']): InkPlaces => ({
  blockOfKey: new Map(),
  blocks: new Map(),
  chainEnds: { next: new Map(), previous: new Map() },
  copies: new Map(),
  gone: new Map(),
  held: new Map(),
  identity: schema.identity(),
  schema,
  signs: new Map(),
  walked: new Set(),
});

const dropSign = (places: InkPlaces, mark: string) => {
  for (const { block } of places.signs.get(mark)?.copies ?? []) {
    places.blocks.get(block)?.signed.delete(mark);
  }
  places.signs.delete(mark);
};

type BlockHolder = Readonly<{ key: NodeKey; root: string }>;

type Holder = BlockHolder & Readonly<{ node: Node }>;

const holderIn = (state: InkState, id: string): Holder | undefined => {
  metrics.holders += 1;

  const holder = state.unique.holder('id', id);
  const [node] = (holder && state.nodes.get(holder.key)) || [];

  return holder && node
    ? { key: holder.key, node, root: holder.root }
    : undefined;
};

const keptHolderIn = (
  commit: EditorCommit,
  holder: BlockHolder | null | undefined
): Holder | undefined => {
  const [node] =
    (holder && getEditorCommitNode(commit, holder.key, holder.root)) || [];

  return holder && node ? { ...holder, node } : undefined;
};

const resolveBlock = (
  places: InkPlaces,
  id: string,
  at: Holder | undefined
) => {
  const block = places.blocks.get(id);

  if (!block) return;
  metrics.resolved += 1;

  if (block.holder?.key !== at?.key) {
    if (block.holder && places.blockOfKey.get(block.holder.key) === id) {
      places.blockOfKey.delete(block.holder.key);
    }
    if (at) places.blockOfKey.set(at.key, id);
    block.holder = at ? { key: at.key, root: at.root } : null;
  }

  const text = at && inkText(places.schema, at.node);

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
  for (const mark of block.signed) dropSign(places, mark);
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
      holder: null,
      signed: new Set(),
    });
  }
  resolveBlock(places, copy.block, holderIn(read.state, copy.block));

  return copy;
};

const untrackCopy = (places: InkPlaces, id: string) => {
  const copy = places.copies.get(id);
  const block = copy && places.blocks.get(copy.block);

  if (!copy || !block) return;
  for (const mark of block.signed) dropSign(places, mark);
  places.copies.delete(id);
  places.held.delete(id);
  places.gone.delete(id);
  block.copies.delete(id);
  if (block.copies.size > 0) return;
  places.blocks.delete(copy.block);
  if (block.holder && places.blockOfKey.get(block.holder.key) === copy.block) {
    places.blockOfKey.delete(block.holder.key);
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

const placeOfTracked = (
  places: InkPlaces,
  state: InkState,
  copy: InkCopy
): InkCopyPlace => {
  const known = places.held.get(copy.id) ?? places.gone.get(copy.id);

  if (known) return known;

  const { records } = state.value();
  const previous = nearestPresent(
    places,
    state,
    records,
    copy.block,
    'previous'
  );
  const anchor =
    previous ?? nearestPresent(places, state, records, copy.block, 'next');
  const gone: GonePlace = {
    beside: anchor
      ? { at: previous ? 'after' : 'before', key: anchor.key }
      : { at: 'start' },
    kind: 'gone',
  };

  places.gone.set(copy.id, gone);

  return gone;
};

const samePlace = (a: InkCopyPlace, b: InkCopyPlace) =>
  a === b ||
  (a.kind === 'gone' &&
    b.kind === 'gone' &&
    a.beside.at === b.beside.at &&
    (a.beside.at === 'start' ||
      b.beside.at === 'start' ||
      a.beside.key === b.beside.key));

const keepSign = (places: InkPlaces, read: InkPlaceRead, mark: InkMark) => {
  const copies = mark.blocks.flatMap(
    (block) => trackCopy(places, read, block.copy) ?? []
  );

  if (copies.length < mark.blocks.length) return undefined;

  const held = copies.map((copy) => places.held.get(copy.id));
  const deleted = copies.some((copy) => !places.held.has(copy.id));
  const changed =
    !mark.margin && held.some((place) => place?.kind === 'changed');
  const state = deleted ? 'deleted' : changed ? 'changed' : undefined;
  const copy = copies[held.findIndex((place) => place?.kind !== 'live')];
  const kept: KeptSign = {
    copies,
    shown: state && {
      copy,
      sign: { place: placeOfTracked(places, read.state, copy), state },
    },
  };

  places.signs.set(mark.id, kept);
  for (const { block } of copies) places.blocks.get(block)?.signed.add(mark.id);

  return kept;
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

    const places = emptyPlaces(state.schema);

    shownPlaces.set(document, { places, version });

    return places;
  }

  const kept = committed.get(owner);

  if (kept?.version === version && kept.places.identity === identity) {
    return kept.places;
  }

  const store = getValueRecords(state.value());
  const places = emptyPlaces(state.schema);

  committed.set(owner, {
    places,
    sets: {
      [COPIES]: getRecordSetVersion(store, COPIES),
      [GONE]: getRecordSetVersion(store, GONE),
      [MARKS]: getRecordSetVersion(store, MARKS),
    },
    version,
  });

  return places;
};

export const readInkPlace = (read: InkPlaceRead, copyId: string) => {
  const places = placesOf(read);
  const copy = trackCopy(places, read, copyId);

  return copy && placeOfTracked(places, read.state, copy);
};

export type InkIndexedMark = Readonly<{ copies: readonly InkCopy[] }>;

const indexedMark = (places: InkPlaces, read: InkPlaceRead, mark: InkMark) =>
  places.signs.get(mark.id) ?? keepSign(places, read, mark);

export const readInkIndexedMark = (
  read: InkPlaceRead,
  mark: InkMark
): InkIndexedMark | undefined => indexedMark(placesOf(read), read, mark);

export const readInkSign = (read: InkPlaceRead, mark: InkMark) => {
  const places = placesOf(read);
  const shown = indexedMark(places, read, mark)?.shown;

  if (!shown) return undefined;

  const place = placeOfTracked(places, read.state, shown.copy);

  if (!samePlace(shown.sign.place, place)) {
    shown.sign = { place, state: shown.sign.state };
  }

  return shown.sign;
};

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
  for (const id of changedIn(MARKS)) dropSign(places, id);

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
  if (places.schema.identity() !== places.identity) {
    committed.delete(owner);

    return;
  }
  if (moved && (dirty.size > 0 || watches)) {
    withStoredAuthoredRead(editor, () =>
      editor.read((state) => {
        metrics.reads += 1;
        addArrivedBlocks(places, state, keys, dirty);
        for (const block of dirty) {
          resolveBlock(places, block, holderIn(state, block));
        }
      })
    );
  } else {
    for (const id of dirty) {
      resolveBlock(
        places,
        id,
        keptHolderIn(commit, places.blocks.get(id)?.holder)
      );
    }
  }
  kept.version = commit.version;
};
