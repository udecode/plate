import type { DocumentChange, Editor, EditorDocumentValue, Value } from '..';
import {
  getInternalDocumentChangeRecords,
  valueRootIndex,
} from '../core/change/document-change';
import type { JsonEditorValue } from '../core/change/tokens';
import {
  type BlockWindow,
  type LaterEntry,
  type WindowWalk,
  walkWindow,
  windowsOf,
} from '../core/change/window';
import type { DraftGuardWindowTrack } from '../core/document-recorder';
import { getEditorRuntimeOwner } from '../core/editor-runtime';
import { getCompiledEditorSchema } from '../core/plugin-registry';
import { getRecordText, getValueRecords } from '../core/record-store';
import type { CompiledEditorSchema } from '../core/schema-compiler';
import { type GridRoles, gridRolesOf } from '../core/survival';
import { countCoreWork } from '../core/work';
import type { AnyEditor } from '../interfaces/editor';

export type HistoryReplayOrigin<V extends Value = Value> = Readonly<{
  base: EditorDocumentValue<V>;
  change: DocumentChange;
  outside: DocumentChange | null;
  track: DraftGuardWindowTrack | null;
}>;

export type HistoryCommitSlice<V extends Value = Value> = Readonly<{
  after: EditorDocumentValue<V>;
  before: EditorDocumentValue<V>;
  change: DocumentChange;
}>;

const SCHEMA_HAS_GRID = new WeakMap<CompiledEditorSchema, boolean>();

const schemaHasGrid = (schema: CompiledEditorSchema): boolean => {
  let has = SCHEMA_HAS_GRID.get(schema);

  if (has === undefined) {
    has = [...schema.elements.byType.values()].some(
      (element) => element.structure?.kind === 'grid'
    );
    SCHEMA_HAS_GRID.set(schema, has);
  }

  return has;
};

const rangeTouchesGrid = (
  value: JsonEditorValue,
  root: string,
  from: number,
  to: number,
  gridRoles: GridRoles
): boolean => {
  const index = valueRootIndex(value, root);

  for (const range of index.openContextAt(from)) {
    if (
      range.kind === 'element' &&
      gridRoles.roleOf(index.node(range.path)) !== null
    ) {
      return true;
    }
  }
  for (const range of index.nodeRangesTouching(from, to)) {
    if (
      range.kind === 'element' &&
      gridRoles.roleOf(index.node(range.path)) !== null
    ) {
      return true;
    }
  }

  return false;
};

const shouldTrackWindow = (
  editor: AnyEditor,
  before: JsonEditorValue,
  after: JsonEditorValue,
  change: DocumentChange
): boolean => {
  const schema = getCompiledEditorSchema(getEditorRuntimeOwner(editor));

  if (!schemaHasGrid(schema)) return false;

  const gridRoles = gridRolesOf(schema);
  let touches = false;

  change.iterChangedRanges((name, fromA, toA, fromB, toB) => {
    if (touches) return;
    const root = name ?? 'main';

    if (
      rangeTouchesGrid(before, root, fromA, toA, gridRoles) ||
      rangeTouchesGrid(after, root, fromB, toB, gridRoles)
    ) {
      touches = true;
    }
  });

  return touches;
};

const captureWrittenRecords = (
  change: DocumentChange,
  valueAfter: JsonEditorValue
): ReadonlyArray<readonly [string, string, string | undefined]> => {
  const records = getInternalDocumentChangeRecords(change);

  if (records.size === 0) return [];

  const store = getValueRecords(valueAfter);
  const out: Array<readonly [string, string, string | undefined]> = [];

  for (const [set, ids] of records) {
    for (const id of ids.keys()) {
      out.push(
        Object.freeze([set, id, getRecordText(store, set, id)] as const)
      );
    }
  }

  return Object.freeze(out);
};

const trackOf = (
  change: DocumentChange,
  windows: readonly BlockWindow[],
  recordsAt: JsonEditorValue
): DraftGuardWindowTrack => {
  const initial = Object.freeze(
    windows.map((window) => Object.freeze({ ...window }))
  );

  return Object.freeze({
    changesRoots: change.createRoots.size > 0 || change.deleteRoots.size > 0,
    dirty: false,
    initial,
    recordChanged: false,
    seenOther: false,
    windows: initial,
    writtenRecords: captureWrittenRecords(change, recordsAt),
  });
};

const createTrackFromCommit = (
  editor: AnyEditor,
  commit: Readonly<{
    after: JsonEditorValue;
    before: JsonEditorValue;
    change: DocumentChange;
  }>
): DraftGuardWindowTrack | null =>
  shouldTrackWindow(editor, commit.before, commit.after, commit.change)
    ? trackOf(
        commit.change,
        windowsOf(commit).map(({ after }) => after),
        commit.after
      )
    : null;

const createTrackFromReplay = (
  editor: AnyEditor,
  base: JsonEditorValue,
  replayChange: DocumentChange,
  restores?: JsonEditorValue
): DraftGuardWindowTrack | null => {
  const target = restores ?? replayChange.apply(base);

  return shouldTrackWindow(editor, base, target, replayChange)
    ? trackOf(
        replayChange,
        windowsOf({ after: target, before: base, change: replayChange }).map(
          ({ before }) => before
        ),
        base
      )
    : null;
};

export const createOrigin = <V extends Value>(
  editor: Editor<V>,
  base: EditorDocumentValue<V>,
  replayChange: DocumentChange,
  commit?: HistoryCommitSlice<V>,
  restores?: EditorDocumentValue<V>
): HistoryReplayOrigin<V> =>
  Object.freeze({
    base,
    change: replayChange,
    outside: null,
    track: commit
      ? createTrackFromCommit(editor, commit)
      : createTrackFromReplay(editor, base, replayChange, restores),
  });

export const mergeOrigin = <V extends Value>(
  editor: Editor<V>,
  prior: HistoryReplayOrigin<V> | null,
  current: EditorDocumentValue<V>,
  replayChange: DocumentChange,
  restores?: EditorDocumentValue<V>
): HistoryReplayOrigin<V> | null =>
  !prior ||
  prior.outside !== null ||
  prior.track?.seenOther === true ||
  prior.track?.dirty === true ||
  prior.track?.recordChanged === true
    ? null
    : createOrigin(editor, current, replayChange, undefined, restores);

const windowsEqual = (
  a: readonly BlockWindow[],
  b: readonly BlockWindow[]
): boolean => {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (
      a[i].root !== b[i].root ||
      a[i].start !== b[i].start ||
      a[i].end !== b[i].end
    ) {
      return false;
    }
  }

  return true;
};

const windowsKey = (windows: readonly BlockWindow[]): string =>
  windows
    .map((window) => `${window.root}:${window.start}:${window.end}`)
    .join('|');

export const isTrackActive = (track: DraftGuardWindowTrack | null): boolean =>
  track !== null &&
  !track.recordChanged &&
  !(track.dirty && track.seenOther && track.writtenRecords.length === 0);

export const stepWindowTrack = (
  track: DraftGuardWindowTrack | null,
  entry: LaterEntry,
  otherWriter: boolean,
  walkCache?: Map<string, WindowWalk>
): DraftGuardWindowTrack | null => {
  if (!track) return null;

  let { recordChanged } = track;

  if (
    !recordChanged &&
    track.writtenRecords.length > 0 &&
    getInternalDocumentChangeRecords(entry.change).size > 0
  ) {
    const store = getValueRecords(entry.after);

    for (const [set, id, expected] of track.writtenRecords) {
      if (getRecordText(store, set, id) !== expected) {
        recordChanged = true;
        break;
      }
    }
  }

  const seenOther = track.seenOther || otherWriter;

  if (track.dirty) {
    if (
      seenOther === track.seenOther &&
      recordChanged === track.recordChanged
    ) {
      return track;
    }

    return Object.freeze({ ...track, recordChanged, seenOther });
  }
  if (track.changesRoots && otherWriter) {
    return Object.freeze({ ...track, dirty: true, recordChanged, seenOther });
  }

  const key = windowsKey(track.windows);
  let walked = walkCache?.get(key);

  if (walked === undefined) {
    countCoreWork('windowWalks');
    walked = walkWindow(track.windows, [entry]);
    walkCache?.set(key, walked);
  }

  if (walked === 'crossed') {
    return Object.freeze({ ...track, dirty: true, recordChanged, seenOther });
  }

  const dirty = otherWriter && walked.writers.has(entry.writer);

  if (
    !dirty &&
    seenOther === track.seenOther &&
    recordChanged === track.recordChanged &&
    windowsEqual(walked.windows, track.windows)
  ) {
    return track;
  }

  return Object.freeze({
    ...track,
    dirty,
    recordChanged,
    seenOther,
    windows: walked.windows,
  });
};

export const rebuildOriginOverAbove = <V extends Value>(
  editor: Editor<V>,
  base: EditorDocumentValue<V>,
  change: DocumentChange,
  restores: EditorDocumentValue<V>,
  above: ReadonlyArray<
    Readonly<{
      base: EditorDocumentValue<V>;
      replay: Readonly<{
        change: DocumentChange;
        record: () => Readonly<{ after: EditorDocumentValue<V> }>;
      }>;
    }>
  >
): HistoryReplayOrigin<V> => {
  const origin = createOrigin(editor, base, change, undefined, restores);

  if (!origin.track || above.length === 0) return origin;

  let track: DraftGuardWindowTrack | null = origin.track;

  for (let i = above.length - 1; i >= 0; i -= 1) {
    const upper = above[i];
    const upperBefore = upper.replay.record().after;

    track = stepWindowTrack(
      track,
      {
        after: upper.base,
        before: upperBefore,
        change: upper.replay.change.invert(upper.base),
        writer: '__self__',
      },
      false
    );
  }

  return Object.freeze({ ...origin, track });
};

type TrackedKept<B> =
  | Readonly<{ branch: B; kind: 'program' }>
  | Readonly<{ kind: 'fallback'; plain: B }>
  | Readonly<{ branch: B; kind: 'wrap' }>;

type TrackedBranch<V extends Value, B extends TrackedBranch<V, B>> = Readonly<{
  hasActiveTrack: boolean;
  kept: TrackedKept<B> | null;
  next: B | null;
  origin: HistoryReplayOrigin<V> | null;
}>;

export const branchHasActiveTrack = <
  V extends Value,
  B extends TrackedBranch<V, B>,
>(
  origin: HistoryReplayOrigin<V> | null,
  next: B | null,
  kept: TrackedKept<B> | null
): boolean =>
  isTrackActive(origin?.track ?? null) ||
  (next?.hasActiveTrack ?? false) ||
  (kept
    ? kept.kind === 'fallback'
      ? kept.plain.hasActiveTrack
      : kept.branch.hasActiveTrack
    : false);

const stepBranchTracksInner = <V extends Value, B extends TrackedBranch<V, B>>(
  value: B | null,
  entry: LaterEntry,
  otherWriter: boolean,
  walkCache: Map<string, WindowWalk>,
  mapKept: (kept: B['kept'], map: (branch: B) => B | null) => B['kept']
): B | null => {
  if (!value || !value.hasActiveTrack) return value;

  const nextTrack = value.origin
    ? stepWindowTrack(value.origin.track, entry, otherWriter, walkCache)
    : null;
  const nextOrigin =
    value.origin && nextTrack !== value.origin.track
      ? Object.freeze({ ...value.origin, track: nextTrack })
      : value.origin;
  const nextChild = stepBranchTracksInner(
    value.next,
    entry,
    otherWriter,
    walkCache,
    mapKept
  );
  const nextKept = mapKept(value.kept, (other) =>
    stepBranchTracksInner(other, entry, otherWriter, walkCache, mapKept)
  );

  if (
    nextOrigin === value.origin &&
    nextChild === value.next &&
    nextKept === value.kept
  ) {
    return value;
  }

  countCoreWork('historyBranchRebuilds');

  return Object.freeze({
    ...value,
    hasActiveTrack: branchHasActiveTrack(nextOrigin, nextChild, nextKept),
    kept: nextKept,
    next: nextChild,
    origin: nextOrigin,
  });
};

export const stepBranchTracks = <
  V extends Value,
  B extends TrackedBranch<V, B>,
>(
  value: B | null,
  commit: HistoryCommitSlice<V>,
  otherWriter: boolean,
  mapKept: (kept: B['kept'], map: (branch: B) => B | null) => B['kept']
): B | null => {
  if (!value || !value.hasActiveTrack) return value;

  const entry: LaterEntry = {
    after: commit.after,
    before: commit.before,
    change: commit.change,
    writer: otherWriter ? '__other__' : '__self__',
  };

  return stepBranchTracksInner(
    value,
    entry,
    otherWriter,
    new Map<string, WindowWalk>(),
    mapKept
  );
};
