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
  readShownRecords,
  type RuntimeAnyEditor,
  withStoredAuthoredRead,
} from '../../../facade';
import type { InkCopy, InkCopyPlace, InkMark } from './BaseInkPlugin';
import {
  COPIES,
  GONE,
  goneIn,
  idOf,
  MARKS,
  reachGone,
  walkGone,
} from './inkGone.internal';
import { inkText } from './inkMatch.internal';

type Side = 'next' | 'previous';

type HeldPlace = Extract<InkCopyPlace, { key: NodeKey }>;

export type InkMarkSign = Readonly<{
  place: InkCopyPlace;
  state: 'changed' | 'deleted';
}>;

export type InkDeletedSign = Readonly<{
  ids: readonly string[];
  marks: readonly InkMark[];
  place: InkCopyPlace;
}>;

type DeletedGroup = {
  anchor?: Readonly<{ id: string; side: Side; top: string }>;
  blocks: Set<string>;
  ids: Record<InkMark['direction'], readonly string[]>;
  marks: Record<InkMark['direction'], readonly InkMark[]>;
  members: Map<string, InkMark>;
  pending: Map<string, Readonly<{ joins: boolean; mark: InkMark }>>;
  place: InkCopyPlace;
  sign: InkMarkSign;
};

type KeptSign = {
  changed?: InkMarkSign;
  copies: readonly InkCopy[];
  group?: DeletedGroup;
  mark: InkMark;
};

type InkPlaces = {
  identity: object;
  schema: InkState['schema'];
  copies: Map<string, InkCopy>;
  blocks: Map<
    string,
    {
      copies: Map<string, InkCopy>;
      group?: DeletedGroup;
      holder: BlockHolder | null;
      signed: Set<string>;
    }
  >;
  blockOfKey: Map<NodeKey, string>;
  held: Map<string, HeldPlace>;
  chainEnds: Record<Side, Map<string, string>>;
  walked: Set<string>;
  signs: Map<string, KeptSign>;
  groups: Map<string, DeletedGroup>;
  changed: Set<DeletedGroup>;
  deleted?: readonly InkDeletedSign[];
  listed?: readonly InkMark[];
  stale: Map<string, InkMark>;
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

const metrics = { chains: 0, holders: 0, hops: 0, reads: 0, resolved: 0 };

const work = { copies: 0, groups: 0, members: 0, signs: 0 };

export const getInkPlaceMetrics = () => Object.freeze({ ...metrics, ...work });

const emptyPlaces = (schema: InkState['schema']): InkPlaces => ({
  blockOfKey: new Map(),
  blocks: new Map(),
  chainEnds: { next: new Map(), previous: new Map() },
  changed: new Set(),
  copies: new Map(),
  groups: new Map(),
  held: new Map(),
  identity: schema.identity(),
  schema,
  signs: new Map(),
  stale: new Map(),
  walked: new Set(),
});

const START: InkCopyPlace = { beside: { at: 'start' }, kind: 'gone' };

const beside = (side: Side, key: NodeKey): InkCopyPlace => ({
  beside: { at: side === 'previous' ? 'after' : 'before', key },
  kind: 'gone',
});

const keyOf = (place: InkCopyPlace) =>
  place.kind !== 'gone'
    ? `on:${place.key}`
    : place.beside.at === 'start'
      ? 'start'
      : `${place.beside.at}:${place.beside.key}`;

export const byMark = (a: InkMark, b: InkMark) =>
  a.at - b.at || (a.id < b.id ? -1 : 1);

const size = (of: DeletedGroup) =>
  of.marks.ltr.length + of.marks.rtl.length + of.pending.size;

const touch = (places: InkPlaces) => {
  places.deleted = undefined;
  work.groups += 1;
};

const groupAt = (
  places: InkPlaces,
  place: InkCopyPlace,
  anchor?: DeletedGroup['anchor']
) => {
  let group = places.groups.get(keyOf(place));

  if (!group) {
    group = {
      anchor,
      blocks: new Set(),
      ids: { ltr: [], rtl: [] },
      marks: { ltr: [], rtl: [] },
      members: new Map(),
      pending: new Map(),
      place,
      sign: { place, state: 'deleted' },
    };
    places.groups.set(keyOf(place), group);
    touch(places);
  }

  return group;
};

const pend = (places: InkPlaces, kept: KeptSign, joins = true) => {
  kept.group?.pending.set(kept.mark.id, { joins, mark: kept.mark });
  if (kept.group) places.changed.add(kept.group);
  places.deleted = undefined;
};

const dropSign = (places: InkPlaces, mark: string) => {
  const kept = places.signs.get(mark);

  for (const { block } of kept?.copies ?? []) {
    places.blocks.get(block)?.signed.delete(mark);
  }
  if (!kept) return;
  pend(places, kept, false);
  places.signs.delete(mark);
  places.stale.set(mark, kept.mark);
};

const dissolve = (
  places: InkPlaces,
  from: DeletedGroup,
  into?: DeletedGroup
) => {
  const key = keyOf(from.place);

  if (places.groups.get(key) === from) places.groups.delete(key);
  places.changed.delete(from);
  touch(places);
  for (const id of from.blocks) {
    const block = places.blocks.get(id);

    into?.blocks.add(id);
    if (block?.group === from) block.group = into;
  }
  for (const id of [
    ...[...from.marks.ltr, ...from.marks.rtl].map((mark) => mark.id),
    ...from.pending.keys(),
  ]) {
    const kept = places.signs.get(id);

    if (kept?.group !== from) continue;
    kept.group = into;
    if (into) pend(places, kept);
    else dropSign(places, id);
  }
};

const moveGroup = (
  places: InkPlaces,
  group: DeletedGroup,
  place: InkCopyPlace,
  anchor?: DeletedGroup['anchor']
) => {
  const there = places.groups.get(keyOf(place));

  places.groups.delete(keyOf(group.place));
  touch(places);
  Object.assign(group, { anchor, place, sign: { place, state: 'deleted' } });
  const merges = there !== undefined && size(there) >= size(group);
  const into = merges ? there : group;

  places.groups.set(keyOf(place), into);
  if (there) dissolve(places, merges ? group : there, into);
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
  let moved = false;

  for (const [copyId, copy] of block.copies) {
    const was = places.held.get(copyId);
    const kind = text === copy.text ? 'live' : 'changed';

    if (at ? was?.key === at.key && was.kind === kind : !was) continue;
    if (at) places.held.set(copyId, { key: at.key, kind });
    else places.held.delete(copyId);
    moved = true;
  }
  if (at) block.group?.blocks.delete(id);
  if (at) block.group = undefined;
  if (moved) for (const mark of block.signed) dropSign(places, mark);
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
  block.copies.delete(id);
  if (block.copies.size > 0) return;
  places.blocks.delete(copy.block);
  block.group?.blocks.delete(copy.block);
  if (block.holder && places.blockOfKey.get(block.holder.key) === copy.block) {
    places.blockOfKey.delete(block.holder.key);
  }
};

const startEpoch = (places: InkPlaces) => {
  places.chainEnds.next.clear();
  places.chainEnds.previous.clear();
  places.walked.clear();
  for (const group of [...places.groups.values()]) {
    if (group.place.kind === 'gone') dissolve(places, group);
  }
};

const walkIn = (state: InkState, gone: RecordSetVersion) => ({
  holder: (id: string) => state.unique.holder('id', id) ?? undefined,
  record: (id: string) => goneIn(gone, id),
});

const goneGroupOf = (places: InkPlaces, read: InkPlaceRead, id: string) => {
  const block = places.blocks.get(id);

  if (block?.group) return block.group;

  const gone = getRecordSetVersion(readShownRecords(read.editor), GONE);
  const memo = { ...places.chainEnds, walked: places.walked };
  const { found, last } = walkGone(walkIn(read.state, gone), id, memo, metrics);
  const group = found
    ? groupAt(places, beside(found.side, found.holder.key), {
        ...found,
        top: last,
      })
    : groupAt(places, START);

  group.blocks.add(id);
  if (block) block.group = group;

  return group;
};

const reanchor = (
  places: InkPlaces,
  state: InkState,
  gone: RecordSetVersion,
  group: DeletedGroup
) => {
  const { anchor, place } = group;

  if (!anchor || place.kind !== 'gone' || place.beside.at === 'start') return;
  metrics.holders += 1;

  const holder = state.unique.holder('id', anchor.id);
  const memo = { ...places.chainEnds, walked: places.walked };
  const walk = walkIn(state, gone);
  const back = holder
    ? { found: { holder, id: anchor.id, side: anchor.side }, last: anchor.top }
    : reachGone(walk, anchor.id, anchor.side, memo, metrics);
  const top = goneIn(gone, anchor.id) ? back.last : anchor.top;
  const found =
    back.found ??
    (anchor.side === 'previous'
      ? reachGone(walk, top, 'next', memo, metrics).found
      : undefined);

  if (found?.side === anchor.side && found.holder.key === place.beside.key) {
    return;
  }
  if (found) {
    moveGroup(places, group, beside(found.side, found.holder.key), {
      ...found,
      top,
    });
  } else {
    dissolve(places, group);
  }
};

const keepSign = (places: InkPlaces, read: InkPlaceRead, mark: InkMark) => {
  work.signs += 1;

  const copies = mark.blocks.flatMap(
    (block) => trackCopy(places, read, block.copy) ?? []
  );

  places.stale.delete(mark.id);
  if (copies.length < mark.blocks.length) return undefined;

  const held = copies.map((copy) => places.held.get(copy.id));
  const shown = held.findIndex((place) => place?.kind !== 'live');
  const place = held[shown];
  const kept: KeptSign = { copies, mark };

  if (held.includes(undefined)) {
    kept.group = place
      ? groupAt(places, place)
      : goneGroupOf(places, read, copies[shown].block);
    pend(places, kept);
  } else if (!mark.margin && place?.kind === 'changed') {
    kept.changed = { place, state: 'changed' };
  }

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

const memoUpdates = new WeakSet<object>();

export const takeFirstChangeWalkMemo = (editor: RuntimeAnyEditor) => {
  const owner = getEditorRuntimeOwner(editor);
  const kept = committed.get(owner);
  const update = getActiveEditorUpdateId(editor);

  if (!update || memoUpdates.has(update)) return undefined;
  memoUpdates.add(update);

  return kept?.version === getSnapshotVersion(owner)
    ? kept.places.chainEnds
    : undefined;
};

export const readInkPlace = (read: InkPlaceRead, copyId: string) => {
  const places = placesOf(read);
  const copy = trackCopy(places, read, copyId);

  return (
    copy &&
    (places.held.get(copy.id) ?? goneGroupOf(places, read, copy.block).place)
  );
};

export type InkIndexedMark = Readonly<{ copies: readonly InkCopy[] }>;

const indexedMark = (places: InkPlaces, read: InkPlaceRead, mark: InkMark) =>
  places.signs.get(mark.id) ?? keepSign(places, read, mark);

export const readInkIndexedMark = (
  read: InkPlaceRead,
  mark: InkMark
): InkIndexedMark | undefined => indexedMark(placesOf(read), read, mark);

export const readInkSign = (
  read: InkPlaceRead,
  mark: InkMark
): InkMarkSign | undefined => {
  const kept = indexedMark(placesOf(read), read, mark);

  return kept?.group?.sign ?? kept?.changed;
};

type Cut = Readonly<{ at: number; mark?: InkMark }>;

const placeIn = (marks: readonly InkMark[], mark: InkMark) => {
  let from = 0;
  let to = marks.length;

  while (from < to) {
    const at = (from + to) >>> 1;

    work.members += 1;
    if (byMark(marks[at], mark) < 0) from = at + 1;
    else to = at;
  }

  return from;
};

const byCut = (a: Cut, b: Cut) =>
  a.at - b.at ||
  (a.mark && b.mark ? byMark(a.mark, b.mark) : a.mark ? -1 : b.mark ? 1 : 0);

const cutIn = <T>(
  of: readonly T[],
  cuts: readonly Cut[],
  add: (mark: InkMark) => T
) => {
  const pieces: Array<T | readonly T[]> = [];
  let from = 0;

  for (const { at, mark } of cuts) {
    pieces.push(of.slice(from, at));
    if (mark) pieces.push(add(mark));
    from = mark ? at : at + 1;
  }
  pieces.push(of.slice(from));

  return ([] as T[]).concat(...pieces);
};

const settle = (places: InkPlaces, group: DeletedGroup) => {
  const cuts: Record<InkMark['direction'], Cut[]> = { ltr: [], rtl: [] };

  for (const [id, { joins, mark }] of group.pending) {
    const member = group.members.get(id);

    if (member) {
      cuts[member.direction].push({
        at: placeIn(group.marks[member.direction], member),
      });
      group.members.delete(id);
    }
    if (joins) {
      cuts[mark.direction].push({
        at: placeIn(group.marks[mark.direction], mark),
        mark,
      });
      group.members.set(id, mark);
    }
  }
  for (const direction of ['ltr', 'rtl'] as const) {
    if (cuts[direction].length === 0) continue;
    work.copies += 1;
    cuts[direction].sort(byCut);
    group.marks[direction] = cutIn(
      group.marks[direction],
      cuts[direction],
      (mark) => mark
    );
    group.ids[direction] = cutIn(
      group.ids[direction],
      cuts[direction],
      (mark) => mark.id
    );
  }
  group.pending.clear();
  if (group.blocks.size + size(group) === 0) {
    places.groups.delete(keyOf(group.place));
  }
};

export const readInkDeletedSigns = (
  read: InkPlaceRead & Readonly<{ marks: () => readonly InkMark[] }>
) => {
  const places = placesOf(read);
  const marks = read.marks();

  if (places.listed !== marks) {
    places.listed = marks;
    for (const mark of marks) {
      if (places.signs.get(mark.id)?.mark !== mark) dropSign(places, mark.id);
    }
    places.stale = new Map(
      marks.flatMap((mark) =>
        places.signs.has(mark.id) ? [] : [[mark.id, mark]]
      )
    );
  }
  for (const mark of places.stale.values()) keepSign(places, read, mark);
  if (places.deleted) return places.deleted;
  for (const group of places.changed) settle(places, group);
  places.changed.clear();

  places.deleted = Object.freeze(
    [...places.groups.values()]
      .flatMap(({ ids, marks: of, place }) =>
        (['ltr', 'rtl'] as const).flatMap((direction): InkDeletedSign[] =>
          of[direction].length > 0
            ? [{ ids: ids[direction], marks: of[direction], place }]
            : []
        )
      )
      .sort((a, b) => byMark(a.marks[0], b.marks[0]))
  );

  return places.deleted;
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

        const anchored = keys.flatMap((key) =>
          (['previous', 'next'] as const).flatMap(
            (side) => places.groups.get(keyOf(beside(side, key))) ?? []
          )
        );

        for (const group of anchored) {
          if (places.groups.get(keyOf(group.place)) === group) {
            reanchor(places, state, sets[GONE], group);
          }
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
