import {
  type EditorCommit,
  type EditorCoreStateView,
  ElementApi,
  getActiveEditorUpdateId,
  getDocumentValueNode,
  getEditorCommitNode,
  getEditorCommitValue,
  getEditorRuntimeOwner,
  getRecordSetVersion,
  getSnapshotVersion,
  getValueRecords,
  MAIN_ROOT_KEY,
  type Node,
  type NodeKey,
  type Path,
  type RecordSetVersion,
  recordSetChanges,
  readShownDocument,
  readShownElementById,
  readShownRecords,
  type RuntimeAnyEditor,
  withStoredAuthoredRead,
} from '../../../facade';
import type { InkCopy, InkCopyPlace, InkMark } from './BaseInkPlugin';
import {
  besideAt,
  COPIES,
  DIGITIZED,
  GONE,
  goneIn,
  idOf,
  isInkMarkShown,
  MARKS,
  reachGone,
  walkGone,
} from './inkGone.internal';
import { inkHolds, inkText } from './inkMatch.internal';

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
  sets: Record<
    typeof COPIES | typeof DIGITIZED | typeof GONE | typeof MARKS,
    RecordSetVersion
  >;
  version: number;
};

type InkState = Pick<EditorCoreStateView, 'nodes' | 'schema' | 'value'>;

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

const work = { copies: 0, directions: 0, groups: 0, members: 0, signs: 0 };

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

const holderIn = (editor: RuntimeAnyEditor, id: string): Holder | undefined => {
  metrics.holders += 1;

  const entry = readShownElementById(editor, id);

  return entry
    ? { key: entry.key, node: entry.node, root: entry.root ?? MAIN_ROOT_KEY }
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

  const now = at && inkText(places.schema, at.node);
  let moved = false;

  for (const [copyId, copy] of block.copies) {
    const was = places.held.get(copyId);
    const kind = now && inkHolds(copy, now) ? 'live' : 'changed';

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
  resolveBlock(places, copy.block, holderIn(read.editor, copy.block));

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

const walkIn = (editor: RuntimeAnyEditor, gone: RecordSetVersion) => ({
  holder: (id: string) => readShownElementById(editor, id) ?? undefined,
  record: (id: string) => goneIn(gone, id),
});

const goneGroupOf = (places: InkPlaces, read: InkPlaceRead, id: string) => {
  const block = places.blocks.get(id);

  if (block?.group) return block.group;

  const gone = getRecordSetVersion(readShownRecords(read.editor), GONE);
  const memo = { ...places.chainEnds, walked: places.walked };
  const { found, last } = walkGone(
    walkIn(read.editor, gone),
    id,
    memo,
    metrics
  );
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
  editor: RuntimeAnyEditor,
  gone: RecordSetVersion,
  group: DeletedGroup
) => {
  const { anchor, place } = group;

  if (!anchor || place.kind !== 'gone' || place.beside.at === 'start') return;
  metrics.holders += 1;

  const holder = readShownElementById(editor, anchor.id);
  const memo = { ...places.chainEnds, walked: places.walked };
  const walk = walkIn(editor, gone);
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
      [DIGITIZED]: getRecordSetVersion(store, DIGITIZED),
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
  mark: InkMark,
  includeDigitized = false
): InkMarkSign | undefined => {
  if (
    !includeDigitized &&
    !isInkMarkShown(
      getRecordSetVersion(readShownRecords(read.editor), DIGITIZED),
      mark.id
    )
  ) {
    return undefined;
  }

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

const cutIn = (
  group: DeletedGroup,
  direction: InkMark['direction'],
  cuts: readonly Cut[]
) => {
  const marks = group.marks[direction];
  const ids = group.ids[direction];
  const nextMarks: InkMark[] = [];
  const nextIds: string[] = [];
  let from = 0;
  const keep = (to: number) => {
    for (; from < to; from++) {
      nextMarks.push(marks[from]);
      nextIds.push(ids[from]);
    }
  };

  work.copies += 1;
  for (const { at, mark } of cuts) {
    keep(at);
    if (mark) {
      nextMarks.push(mark);
      nextIds.push(mark.id);
    } else {
      from += 1;
    }
  }
  keep(marks.length);
  group.marks[direction] = nextMarks;
  group.ids[direction] = nextIds;
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
    work.directions += 1;
    cutIn(group, direction, cuts[direction].sort(byCut));
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

    const digitized = getRecordSetVersion(
      readShownRecords(read.editor),
      DIGITIZED
    );
    const shown = digitized
      ? marks.filter((mark) => isInkMarkShown(digitized, mark.id))
      : marks;
    const byId = new Map(shown.map((mark) => [mark.id, mark]));

    for (const [id, kept] of [...places.signs]) {
      if (byId.get(id) !== kept.mark) dropSign(places, id);
    }
    places.stale = new Map(
      shown.flatMap((mark) =>
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

const slideRemoval = (
  places: InkPlaces,
  commit: EditorCommit,
  gone: RecordSetVersion
) => {
  const { changed } = commit;
  const removed = new Set(changed.nodeKeysAll('presence'));

  if (removed.size === 0 || changed.hasAny('properties')) return false;

  const { index } = commit.before;
  const value = getEditorCommitValue(commit, 'before');
  const holdsAnotherBlock = (key: NodeKey) => {
    const path = removed.has(key) ? null : index.pathOf(key);

    return (
      path !== null &&
      idOf(getDocumentValueNode(value, path)) !==
        idOf(getEditorCommitNode(commit, key)?.[0] ?? null)
    );
  };

  if (changed.nodeKeysAll('node').some(holdsAnotherBlock)) return false;

  const left = new Map<NodeKey, Readonly<{ id?: string; path: Path }>>();

  for (const key of removed) {
    const path = index.pathOf(key);
    const node = path && getDocumentValueNode(value, path);

    if (!node) return false;
    if (
      ElementApi.isElement(node) &&
      node.children.some((_, at) => {
        const child = index.keyAt([...path, at]);

        return !child || !removed.has(child);
      })
    ) {
      return false;
    }
    left.set(key, { id: idOf(node), path });
  }

  const ids = new Set([...left.values()].flatMap(({ id }) => id ?? []));
  const skips = (path: Path) => {
    const key = index.keyAt(path);

    return !key || removed.has(key);
  };
  const keptBeside = (path: Path, side: Side) => {
    const found =
      side === 'previous'
        ? besideAt(value, path, -1, skips)
        : besideAt(
            value,
            [...path.slice(0, -1), (path.at(-1) ?? 0) + 1],
            1,
            skips
          );
    const key = found && index.keyAt(found.path);

    return found && key ? { id: found.id, key } : undefined;
  };
  const known = (id: string) => ids.has(id) || places.walked.has(id);
  const walk = {
    holder: (id: string) => (known(id) ? undefined : id),
    record: (id: string) => goneIn(gone, id),
  };
  const memo = { ...places.chainEnds, walked: places.walked };
  const landing = (id: string, path: Path, side: Side, top?: string) => {
    const first = reachGone(walk, id, side, memo, metrics);
    const from =
      first.found || side === 'next' || top === undefined
        ? undefined
        : goneIn(gone, id)
          ? first.last
          : top;
    const found =
      first.found ??
      (from === undefined
        ? undefined
        : reachGone(walk, from, 'next', memo, metrics).found);
    const to = found && keptBeside(path, found.side);

    if (!found) return { anchor: undefined, key: undefined };
    if (to?.id !== found.id) return undefined;

    return {
      anchor: { id: to.id, side: found.side, top: from ?? first.last },
      key: to.key,
    };
  };
  const steps: Array<() => void> = [];

  for (const [key, { id, path }] of left) {
    const block = places.blockOfKey.get(key);

    for (const side of ['previous', 'next'] as const) {
      const group = places.groups.get(keyOf(beside(side, key)));
      const anchor = group?.anchor;
      const hints = side === 'previous' && block !== undefined;

      if (anchor && anchor.id !== id) return false;
      if (id === undefined || !(anchor || hints)) continue;

      const lands = landing(id, path, side, anchor?.top);

      if (anchor && !lands) return false;
      if (!lands) continue;
      steps.push(() => {
        const into =
          lands.anchor && lands.key && beside(lands.anchor.side, lands.key);

        if (group && places.groups.get(keyOf(group.place)) === group) {
          if (into) moveGroup(places, group, into, lands.anchor);
          else dissolve(places, group);
        }

        const kept = block !== undefined && places.blocks.get(block);

        if (!hints || !into || !kept || lands.anchor?.side !== side) return;
        kept.group = groupAt(places, into, lands.anchor);
        kept.group.blocks.add(block);
      });
    }
  }
  for (const step of steps) step();

  return true;
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
  const digitizedChanged = changedIn(DIGITIZED);
  if (digitizedChanged.length > 0) places.listed = undefined;
  for (const id of digitizedChanged) dropSign(places, id);

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
  if (
    moved &&
    (dirty.size > 0 || watches) &&
    !slideRemoval(places, commit, sets[GONE])
  ) {
    withStoredAuthoredRead(editor, () =>
      editor.read((state) => {
        metrics.reads += 1;
        addArrivedBlocks(places, state, keys, dirty);
        for (const block of dirty) {
          resolveBlock(places, block, holderIn(editor, block));
        }

        const anchored = keys.flatMap((key) =>
          (['previous', 'next'] as const).flatMap(
            (side) => places.groups.get(keyOf(beside(side, key))) ?? []
          )
        );

        for (const group of anchored) {
          if (places.groups.get(keyOf(group.place)) === group) {
            reanchor(places, editor, sets[GONE], group);
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
