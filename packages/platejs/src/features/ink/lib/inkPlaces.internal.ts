import {
  type EditorCommit,
  type EditorCoreStateView,
  ElementApi,
  getActiveEditorUpdateId,
  getEditorCommitValue,
  getEditorRuntimeOwner,
  getRecordSetVersion,
  getSnapshotVersion,
  getValueRecords,
  type Node,
  type NodeKey,
  type RecordSetVersion,
  recordSetChanges,
  readRecord,
  readShownDocument,
  readShownElementById,
  readShownRecords,
  type RuntimeAnyEditor,
  withStoredAuthoredRead,
} from '../../../facade';
import type { InkCopy, InkCopyPlace, InkMark } from './BaseInkPlugin';
import { matchMarkBlock } from './inkAnchor.internal';
import { type InkText, inkHolds, inkText } from './inkMatch.internal';

export const COPIES = 'ink-copies';
export const DIGITIZED = 'ink-digitized';
export const MARKS = 'ink-marks';

export const isInkMarkShown = (
  digitized: RecordSetVersion | undefined,
  id: string
) => digitized === undefined || readRecord(digitized, id) === undefined;

export const idOf = (node: Node | null | undefined): string | undefined =>
  node && ElementApi.isElement(node) && typeof node.id === 'string'
    ? node.id
    : undefined;

type BlockHolder = ReturnType<typeof readShownElementById>;

type BlockEntry = {
  copies: Map<string, InkCopy>;
  holder: BlockHolder | null;
  marks: Set<InkMark>;
  text?: InkText;
};

type InkPlaces = {
  blockOfKey: Map<NodeKey, string>;
  blocks: Map<string, BlockEntry>;
  copies: Map<string, InkCopy>;
  held: Map<string, InkCopyPlace>;
  identity: object;
  indexed: Map<InkMark, InkIndexedMark>;
  liveMarks?: readonly InkMark[];
  liveMarksListed?: readonly InkMark[];
  schema: InkState['schema'];
};

type CommittedPlaces = {
  places: InkPlaces;
  sets: Record<
    typeof COPIES | typeof DIGITIZED | typeof MARKS,
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

export type InkIndexedMark = Readonly<{
  aligned: boolean;
  copies: readonly InkCopy[];
}>;

const committed = new WeakMap<object, CommittedPlaces>();
const shownPlaces = new WeakMap<
  object,
  Readonly<{ places: InkPlaces; version: number }>
>();
const EMPTY_SET = {} as RecordSetVersion;

const work = {
  fullBuilds: 0,
};

export const resetInkPlaceMetrics = () => {
  work.fullBuilds = 0;
};

export const getInkPlaceMetrics = () => ({ ...work });

export const byMark = (a: InkMark, b: InkMark) =>
  a.at - b.at || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

const setsOf = (records: ReturnType<typeof readShownRecords>) => ({
  [COPIES]: getRecordSetVersion(records, COPIES) ?? EMPTY_SET,
  [DIGITIZED]: getRecordSetVersion(records, DIGITIZED) ?? EMPTY_SET,
  [MARKS]: getRecordSetVersion(records, MARKS) ?? EMPTY_SET,
});

const emptyPlaces = (schema: InkState['schema']): InkPlaces => ({
  blockOfKey: new Map(),
  blocks: new Map(),
  copies: new Map(),
  held: new Map(),
  identity: schema.identity(),
  indexed: new Map(),
  schema,
});

const placesOf = (read: InkPlaceRead): InkPlaces => {
  const owner = getEditorRuntimeOwner(read.editor);
  const version = getSnapshotVersion(owner);
  const identity = read.state.schema.identity();
  const document =
    readShownDocument(read.editor) ??
    (getActiveEditorUpdateId(read.editor) ? read.state.value() : null);

  if (document) {
    const shown = shownPlaces.get(document);

    if (shown?.version === version && shown.places.identity === identity) {
      return shown.places;
    }

    const places = emptyPlaces(read.state.schema);

    shownPlaces.set(document, { places, version });

    return places;
  }

  const sets = setsOf(readShownRecords(read.editor));
  const kept = committed.get(owner);

  if (
    kept &&
    kept.version === version &&
    kept.places.identity === identity &&
    kept.sets[COPIES] === sets[COPIES] &&
    kept.sets[DIGITIZED] === sets[DIGITIZED] &&
    kept.sets[MARKS] === sets[MARKS]
  ) {
    return kept.places;
  }

  work.fullBuilds += 1;

  const places = emptyPlaces(read.state.schema);

  committed.set(owner, { places, sets, version });

  return places;
};

const holderText = (places: InkPlaces, entry: BlockEntry) => {
  if (!entry.holder) return undefined;
  entry.text ??= inkText(places.schema, entry.holder.node);

  return entry.text;
};

const trackBlock = (
  places: InkPlaces,
  read: InkPlaceRead,
  blockId: string
): BlockEntry => {
  let entry = places.blocks.get(blockId);

  if (!entry) {
    const holder = readShownElementById(read.editor, blockId);

    entry = { copies: new Map(), holder: holder ?? null, marks: new Set() };
    places.blocks.set(blockId, entry);
    if (holder) places.blockOfKey.set(holder.key, blockId);
  }

  return entry;
};

const trackCopy = (
  places: InkPlaces,
  read: InkPlaceRead,
  copyId: string
): InkCopy | undefined => {
  let copy = places.copies.get(copyId);

  if (!copy) {
    copy = read.copy(copyId);
    if (!copy) return undefined;
    places.copies.set(copyId, copy);

    const block = trackBlock(places, read, copy.block);

    block.copies.set(copy.id, copy);
    if (block.holder) {
      const now = holderText(places, block);

      places.held.set(copy.id, {
        key: block.holder.key,
        kind: now && inkHolds(copy, now) ? 'live' : 'changed',
      });
    }
  }

  return copy;
};

const invalidateBlockMarks = (places: InkPlaces, entry: BlockEntry) => {
  for (const mark of entry.marks) places.indexed.delete(mark);
  entry.marks.clear();
};

const untrackCopy = (places: InkPlaces, copyId: string) => {
  const copy = places.copies.get(copyId);

  if (!copy) return;
  places.copies.delete(copyId);
  places.held.delete(copyId);

  const entry = places.blocks.get(copy.block);

  if (!entry) return;
  entry.copies.delete(copyId);
  invalidateBlockMarks(places, entry);
  if (entry.copies.size === 0) {
    if (entry.holder) places.blockOfKey.delete(entry.holder.key);
    places.blocks.delete(copy.block);
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

    sets[set] = getRecordSetVersion(store, set) ?? EMPTY_SET;

    return recordSetChanges(before, sets[set]);
  };

  if (places.schema.identity() !== places.identity) {
    committed.delete(owner);

    return;
  }

  const copiesChanged = changedIn(COPIES);
  const marksChanged = changedIn(MARKS);
  const digitizedChanged = changedIn(DIGITIZED);

  for (const id of copiesChanged) untrackCopy(places, id);
  if (marksChanged.length > 0) {
    const droppedIds = new Set(marksChanged);

    for (const mark of [...places.indexed.keys()]) {
      if (droppedIds.has(mark.id)) places.indexed.delete(mark);
    }
  }
  if (
    copiesChanged.length > 0 ||
    marksChanged.length > 0 ||
    digitizedChanged.length > 0
  ) {
    places.liveMarks = undefined;
    places.liveMarksListed = undefined;
  }

  const dirty = new Set<string>();
  const moved = changed.hasAny('structure') || changed.hasAny('properties');
  const keys = moved
    ? [...changed.nodeKeysAll('node'), ...changed.nodeKeysAll('presence')]
    : changed.nodeKeysAll('node');

  for (const key of keys) {
    const block = places.blockOfKey.get(key);

    if (block !== undefined) dirty.add(block);
  }

  const refreshBlock = (blockId: string, entry: BlockEntry) => {
    const prevKey = entry.holder?.key;
    const prevNode = entry.holder?.node;

    if (entry.holder) places.blockOfKey.delete(entry.holder.key);

    const next = readShownElementById(editor, blockId);

    entry.holder = next ?? null;
    if (next) places.blockOfKey.set(next.key, blockId);
    if (prevKey === next?.key && prevNode === next?.node) return false;

    entry.text = undefined;
    for (const copy of entry.copies.values()) {
      if (next) {
        const now = holderText(places, entry);

        places.held.set(copy.id, {
          key: next.key,
          kind: now && inkHolds(copy, now) ? 'live' : 'changed',
        });
      } else {
        places.held.delete(copy.id);
      }
    }
    invalidateBlockMarks(places, entry);

    return true;
  };

  let anyBlockChanged = false;

  if (moved) {
    withStoredAuthoredRead(editor, () => {
      for (const [blockId, entry] of places.blocks) {
        if (refreshBlock(blockId, entry)) anyBlockChanged = true;
      }
    });
  } else if (dirty.size > 0) {
    withStoredAuthoredRead(editor, () => {
      for (const blockId of dirty) {
        const entry = places.blocks.get(blockId);

        if (entry && refreshBlock(blockId, entry)) anyBlockChanged = true;
      }
    });
  }

  if (anyBlockChanged) {
    places.liveMarks = undefined;
    places.liveMarksListed = undefined;
  }

  kept.version = commit.version;
};

export const readInkPlace = (
  read: InkPlaceRead,
  copyId: string
): InkCopyPlace | undefined => {
  const places = placesOf(read);
  const copy = trackCopy(places, read, copyId);

  return copy ? places.held.get(copy.id) : undefined;
};

export const readInkIndexedMark = (
  read: InkPlaceRead,
  mark: InkMark
): InkIndexedMark | undefined => {
  const places = placesOf(read);
  const cached = places.indexed.get(mark);

  if (cached) return cached;

  const copies: InkCopy[] = [];
  let aligned = true;

  for (const block of mark.blocks) {
    const copy = trackCopy(places, read, block.copy);

    if (!copy) return undefined;
    copies.push(copy);

    const entry = places.blocks.get(copy.block);

    entry?.marks.add(mark);
    if (!aligned) continue;

    const place = places.held.get(copy.id);

    if (!place) {
      aligned = false;
      continue;
    }
    if (place.kind === 'live' || mark.margin || copy.lines.length === 0) {
      continue;
    }

    const now = entry && holderText(places, entry);

    if (!now || matchMarkBlock(copy, block, now).kind === 'changed') {
      aligned = false;
    }
  }

  const indexed: InkIndexedMark = { aligned, copies };

  places.indexed.set(mark, indexed);

  return indexed;
};

export const readInkLiveMarks = (
  read: InkPlaceRead & Readonly<{ marks: () => readonly InkMark[] }>
): readonly InkMark[] => {
  const places = placesOf(read);
  const shown = read.marks();

  if (places.liveMarks && places.liveMarksListed === shown) {
    return places.liveMarks;
  }

  const live = Object.freeze(
    shown.filter((mark) => {
      const indexed = readInkIndexedMark(read, mark);

      return (
        indexed !== undefined &&
        indexed.aligned &&
        indexed.copies.every((copy) => copy.lines.length > 0)
      );
    })
  );

  places.liveMarks = live;
  places.liveMarksListed = shown;

  return live;
};
