import isEqual from 'lodash/isEqual.js';

import {
  defineEffect,
  definePlugin,
  getEditorRuntimeOwner,
  nanoid,
  NodeApi,
  PathApi,
  PointApi,
  RangeApi,
  SelectionApi,
  TextApi,
  type Anchor,
  type Editor,
  type EditorDocumentRange,
  type EditorEffectHistoryReplayResult,
  type Location,
  type NodeKey,
  type Range,
  type Value,
} from '../../core';
import {
  type AnchorValue,
  type EditorCommit,
  type EditorUpdateTransaction,
  getAnchorRuntimeId,
  getAuthoredViewCommit,
  getViewCommitSource,
  isDocumentView,
  notifyObservers,
  type ReadonlyAnchor,
  readDocumentRange,
  readShownPreview,
  restoreAnchor,
  runEditorObserver,
  subscribeEditorViewState,
  withStoredAuthoredRead,
} from '../../facade';
import { readEditorAuthor } from '../../lib/editor/editorUser.internal';
import {
  createAnnotationStore,
  type AnnotationAnchor,
  type AnnotationChange,
} from './plite-comments.internal';

export type CommentUser = Readonly<{
  id: string;
  name: string;
  avatarUrl?: string;
}>;

/** A JSON value inside comment app data. */
export type CommentDataValue =
  | boolean
  | null
  | number
  | string
  | CommentDataList
  | CommentData;

/** A JSON array inside comment app data. */
export interface CommentDataList extends ReadonlyArray<CommentDataValue> {}

/**
 * App-owned JSON object on a thread or message, such as reactions or the model
 * that wrote it. Plate validates it as JSON, stores it with the record and
 * returns it unchanged; it never reads its keys.
 */
export interface CommentData {
  readonly [key: string]: CommentDataValue;
}

export type CommentMessage = Readonly<{
  body: Value;
  createdAt: string;
  id: string;
  userId: string;
  /** App data of this message. Edits keep it; `setData` changes it. */
  data?: CommentData;
  editedAt?: string;
}>;

/** Semantic target identity; mapped locations are read through attachment(). */
export type CommentTarget =
  | Readonly<{ type: 'range' }>
  | Readonly<{ id: string; type: 'change' }>;

export type CommentResolution = Readonly<{
  resolvedAt: string | null;
  userId: string | null;
}> | null;

export type CommentAttachment =
  | Readonly<{ range: Range; status: 'attached'; type: 'range' }>
  | Readonly<{ status: 'unavailable'; type: 'range' }>
  | Readonly<{ id: string; type: 'change' }>;

/** JSON-compatible thread data. Timestamps use ISO 8601 strings. */
export type CommentThread = Readonly<{
  createdAt: string;
  excerpt: string;
  id: string;
  messages: readonly CommentMessage[];
  resolution: CommentResolution;
  status: 'draft' | 'published';
  target: CommentTarget;
  userId: string;
  /** App data of the thread. Replies, edits and resolution keep it. */
  data?: CommentData;
}>;

type CommentCreationHistoryTransition = Readonly<{
  anchorId: number | null;
  attachment: EditorDocumentRange | null;
  messageId: string;
  previous: CommentThread | null;
  value: CommentThread | null;
}>;

const COMMENT_CREATION_HISTORY_REPLAYERS = new WeakMap<
  object,
  (
    transition: CommentCreationHistoryTransition
  ) => Promise<
    EditorEffectHistoryReplayResult<CommentCreationHistoryTransition>
  >
>();

const commentCreationHistoryEffect =
  defineEffect<CommentCreationHistoryTransition>({
    history: {
      replay: (editor, transition) => {
        const replay = COMMENT_CREATION_HISTORY_REPLAYERS.get(
          getEditorRuntimeOwner(editor)
        );

        return replay
          ? replay(transition)
          : {
              reason: 'comments-owner-unavailable',
              status: 'blocked',
            };
      },
    },
    invert: ({ previous, value, ...transition }) => ({
      ...transition,
      previous: value,
      value: previous,
    }),
    key: 'comments.creation',
  });

export type PendingComment = Readonly<{ excerpt: string }>;

/**
 * Ranges keyed by thread ID. A range in a named root carries that root on both
 * points. Save them with the exact document revision they address.
 */
export type CommentRanges = Readonly<Record<string, Range>>;

/**
 * Thread rows from the app's own tables and the ranges saved with the matching
 * document revision. Ordinary reload starts fresh undo.
 */
export type SavedComments = Readonly<{
  ranges: CommentRanges;
  threads: readonly CommentThread[];
}>;

/**
 * A saved row the last load dropped, or a saved range with no loaded thread. An
 * `orphan-range` keeps mapping and saving until its thread loads or the app
 * calls `discardOrphan`.
 */
export type CommentsLoadIssue = Readonly<{
  code:
    | 'duplicate-thread'
    | 'invalid-range'
    | 'invalid-thread'
    | 'orphan-range';
  id: string | null;
}>;

export type CreateCommentThreadInput = Readonly<{
  body: Value;
  /** App data for the new thread; its first message gets none. */
  data?: CommentData;
  excerpt?: string;
  id?: string;
  target:
    | Readonly<{ range: Range; type: 'range' }>
    | Readonly<{ id: string; type: 'change' }>;
  /**
   * Record-only writes recorded in the same history batch as the created thread
   * once `mutate` commits. Skipped on rejection, throw, or a read-only view.
   */
  withHistory?: (tx: EditorUpdateTransaction, thread: CommentThread) => void;
}>;

export type CommentOperation =
  | 'create'
  | 'createThread'
  | 'reply'
  | 'edit'
  | 'resolve'
  | 'reopen'
  | 'removeMessage'
  | 'removeThread'
  | 'publishDraft'
  | 'setData';

export type CommentMutationRequest = Readonly<{
  mutationId: string;
  operation: CommentOperation;
  previous: CommentThread | null;
  proposed: CommentThread | null;
  /** The range a create or draft publish saves, in the primary document. */
  range?: Range;
}>;

export type CommentMutationDecision =
  | Readonly<{ status: 'commit'; thread: CommentThread | null }>
  | Readonly<{ code?: string; status: 'reject' }>;

export type CommentMutationResult<T = undefined> =
  | Readonly<{ status: 'applied'; value: T }>
  | Readonly<{ status: 'invalid' }>
  | Readonly<{ code?: string; status: 'rejected' }>
  | Readonly<{ status: 'stale' }>;

export type CommentsSnapshot = Readonly<{
  draftThreadIds: readonly string[];
  /** Rows the last load dropped, and one `orphan-range` per current orphan. */
  issues: readonly CommentsLoadIssue[];
  pending: PendingComment | null;
  threadIds: readonly string[];
  visibleThreadIds: readonly string[];
}>;

/** Semantic record changes. Document mapping uses subscribeAttachments instead. */
export type CommentsChange = Readonly<{
  ids: readonly string[];
}>;

export type CommentsPluginState = {
  activeIds: readonly string[];
  /** Loaded once, before mount, against the matching initial document. */
  initialComments: SavedComments | null;
  /** Authorize and persist before publication. Throws preserve the previous state. */
  mutate: (
    request: CommentMutationRequest
  ) => CommentMutationDecision | Promise<CommentMutationDecision>;
  users: Readonly<Record<string, CommentUser>>;
};

const initialState: CommentsPluginState = {
  activeIds: [],
  initialComments: null,
  mutate: ({ proposed }) => ({ status: 'commit', thread: proposed }),
  users: {},
};

const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const isCommentId = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;
const timestamp = (value: unknown) =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}T/.test(value) &&
  Number.isFinite(Date.parse(value));

const snapshotCommentData = (
  value: unknown,
  ancestors = new Set<object>()
): unknown => {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  ) {
    return value;
  }
  if (
    !value ||
    typeof value !== 'object' ||
    ancestors.has(value) ||
    (!Array.isArray(value) &&
      Object.getPrototypeOf(value) !== Object.prototype &&
      Object.getPrototypeOf(value) !== null)
  ) {
    throw new Error('Comments must contain JSON data');
  }
  ancestors.add(value);
  if (
    Array.isArray(value) &&
    Reflect.ownKeys(value).length !== value.length + 1
  ) {
    throw new Error('Comments must contain dense JSON arrays');
  }
  const copy: unknown[] | Record<string, unknown> = Array.isArray(value)
    ? []
    : {};
  for (const key of Reflect.ownKeys(value)) {
    if (Array.isArray(value) && key === 'length') continue;
    if (
      Array.isArray(value) &&
      (typeof key !== 'string' ||
        !/^(0|[1-9]\d*)$/.test(key) ||
        Number(key) >= value.length)
    ) {
      throw new Error('Comments must contain dense JSON arrays');
    }
    const property = Object.getOwnPropertyDescriptor(value, key);
    if (
      typeof key !== 'string' ||
      !property ||
      !Object.hasOwn(property, 'value') ||
      !property.enumerable
    ) {
      throw new Error('Comments must contain JSON data');
    }
    Object.defineProperty(copy, key, {
      value: snapshotCommentData(property.value, ancestors),
      enumerable: true,
    });
  }
  ancestors.delete(value);
  return Object.freeze(copy);
};

/** Validate the external canonical record before it becomes live state. */
const validateThread = (input: unknown): CommentThread => {
  if (
    !record(input) ||
    !isCommentId(input.id) ||
    !isCommentId(input.userId) ||
    !timestamp(input.createdAt) ||
    typeof input.excerpt !== 'string' ||
    (input.status !== 'published' && input.status !== 'draft') ||
    !record(input.target) ||
    (input.target.type === 'range'
      ? Object.keys(input.target).length !== 1
      : input.target.type !== 'change' ||
        !isCommentId(input.target.id) ||
        Object.keys(input.target).length !== 2) ||
    (input.data !== undefined && !record(input.data)) ||
    (input.resolution !== null &&
      (!record(input.resolution) ||
        (input.resolution.resolvedAt !== null &&
          !timestamp(input.resolution.resolvedAt)) ||
        (input.resolution.userId !== null &&
          !isCommentId(input.resolution.userId)))) ||
    !Array.isArray(input.messages) ||
    input.messages.length === 0
  ) {
    throw new Error('Invalid comment thread');
  }
  const messageIds = new Set<string>();
  for (const message of input.messages) {
    if (
      !record(message) ||
      !isCommentId(message.id) ||
      messageIds.has(message.id) ||
      !isCommentId(message.userId) ||
      !timestamp(message.createdAt) ||
      (message.editedAt !== undefined && !timestamp(message.editedAt)) ||
      (message.data !== undefined && !record(message.data)) ||
      !NodeApi.isNodeList(message.body, { deep: true }) ||
      !(message.body as Value)
        .map((node) => NodeApi.string(node))
        .join('\n')
        .trim()
    ) {
      throw new Error('Invalid comment message');
    }
    messageIds.add(message.id);
  }
  return input as CommentThread;
};

const withoutNullData = (value: unknown) => {
  if (!record(value) || value.data !== null) return value;
  const { data: _data, ...rest } = value;
  return Object.freeze(rest);
};

const prepareCommentThread = (input: unknown): CommentThread => {
  const thread = withoutNullData(snapshotCommentData(input));
  return validateThread(
    record(thread) && Array.isArray(thread.messages)
      ? Object.freeze({
          ...thread,
          messages: Object.freeze(thread.messages.map(withoutNullData)),
        })
      : thread
  );
};

const prepareCommentData = (input: unknown): CommentData | null | undefined => {
  if (input === undefined || input === null) return null;
  try {
    const data = snapshotCommentData(input);
    return record(data) ? (data as CommentData) : undefined;
  } catch {
    return undefined;
  }
};

const replaceCommentData = <T extends Readonly<{ data?: CommentData }>>(
  { data: _previous, ...rest }: T,
  data: CommentData | null
) => (data === null ? rest : { ...rest, data });

const ownValue = (value: object, key: PropertyKey) => {
  const property = Object.getOwnPropertyDescriptor(value, key);
  return property && Object.hasOwn(property, 'value')
    ? property.value
    : undefined;
};

const admitThreads = (value: unknown) => {
  const rows = record(value) ? ownValue(value, 'threads') : undefined;
  const ranges = record(value) ? ownValue(value, 'ranges') : undefined;
  if (!Array.isArray(rows) || !record(ranges)) {
    throw new Error('Saved comments need a threads array and a ranges record');
  }
  const threads = new Map<string, CommentThread>();
  const issues: CommentsLoadIssue[] = [];
  for (let index = 0; index < rows.length; index++) {
    const row = ownValue(rows, index);
    const rowId = record(row) ? ownValue(row, 'id') : undefined;
    let thread: CommentThread;
    try {
      thread = prepareCommentThread(row);
      if (thread.status !== 'published') throw new Error('Unpublished');
    } catch {
      issues.push({
        code: 'invalid-thread',
        id: isCommentId(rowId) ? rowId : null,
      });
      continue;
    }
    if (threads.has(thread.id)) {
      issues.push({ code: 'duplicate-thread', id: thread.id });
    } else threads.set(thread.id, thread);
  }
  return { issues, ranges, threads };
};

const freezeComment = <T>(value: T): T => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(freezeComment);
  }
  return value;
};

/**
 * Owns comment records and their native range lifetime for one editor.
 * Load initialComments from the app's thread rows and the ranges saved with
 * the exact document revision, and save api.ranges() with each revision.
 * Successful local thread creation joins session undo after durable commit,
 * except through a read-only view.
 * Other conversation actions stay independent; native anchors own mapping.
 */
export const BaseCommentsPlugin = definePlugin('comments', {
  effectTypes: [commentCreationHistoryEffect],
  initialState,
}).extend(({ editor, store }) => {
  const runtimeOwner = getEditorRuntimeOwner(editor);
  let threads = new Map<string, CommentThread>();
  const anchors = new Map<string, Anchor<Range>>();
  // Ranges saved while their thread is not loaded here; they paint nothing.
  const orphans = new Map<string, Anchor<Range>>();
  const rangesAwaitingMutate = new Map<string, Anchor<Range>>();
  const unsettledDrafts = new Set<string>();
  let sourcesByRoot = new Map<
    Anchor<Range>['root'],
    Array<{ id: string; anchor: AnnotationAnchor }>
  >();
  let anchorIds = new Map<ReadonlyAnchor<AnchorValue>, string>();
  let sourceOrder = new Map<string, number>();
  let composer: { anchor: Anchor<Range>; excerpt: string; id: string } | null =
    null;
  let snapshot: CommentsSnapshot = Object.freeze({
    draftThreadIds: Object.freeze([]),
    issues: Object.freeze([]),
    pending: null,
    threadIds: Object.freeze([]),
    visibleThreadIds: Object.freeze([]),
  });
  type ViewIndex = {
    annotations: ReturnType<typeof createAnnotationStore>;
    refreshers: Set<(input: { nodeKeys: readonly NodeKey[] }) => void>;
    unsubscribe: () => void;
  };
  type ThreadEntry = {
    keys: readonly NodeKey[];
    range: Range | null;
    root: Anchor<Range>['root'];
  };
  type ThreadIndex = {
    byKey: Map<NodeKey, Set<string>>;
    entries: Map<string, ThreadEntry>;
    unplacedByRoot: Map<Anchor<Range>['root'], Set<string>>;
  };
  type StoredChange = {
    keys: readonly NodeKey[];
    roots: Set<Anchor<Range>['root']>;
  };
  type AttachmentViewState = {
    listeners: Set<(change: AnnotationChange) => void>;
    preview: 'accepted' | 'proposed' | undefined;
    projected: Map<string, ThreadEntry> | null;
    rootTops: Map<string, string | null> | null;
    stopViewState: () => void;
  };
  const viewIndexes = new Map<Editor, ViewIndex>();
  const attachmentViews = new Map<Editor, AttachmentViewState>();
  const createThreadIndex = (): ThreadIndex => ({
    byKey: new Map(),
    entries: new Map(),
    unplacedByRoot: new Map(),
  });
  const storedIndex = createThreadIndex();
  let indexSchema: unknown;
  let stopIndexCommit: (() => void) | null = null;
  let passiveIndexes = new WeakMap<
    Editor,
    ReturnType<typeof createAnnotationStore>
  >();
  let destroyed = false;
  const queues = new Map<string, Promise<void>>();
  const generations = new Map<string, number>();
  const submitHolds = new Map<Anchor<Range>, number>();
  const releaseIfUnheld = (id: string, anchor: Anchor<Range> | undefined) => {
    if (
      !destroyed &&
      anchor &&
      anchors.get(id) !== anchor &&
      orphans.get(id) !== anchor &&
      composer?.anchor !== anchor &&
      !submitHolds.has(anchor)
    ) {
      anchor.release();
    }
  };
  const hold = (anchor: Anchor<Range> | undefined) => {
    if (anchor) submitHolds.set(anchor, (submitHolds.get(anchor) ?? 0) + 1);
  };
  const unhold = (id: string, anchor: Anchor<Range> | undefined) => {
    if (!anchor) return;
    const held = (submitHolds.get(anchor) ?? 0) - 1;
    if (held > 0) submitHolds.set(anchor, held);
    else submitHolds.delete(anchor);
    releaseIfUnheld(id, anchor);
  };
  const setOrphan = (id: string, anchor: Anchor<Range>) => {
    const displaced = orphans.get(id);
    orphans.set(id, anchor);
    releaseIfUnheld(id, displaced);
  };
  const dropComposer = () => {
    const dropped = composer;
    composer = null;
    if (dropped) releaseIfUnheld(dropped.id, dropped.anchor);
  };
  const threadListeners = new Map<string, Set<() => void>>();
  const visibleListeners = new Set<() => void>();
  const draftListeners = new Set<() => void>();
  const pendingListeners = new Set<() => void>();
  const dataListeners = new Set<(change: CommentsChange) => void>();
  const rangeListeners = new Set<() => void>();
  let savedRanges = new Map<string, Anchor<Range>>();
  let loadIssues: readonly CommentsLoadIssue[] = [];
  let snapshotOrphanIds: readonly string[] = [];
  let announcedOrphanIds: readonly string[] = [];
  let heldChanges: Array<() => void> | null = null;
  const deliver = <TArgs extends unknown[]>(
    listeners: ReadonlySet<(...args: TArgs) => void>,
    phase: 'commit-listener' | 'snapshot-listener',
    ...args: TArgs
  ) => {
    notifyObservers(
      editor,
      listeners,
      phase,
      (listener) => listener(...args),
      'comments'
    );
  };

  const isPageView = (view: Editor) => view.read.view.root() === undefined;
  const getAnnotations = (view: Editor) => {
    const observed = viewIndexes.get(view);
    if (observed) return observed.annotations;
    let annotations = passiveIndexes.get(view);
    if (!annotations) {
      annotations = createAnnotationStore(
        view,
        () => sourcesByRoot.get(view.read.view.root()) ?? [],
        { hideEmpty: true, id: 'comments' }
      );
      passiveIndexes.set(view, annotations);
    }
    return annotations;
  };
  const observeView = (view: Editor) => {
    let index = viewIndexes.get(view);
    if (!index) {
      const annotations = getAnnotations(view);
      passiveIndexes.delete(view);
      const refreshers = new Set<
        (input: { nodeKeys: readonly NodeKey[] }) => void
      >();
      const unsubscribe = annotations.subscribeChanges((change) =>
        queueChange(() => {
          if (change.reason !== 'editor' && change.nodeKeys.length) {
            deliver(refreshers, 'commit-listener', {
              nodeKeys: change.nodeKeys,
            });
          }
        })
      );
      index = {
        annotations,
        refreshers,
        unsubscribe,
      };
      viewIndexes.set(view, index);
    }
    return index;
  };
  const clearThreadIndex = (index: ThreadIndex) => {
    index.byKey.clear();
    index.entries.clear();
    index.unplacedByRoot.clear();
  };
  const detachThreadEntry = (
    index: ThreadIndex,
    id: string,
    entry: ThreadEntry
  ) => {
    for (const key of entry.keys) {
      const ids = index.byKey.get(key);
      ids?.delete(id);
      if (ids?.size === 0) index.byKey.delete(key);
    }
    if (!entry.keys.length) {
      const unplaced = index.unplacedByRoot.get(entry.root);
      unplaced?.delete(id);
      if (unplaced?.size === 0) index.unplacedByRoot.delete(entry.root);
    }
  };
  const updateThreadEntry = (
    index: ThreadIndex,
    id: string,
    reader: Editor,
    resolve: (anchor: Anchor<Range>) => Range | null
  ) => {
    const previous = index.entries.get(id);
    if (previous) detachThreadEntry(index, id, previous);
    const anchor = anchors.get(id);
    if (!anchor) {
      index.entries.delete(id);
      return {
        changed: previous !== undefined,
        keys: previous?.keys ?? [],
        previousRoot: previous?.root,
        root: undefined,
      };
    }
    const resolved = resolve(anchor);
    const nextRange = textIn(reader, resolved);
    const nextKeys = resolved ? nodeKeysAt(reader, resolved) : [];
    index.entries.set(id, {
      keys: nextKeys,
      range: nextRange,
      root: anchor.root,
    });
    if (nextKeys.length) {
      for (const key of nextKeys) {
        const ids = index.byKey.get(key) ?? new Set<string>();
        ids.add(id);
        index.byKey.set(key, ids);
      }
    } else {
      const unplaced =
        index.unplacedByRoot.get(anchor.root) ?? new Set<string>();
      unplaced.add(id);
      index.unplacedByRoot.set(anchor.root, unplaced);
    }
    return {
      changed: !previous || !RangeApi.equals(previous.range, nextRange),
      keys: [...(previous?.keys ?? []), ...nextKeys],
      previousRoot: previous?.root,
      root: anchor.root,
    };
  };
  const threadMatchesView = (
    viewRoot: Anchor<Range>['root'],
    root: Anchor<Range>['root']
  ) => viewRoot === undefined || root === viewRoot;
  const hasNamedThreads = () =>
    sourcesByRoot.size > (sourcesByRoot.has(undefined) ? 1 : 0);
  const readNamedRootTops = (view: Editor) => {
    const tops = new Map<string, string | null>();
    if (!hasNamedThreads()) return tops;
    const byRoot = new Map(
      view.read.roots().map((entry) => [entry.root, entry.top])
    );
    for (const root of sourcesByRoot.keys()) {
      if (root === undefined) continue;
      const top = byRoot.get(root);
      tops.set(root, top ? `${top.join('.')}:${view.key(top)}` : null);
    }
    return tops;
  };
  const placementChangedIn = (commit: EditorCommit) =>
    commit.changed.hasAny('structure') ||
    commit.changed.hasAny('properties') ||
    commit.changed.hasAny('replace');
  const placementThreadIds = (commit: EditorCommit, force = false) => {
    if (!hasNamedThreads() || (!force && !placementChangedIn(commit))) {
      return [];
    }
    const ids: string[] = [];
    for (const root of commit.changed.rootPlacements()) {
      for (const { id } of sourcesByRoot.get(root) ?? []) ids.push(id);
    }
    return ids;
  };
  const hasPageAttachmentView = () => {
    for (const view of attachmentViews.keys()) {
      if (!isDocumentView(view) && view.read.view.root() === undefined) {
        return true;
      }
    }
    return false;
  };
  const updateProjectedEntry = (
    projected: Map<string, ThreadEntry>,
    id: string,
    view: Editor
  ) => {
    const previous = projected.get(id);
    const anchor = anchors.get(id);
    if (!anchor || !threadMatchesView(view.read.view.root(), anchor.root)) {
      projected.delete(id);
      return {
        changed: previous !== undefined,
        keys: previous?.keys ?? [],
      };
    }
    const resolved = rangeIn(view, anchor);
    const nextRange = textIn(view, resolved);
    const nextKeys = resolved ? nodeKeysAt(view, resolved) : [];
    projected.set(id, {
      keys: nextKeys,
      range: nextRange,
      root: anchor.root,
    });
    return {
      changed: !previous || !RangeApi.equals(previous.range, nextRange),
      keys: [...(previous?.keys ?? []), ...nextKeys],
    };
  };
  const populateProjectedIndex = (
    view: Editor,
    projected: Map<string, ThreadEntry>
  ) => {
    projected.clear();
    const viewRoot = view.read.view.root();
    anchors.forEach((anchor, id) => {
      if (!threadMatchesView(viewRoot, anchor.root)) return;
      const resolved = rangeIn(view, anchor);
      projected.set(id, {
        keys: resolved ? nodeKeysAt(view, resolved) : [],
        range: textIn(view, resolved),
        root: anchor.root,
      });
    });
  };
  const announceAttachments = (
    view: Editor,
    state: AttachmentViewState,
    ids: Iterable<string>,
    reason: AnnotationChange['reason'],
    keys: Iterable<NodeKey> = []
  ) => {
    const uniqueIds = [...new Set(ids)];
    if (!uniqueIds.length) return;
    const uniqueKeys = [...new Set(keys)];
    queueChange(() => {
      if (attachmentViews.get(view) !== state) return;
      const liveIds =
        reason === 'editor'
          ? uniqueIds.filter((id) => anchors.has(id))
          : uniqueIds;
      if (!liveIds.length) return;
      const change = Object.freeze({
        ids: Object.freeze(liveIds),
        nodeKeys: Object.freeze(uniqueKeys),
        reason,
      });
      deliver(state.listeners, 'commit-listener', change);
    });
  };
  const reindexStored = (ids?: readonly string[]) => {
    const changed = new Map<string, StoredChange>();
    const targetIds =
      ids ?? new Set([...storedIndex.entries.keys(), ...anchors.keys()]);
    withStoredAuthoredRead(editor, () => {
      targetIds.forEach((id) => {
        const result = updateThreadEntry(storedIndex, id, editor, (anchor) =>
          anchor.resolve()
        );
        if (!result.changed) return;
        const roots = new Set<Anchor<Range>['root']>();
        if (result.previousRoot !== undefined || !anchors.has(id)) {
          roots.add(result.previousRoot);
        }
        if (anchors.has(id)) roots.add(result.root);
        changed.set(id, { keys: result.keys, roots });
      });
    });
    return changed;
  };
  const snapshotViewState = (view: Editor, state: AttachmentViewState) => {
    const viewRoot = view.read.view.root();
    const previousEntries = state.projected ?? storedIndex.entries;
    const ranges = new Map<string, ThreadEntry>();
    previousEntries.forEach((entry, id) => {
      if (threadMatchesView(viewRoot, entry.root)) ranges.set(id, entry);
    });
    const tops =
      viewRoot === undefined && hasNamedThreads()
        ? (state.rootTops ??
          withStoredAuthoredRead(editor, () => readNamedRootTops(editor)))
        : null;
    return { ranges, tops };
  };
  const syncViewProjection = (
    view: Editor,
    state: AttachmentViewState,
    previous = snapshotViewState(view, state),
    extraIds: readonly string[] = []
  ) => {
    const viewRoot = view.read.view.root();
    const nextPreview = readShownPreview(view);
    state.preview = nextPreview;
    if (nextPreview || isDocumentView(view)) {
      state.projected ??= new Map();
      populateProjectedIndex(view, state.projected);
    } else {
      state.projected = null;
    }
    const nextEntries = state.projected ?? storedIndex.entries;
    const ids = new Set<string>(extraIds);
    const keys = new Set<NodeKey>();
    const seen = new Set([...previous.ranges.keys(), ...nextEntries.keys()]);
    seen.forEach((id) => {
      const prev = previous.ranges.get(id);
      const next = nextEntries.get(id);
      if (next && !threadMatchesView(viewRoot, next.root)) return;
      if (
        Boolean(prev) !== Boolean(next) ||
        !RangeApi.equals(prev?.range ?? null, next?.range ?? null)
      ) {
        ids.add(id);
        for (const key of prev?.keys ?? []) keys.add(key);
        for (const key of next?.keys ?? []) keys.add(key);
      }
    });
    if (viewRoot === undefined && hasNamedThreads()) {
      const afterTops = state.projected
        ? readNamedRootTops(view)
        : withStoredAuthoredRead(editor, () => readNamedRootTops(editor));
      if (previous.tops) {
        for (const [root, group] of sourcesByRoot) {
          if (root === undefined) continue;
          if (previous.tops.get(root) !== afterTops.get(root)) {
            for (const { id } of group) ids.add(id);
          }
        }
      }
      state.rootTops = state.projected ? afterTops : null;
    } else {
      state.rootTops = null;
    }
    announceAttachments(view, state, ids, 'editor', keys);
  };
  const updateProjectedView = (
    view: Editor,
    projected: Map<string, ThreadEntry>,
    targetIds?: Iterable<string>
  ) => {
    const ids: string[] = [];
    const keys: NodeKey[] = [];
    const checkIds =
      targetIds ?? new Set([...projected.keys(), ...anchors.keys()]);
    for (const id of checkIds) {
      const result = updateProjectedEntry(projected, id, view);
      if (result.changed) {
        ids.push(id);
        keys.push(...result.keys);
      }
    }
    return { ids, keys };
  };
  const storedChangedForView = (
    storedChanged: Map<string, StoredChange>,
    viewRoot: Anchor<Range>['root']
  ) => {
    const ids: string[] = [];
    const keys: NodeKey[] = [];
    storedChanged.forEach((change, id) => {
      if (viewRoot === undefined || change.roots.has(viewRoot)) {
        ids.push(id);
        keys.push(...change.keys);
      }
    });
    return { ids, keys };
  };
  const syncAttachmentViews = (
    storedChanged: Map<string, StoredChange>,
    reason: AnnotationChange['reason'],
    ids?: readonly string[],
    baseCommit?: EditorCommit
  ) => {
    const basePlacements =
      baseCommit && hasPageAttachmentView()
        ? placementThreadIds(baseCommit, true)
        : [];
    for (const [view, state] of [...attachmentViews]) {
      if (
        !attachmentViews.has(view) ||
        (reason === 'editor' && isDocumentView(view))
      ) {
        continue;
      }
      const viewRoot = view.read.view.root();
      const pageView = viewRoot === undefined;
      const changed = state.projected
        ? updateProjectedView(view, state.projected, ids)
        : storedChangedForView(storedChanged, viewRoot);
      const changedIds = new Set(changed.ids);
      if (pageView && baseCommit) {
        const placements = state.projected
          ? placementThreadIds(getAuthoredViewCommit(view, baseCommit), true)
          : basePlacements;
        for (const id of placements) changedIds.add(id);
        if (state.projected && hasNamedThreads()) {
          state.rootTops = readNamedRootTops(view);
        }
      } else if (pageView && state.projected && hasNamedThreads()) {
        state.rootTops = readNamedRootTops(view);
      }
      announceAttachments(view, state, changedIds, reason, changed.keys);
    }
  };
  const runHeld = (work: () => void) => {
    if (heldChanges) {
      work();
      return () => {};
    }
    const changes: Array<() => void> = [];
    heldChanges = changes;
    try {
      work();
    } finally {
      heldChanges = null;
    }
    return () => changes.forEach((announce) => announce());
  };
  const onIndexCommit = (commit?: EditorCommit) => {
    if (destroyed || !attachmentViews.size) return;
    const baseCommit = commit && getViewCommitSource(commit);
    const nextSchema = editor.read.schema.identity();
    const reconfigured = nextSchema !== indexSchema;
    indexSchema = nextSchema;

    const pendingSwitches = new Map<
      Editor,
      ReturnType<typeof snapshotViewState>
    >();
    for (const [view, state] of attachmentViews) {
      if (!isDocumentView(view) && readShownPreview(view) !== state.preview) {
        pendingSwitches.set(view, snapshotViewState(view, state));
      }
    }

    if (
      baseCommit &&
      !reconfigured &&
      !pendingSwitches.size &&
      !baseCommit.changed.hasAny('document') &&
      !baseCommit.changed.hasAny('marks') &&
      !baseCommit.changed.hasAny('replace')
    ) {
      return;
    }

    const flush = runHeld(() => {
      if (!baseCommit || reconfigured) {
        syncAttachmentViews(reindexStored(), 'editor', undefined, baseCommit);
        return;
      }

      const storedCandidates = new Set<string>();
      for (const anchor of baseCommit.changed.anchors()) {
        const id = anchorIds.get(anchor);
        if (id !== undefined) storedCandidates.add(id);
      }
      for (const key of baseCommit.changed.nodeKeysAll('decoration')) {
        for (const id of storedIndex.byKey.get(key) ?? []) {
          const root = storedIndex.entries.get(id)?.root;
          if (
            baseCommit.changed.has('document', root) ||
            baseCommit.changed.has('marks', root)
          ) {
            storedCandidates.add(id);
          }
        }
      }
      for (const [root, ids] of storedIndex.unplacedByRoot) {
        if (baseCommit.changed.has('document', root)) {
          for (const id of ids) storedCandidates.add(id);
        }
      }
      const storedChanged = storedCandidates.size
        ? reindexStored([...storedCandidates])
        : new Map<string, StoredChange>();

      const placementIds = hasPageAttachmentView()
        ? placementThreadIds(baseCommit)
        : [];

      for (const [view, state] of [...attachmentViews]) {
        if (attachmentViews.get(view) !== state || isDocumentView(view)) {
          continue;
        }
        const viewRoot = view.read.view.root();
        const pageView = viewRoot === undefined;
        const switched = pendingSwitches.get(view);
        if (switched) {
          const extra = pageView
            ? readShownPreview(view)
              ? placementThreadIds(getAuthoredViewCommit(view, baseCommit))
              : placementIds
            : [];
          syncViewProjection(view, state, switched, extra);
          continue;
        }
        const { projected } = state;
        if (!projected) {
          const changed = storedChangedForView(storedChanged, viewRoot);
          const ids = new Set(changed.ids);
          if (pageView) {
            for (const id of placementIds) ids.add(id);
          }
          announceAttachments(view, state, ids, 'editor', changed.keys);
          continue;
        }

        const viewCommit = getAuthoredViewCommit(view, baseCommit);
        const viewCandidates = new Set<string>();
        for (const [root, group] of sourcesByRoot) {
          if (!threadMatchesView(viewRoot, root)) continue;
          if (
            viewCommit.changed.has('structure', root) ||
            viewCommit.changed.has('replace', root)
          ) {
            for (const { id } of group) viewCandidates.add(id);
          } else if (
            viewCommit.changed.has('document', root) ||
            viewCommit.changed.has('marks', root)
          ) {
            const decorationKeys = new Set(
              viewCommit.changed.nodeKeys('decoration', root)
            );
            for (const { id } of group) {
              const entry = projected.get(id);
              if (
                !entry ||
                !entry.keys.length ||
                entry.keys.some((key) => decorationKeys.has(key))
              ) {
                viewCandidates.add(id);
              }
            }
          }
        }
        for (const anchor of viewCommit.changed.anchors()) {
          const id = anchorIds.get(anchor);
          if (id !== undefined && threadMatchesView(viewRoot, anchor.root)) {
            viewCandidates.add(id);
          }
        }
        const changed = updateProjectedView(view, projected, viewCandidates);
        const ids = new Set(changed.ids);
        if (pageView) {
          const viewPlacements = placementThreadIds(viewCommit);
          for (const id of viewPlacements) ids.add(id);
          if (viewPlacements.length) state.rootTops = readNamedRootTops(view);
        }
        announceAttachments(view, state, ids, 'editor', changed.keys);
      }
    });
    flush();
  };
  const ensureThreadIndex = () => {
    if (stopIndexCommit) return;
    indexSchema = editor.read.schema.identity();
    clearThreadIndex(storedIndex);
    reindexStored();
    stopIndexCommit = editor.subscribeCommit(onIndexCommit);
  };
  const teardownThreadIndex = () => {
    if (attachmentViews.size > 0) return;
    stopIndexCommit?.();
    stopIndexCommit = null;
    clearThreadIndex(storedIndex);
  };
  const queueChange = (announce: () => void) => {
    if (heldChanges) heldChanges.push(announce);
    else announce();
  };
  const refreshViews = (ids?: readonly string[]) =>
    runHeld(() => {
      viewIndexes.forEach(({ annotations }) => {
        annotations.refresh(ids && { ids, reason: 'external' });
      });
      if (attachmentViews.size > 0) {
        syncAttachmentViews(reindexStored(ids), 'external', ids);
      }
    });
  const releaseView = (view: Editor) => {
    const index = viewIndexes.get(view);
    if (!index || index.refreshers.size) return;
    viewIndexes.delete(view);
    index.unsubscribe();
    passiveIndexes.set(view, index.annotations);
  };

  const notifyThreads = (ids: readonly string[]) => {
    ids.forEach((id) => {
      const listeners = threadListeners.get(id);
      if (listeners) deliver(listeners, 'snapshot-listener');
    });
    if (ids.length) {
      const change = Object.freeze({ ids: Object.freeze([...ids]) });
      deliver(dataListeners, 'snapshot-listener', change);
    }
  };
  const rangesToSave = () => {
    const saved = new Map(orphans);
    rangesAwaitingMutate.forEach((anchor, id) => saved.set(id, anchor));
    anchors.forEach((anchor, id) => {
      if (threads.get(id)?.status === 'published' || unsettledDrafts.has(id)) {
        saved.set(id, anchor);
      }
    });
    return saved;
  };
  const sameIds = (left: readonly string[], right: readonly string[]) =>
    left.length === right.length &&
    left.every((id, index) => id === right[index]);
  const currentIssues = () => {
    snapshotOrphanIds = [...orphans.keys()];
    return Object.freeze([
      ...loadIssues,
      ...snapshotOrphanIds.map((id) => ({ code: 'orphan-range' as const, id })),
    ]);
  };
  const refreshIssues = () => {
    if (!sameIds([...orphans.keys()], snapshotOrphanIds)) {
      snapshot = Object.freeze({ ...snapshot, issues: currentIssues() });
    }
  };
  const announceRanges = () => {
    if (destroyed) return;
    refreshIssues();
    const next = rangesToSave();
    if (
      sameIds(snapshotOrphanIds, announcedOrphanIds) &&
      next.size === savedRanges.size &&
      [...next].every(([id, anchor]) => savedRanges.get(id) === anchor)
    ) {
      return;
    }
    announcedOrphanIds = snapshotOrphanIds;
    savedRanges = next;
    deliver(rangeListeners, 'snapshot-listener');
  };
  const publish = (changes: {
    draft?: boolean;
    pending?: boolean;
    threads?: readonly string[];
    visible?: boolean;
  }) => {
    refreshIssues();
    if (changes.draft) deliver(draftListeners, 'snapshot-listener');
    if (changes.pending) deliver(pendingListeners, 'snapshot-listener');
    if (changes.visible) deliver(visibleListeners, 'snapshot-listener');
    if (changes.threads) notifyThreads(changes.threads);
    announceRanges();
  };
  const nodeKeysAt = (view: Editor, location: Location) => {
    const keys = new Set<NodeKey>();
    for (const [node] of view.read.nodes.entries({
      at: location,
      match: TextApi.isText,
    })) {
      keys.add(view.key(node));
    }
    return [...keys];
  };
  const refreshIds = (ids: readonly string[]) => {
    for (const [view, { annotations, refreshers }] of [...viewIndexes]) {
      const nodeKeys = new Set<NodeKey>();
      ids.forEach((id) => {
        const range = annotations.getAnnotation(id)?.range;
        if (range) nodeKeysAt(view, range).forEach((key) => nodeKeys.add(key));
      });
      if (nodeKeys.size) {
        deliver(refreshers, 'commit-listener', { nodeKeys: [...nodeKeys] });
      }
    }
  };
  let active: readonly string[] = [];
  let unsubscribeActive: (() => void) | null = null;
  const repaintActive = () => {
    const next = store.get('activeIds');
    if (next === active) return;
    const previous = active;
    active = next;
    refreshIds([...previous, ...next]);
  };
  const setActive = (ids: readonly string[]) => {
    if (destroyed) return;
    store.set({ activeIds: Object.freeze([...new Set(ids)]) });
  };
  const textIn = (
    view: { read: { ranges: { isEmpty: (range: Range) => boolean } } },
    range: Range | null
  ) => (range && !view.read.ranges.isEmpty(range) ? range : null);
  const storedText = (anchor: Anchor<Range>) =>
    withStoredAuthoredRead(editor, () => textIn(editor, anchor.resolve()));
  const syncSource = () => {
    sourcesByRoot = new Map();
    anchorIds = new Map();
    anchors.forEach((anchor, id) => {
      anchorIds.set(anchor, id);
      const group = sourcesByRoot.get(anchor.root) ?? [];
      group.push({ id, anchor });
      sourcesByRoot.set(anchor.root, group);
    });
    sourceOrder = new Map([...anchors.keys()].map((id, index) => [id, index]));
    passiveIndexes = new WeakMap();
  };
  const retainIds = (previous: readonly string[], next: string[]) =>
    previous.length === next.length &&
    previous.every((id, index) => id === next[index])
      ? previous
      : Object.freeze(next);
  const normalizeBody = (body: Value) => {
    if (!NodeApi.isNodeList(body, { deep: true })) return null;
    const next = structuredClone(body);
    return next
      .map((node) => NodeApi.string(node))
      .join('\n')
      .trim()
      ? freezeComment(next)
      : null;
  };
  const seed = store.get('initialComments');
  let initialComments = seed === null ? null : admitThreads(seed);
  threads = initialComments?.threads ?? new Map();
  snapshot = Object.freeze({
    ...snapshot,
    threadIds: Object.freeze([...threads.keys()]),
    visibleThreadIds: Object.freeze(
      [...threads.values()]
        .filter((thread) => !thread.resolution)
        .map((thread) => thread.id)
    ),
  });
  const assertTextRange = (reader: Editor, range: Range | null) => {
    if (!range) throw new Error('Invalid comment range');
    const root = SelectionApi.root(range);
    const children =
      root === undefined ? reader.read.children() : reader.read.root(root);
    for (const point of [range.anchor, range.focus]) {
      const node = NodeApi.getIf({ type: '', children }, point.path);
      if (!TextApi.isText(node) || point.offset > node.text.length) {
        throw new Error('Invalid comment range');
      }
    }
    return range;
  };
  const commandRange = (view: Editor, value: Range) =>
    assertTextRange(
      view,
      readDocumentRange(value, { view: view.read.view.root() })
    );
  const rangeIn = (view: Editor, anchor: Anchor<Range>) =>
    anchor.root === view.read.view.root() || isPageView(view)
      ? anchor.resolve(view)
      : null;
  const resolveIn = (view: Editor, anchor: Anchor<Range>) =>
    textIn(view, rangeIn(view, anchor));
  const locationRoot = (location: Location) => {
    if (PathApi.isPath(location)) return undefined;
    return PointApi.isPoint(location)
      ? location.root
      : SelectionApi.root(location);
  };
  const anchorAt = (range: Range) =>
    editor.anchor(range, { association: 'inward', deletion: 'nearest' });
  const admitRanges = (
    { issues, ranges, threads: loaded }: ReturnType<typeof admitThreads>,
    previousOrphans: ReadonlyMap<string, Anchor<Range>>
  ) => {
    const nextAnchors = new Map<string, Anchor<Range>>();
    const nextOrphans = new Map(previousOrphans);
    const rangeIssues: CommentsLoadIssue[] = [];
    for (const id of Object.keys(ranges)) {
      let range: Range;
      try {
        range = assertTextRange(
          editor,
          readDocumentRange(snapshotCommentData(ownValue(ranges, id)), 'saved')
        );
      } catch {
        rangeIssues.push({ code: 'invalid-range', id });
        continue;
      }
      const thread = loaded.get(id);
      if (thread && thread.target.type !== 'range') {
        rangeIssues.push({ code: 'invalid-range', id });
        continue;
      }
      nextOrphans.delete(id);
      (thread ? nextAnchors : nextOrphans).set(id, anchorAt(range));
    }
    nextOrphans.forEach((anchor, id) => {
      const thread = loaded.get(id);
      if (!thread) return;
      nextOrphans.delete(id);
      if (thread.target.type === 'range') nextAnchors.set(id, anchor);
      else rangeIssues.push({ code: 'invalid-range', id });
    });
    return {
      anchors: nextAnchors,
      issues: Object.freeze([...issues, ...rangeIssues]),
      orphans: nextOrphans,
    };
  };
  const initialize = () => {
    if (initialComments) {
      const loaded = admitRanges(initialComments, orphans);
      const previousOrphans = [...orphans];
      loaded.anchors.forEach((anchor, id) => anchors.set(id, anchor));
      orphans.clear();
      loaded.orphans.forEach((anchor, id) => orphans.set(id, anchor));
      previousOrphans.forEach(([id, anchor]) => releaseIfUnheld(id, anchor));
      loadIssues = loaded.issues;
      snapshot = Object.freeze({ ...snapshot, issues: currentIssues() });
    }
    initialComments = null;
    announcedOrphanIds = snapshotOrphanIds;
    savedRanges = rangesToSave();
    syncSource();
    refreshViews()();
    active = store.get('activeIds');
    unsubscribeActive = store.subscribe(repaintActive);
  };
  const replaceComments = (value: SavedComments) => {
    if (destroyed) return false;

    const admitted = admitThreads(value);
    const loaded = admitRanges(admitted, orphans);
    const changedIds = new Set([...threads.keys(), ...admitted.threads.keys()]);
    const previousSnapshot = snapshot;
    const retiredQueues = [...queues];
    const next = {
      draftThreadIds: Object.freeze([]),
      pending: null,
      threadIds: Object.freeze([...admitted.threads.keys()]),
      visibleThreadIds: Object.freeze(
        [...admitted.threads.values()]
          .filter((thread) => !thread.resolution)
          .map((thread) => thread.id)
      ),
    };

    queues.clear();
    rangesAwaitingMutate.clear();
    unsettledDrafts.clear();
    retiredQueues.forEach(([id, queue]) => {
      const generation = (generations.get(id) ?? 0) + 1;

      generations.set(id, generation);
      void queue.then(() => {
        if (!queues.has(id) && generations.get(id) === generation) {
          generations.delete(id);
        }
      });
    });
    const previousAnchors = [...anchors, ...orphans];
    anchors.clear();
    loaded.anchors.forEach((anchor, id) => anchors.set(id, anchor));
    orphans.clear();
    loaded.orphans.forEach((anchor, id) => orphans.set(id, anchor));
    dropComposer();
    previousAnchors.forEach(([id, anchor]) => releaseIfUnheld(id, anchor));
    ({ threads } = admitted);
    syncSource();
    loadIssues = loaded.issues;
    snapshot = Object.freeze({ ...next, issues: currentIssues() });
    const announce = refreshViews();
    setActive([]);
    announce();
    publish({
      draft: previousSnapshot.draftThreadIds.length > 0,
      pending: previousSnapshot.pending !== null,
      threads: [...changedIds],
      visible: true,
    });

    return true;
  };
  const setThread = (
    id: string,
    thread: CommentThread | null,
    anchor?: Anchor<Range>,
    afterWrite?: () => void
  ) => {
    const previous = threads.get(id);
    const previousAnchor = anchors.get(id);
    const previousOrphan = orphans.get(id);
    if (thread) {
      threads.set(id, thread);
      if (anchor) anchors.set(id, anchor);
      if (thread.status === 'published') {
        orphans.delete(id);
        unsettledDrafts.delete(id);
      }
    } else {
      threads.delete(id);
      anchors.delete(id);
      unsettledDrafts.delete(id);
      if (queues.has(id)) generations.set(id, (generations.get(id) ?? 0) + 1);
      else generations.delete(id);
    }
    const retiredComposer = thread && composer?.id === id ? composer : null;
    const handoff = retiredComposer !== null;
    if (handoff) composer = null;
    refreshIssues();
    const threadIds =
      previous && thread
        ? snapshot.threadIds
        : retainIds(snapshot.threadIds, [...threads.keys()]);
    const visibilityChanged =
      Boolean(previous) !== Boolean(thread) ||
      Boolean(previous?.resolution) !== Boolean(thread?.resolution);
    const draftChanged =
      (previous?.status === 'draft') !== (thread?.status === 'draft');
    const visibleThreadIds = visibilityChanged
      ? retainIds(
          snapshot.visibleThreadIds,
          threadIds.filter((key) => !threads.get(key)?.resolution)
        )
      : snapshot.visibleThreadIds;
    const draftThreadIds = draftChanged
      ? retainIds(
          snapshot.draftThreadIds,
          threadIds.filter((key) => threads.get(key)?.status === 'draft')
        )
      : snapshot.draftThreadIds;
    if (
      handoff ||
      threadIds !== snapshot.threadIds ||
      visibleThreadIds !== snapshot.visibleThreadIds ||
      draftThreadIds !== snapshot.draftThreadIds
    ) {
      snapshot = Object.freeze({
        ...snapshot,
        draftThreadIds,
        pending: handoff ? null : snapshot.pending,
        threadIds,
        visibleThreadIds,
      });
    }
    let announce = () => {
      if (visibilityChanged) refreshIds([id]);
    };
    // The history step runs commit observers, so every read agrees first. A
    // nested commit there can also consume a refresh that ran after it.
    if (previousAnchor !== anchors.get(id)) {
      syncSource();
      releaseIfUnheld(id, previousAnchor);
      announce = refreshViews([id]);
    }
    releaseIfUnheld(id, previousOrphan);
    releaseIfUnheld(id, retiredComposer?.anchor);
    if (afterWrite) {
      runEditorObserver(editor, 'after-commit', afterWrite, 'comments');
    }
    announce();
    const current = threads.get(id);
    if (
      (!current || current.resolution) &&
      store.get('activeIds').includes(id)
    ) {
      setActive(store.get('activeIds').filter((key) => key !== id));
    }
    publish({
      draft: draftChanged,
      pending: handoff,
      threads: [id],
      visible: visibilityChanged,
    });
  };
  const enqueue = <T>(
    id: string,
    run: () => Promise<CommentMutationResult<T>>
  ): Promise<CommentMutationResult<T>> => {
    const generation = generations.get(id) ?? 0;
    const result = (queues.get(id) ?? Promise.resolve()).then(() =>
      destroyed || generation !== (generations.get(id) ?? 0)
        ? { status: 'stale' as const }
        : run()
    );
    const settled = result.then(
      () => {},
      () => {}
    );
    queues.set(id, settled);
    void settled.then(() => {
      if (queues.get(id) === settled) {
        queues.delete(id);
        if (!threads.has(id)) generations.delete(id);
      }
    });
    return result;
  };
  const commitMutation = async (
    id: string,
    operation: CommentOperation,
    proposed: CommentThread | null,
    anchor?: Anchor<Range>,
    {
      afterWrite,
      isCurrent = () => true,
      allowEmpty = false,
    }: {
      afterWrite?: (canonical: CommentThread | null) => void;
      isCurrent?: () => boolean;
      allowEmpty?: boolean;
    } = {}
  ): Promise<CommentMutationResult> => {
    const previous = threads.get(id) ?? null;
    const generation = generations.get(id) ?? 0;
    if (destroyed || !isCurrent()) return { status: 'stale' };
    const location =
      operation === 'create' ||
      operation === 'createThread' ||
      operation === 'publishDraft'
        ? (anchor ?? anchors.get(id))
        : undefined;
    const isStale = () =>
      destroyed ||
      !isCurrent() ||
      generation !== (generations.get(id) ?? 0) ||
      (threads.get(id) ?? null) !== previous;
    const keptByThrownAttempt =
      orphans.get(id) ??
      (unsettledDrafts.has(id) ? anchors.get(id) : undefined);
    const dropUnwritten = () => {
      if (
        location &&
        location !== keptByThrownAttempt &&
        orphans.get(id) === location
      ) {
        orphans.delete(id);
        releaseIfUnheld(id, location);
      }
    };
    try {
      let range: Range | null = null;
      if (location) {
        const written = () =>
          allowEmpty ? location.resolve() : storedText(location);
        if (written()) {
          rangesAwaitingMutate.set(id, location);
          announceRanges();
          if (isStale()) {
            dropUnwritten();
            return { status: 'stale' };
          }
          range = written();
        }
        if (!range) {
          dropUnwritten();
          return { status: 'invalid' };
        }
      }
      let decision: CommentMutationDecision;
      try {
        decision = await store.get('mutate')(
          Object.freeze({
            mutationId: nanoid(),
            operation,
            previous,
            proposed,
            ...(range ? { range: freezeComment(structuredClone(range)) } : {}),
          })
        );
      } catch (error) {
        // The server may have stored the create or draft publish, so its range stays saved.
        if (location && !isStale()) {
          if (operation === 'publishDraft') unsettledDrafts.add(id);
          else setOrphan(id, location);
        }
        throw error;
      }
      if (decision.status === 'reject') dropUnwritten();
      if (isStale()) return { status: 'stale' };
      if (decision.status === 'reject') {
        return {
          status: 'rejected',
          ...(decision.code === undefined ? {} : { code: decision.code }),
        };
      }
      if (
        decision.status !== 'commit' ||
        (decision.thread === null) !== (proposed === null)
      ) {
        throw new Error('Invalid comment mutation decision');
      }
      const canonical =
        decision.thread === null ? null : prepareCommentThread(decision.thread);
      if (
        canonical &&
        (canonical.id !== id ||
          canonical.status !== 'published' ||
          canonical.target.type !== proposed?.target.type ||
          (canonical.target.type === 'change' &&
            proposed?.target.type === 'change' &&
            canonical.target.id !== proposed.target.id))
      ) {
        throw new Error(
          'Comment mutation cannot replace thread identity or target'
        );
      }
      setThread(
        id,
        canonical,
        anchor,
        afterWrite && (() => afterWrite(canonical))
      );
      return { status: 'applied', value: undefined };
    } finally {
      if (location && rangesAwaitingMutate.get(id) === location) {
        rangesAwaitingMutate.delete(id);
      }
      announceRanges();
    }
  };
  const sameThread = (
    left: CommentThread | null,
    right: CommentThread | null
  ) => isEqual(left, right);
  const replayCreation = async (
    transition: CommentCreationHistoryTransition
  ): Promise<
    EditorEffectHistoryReplayResult<CommentCreationHistoryTransition>
  > => {
    const thread = transition.value ?? transition.previous;
    if (!thread) {
      return { reason: 'comments-thread-changed', status: 'blocked' };
    }
    const result = await enqueue<
      EditorEffectHistoryReplayResult<CommentCreationHistoryTransition>
    >(thread.id, async () => {
      const current = threads.get(thread.id) ?? null;
      if (
        !sameThread(current, transition.previous) ||
        thread.messages.length !== 1 ||
        thread.messages[0]?.id !== transition.messageId
      ) {
        return {
          status: 'applied',
          value: {
            reason: 'comments-thread-changed',
            status: 'blocked',
          } as const,
        };
      }

      let restoredAnchor: Anchor<Range> | undefined;
      try {
        if (transition.value?.target.type === 'range') {
          if (!transition.attachment) {
            return {
              status: 'applied',
              value: {
                reason: 'comments-attachment-unavailable',
                status: 'blocked',
              } as const,
            };
          }
          const kept = orphans.get(thread.id);
          restoredAnchor =
            kept &&
            transition.anchorId !== null &&
            getAnchorRuntimeId(kept) === transition.anchorId
              ? kept
              : restoreAnchor(
                  editor,
                  transition.attachment,
                  transition.anchorId
                );
          hold(restoredAnchor);
          if (!restoredAnchor.resolve()) {
            return {
              status: 'applied',
              value: {
                reason: 'comments-attachment-unavailable',
                status: 'blocked',
              } as const,
            };
          }
        }

        let value: CommentThread | null = null;
        const removed = transition.value ? undefined : anchors.get(thread.id);
        const mutation = await commitMutation(
          thread.id,
          transition.value ? 'createThread' : 'removeThread',
          transition.value,
          restoredAnchor,
          {
            afterWrite: (canonical) => {
              value = canonical;
            },
            isCurrent: () =>
              sameThread(threads.get(thread.id) ?? null, transition.previous),
            allowEmpty: true,
          }
        );

        if (mutation.status !== 'applied') {
          return {
            status: 'applied',
            value: {
              reason:
                mutation.status === 'rejected' && mutation.code
                  ? `comments-${mutation.code}`
                  : `comments-${mutation.status}`,
              status: 'blocked',
            } as const,
          };
        }

        return {
          status: 'applied',
          value: {
            status: 'applied',
            value: Object.freeze({
              ...transition,
              anchorId: removed
                ? getAnchorRuntimeId(removed)
                : transition.anchorId,
              previous: current,
              value,
            }),
          } as const,
        };
      } catch {
        return {
          status: 'applied',
          value: {
            reason: 'comments-mutation-failed',
            status: 'blocked',
          } as const,
        };
      } finally {
        unhold(thread.id, restoredAnchor);
      }
    });

    return result.status === 'applied'
      ? result.value
      : { reason: `comments-${result.status}`, status: 'blocked' };
  };
  const mutateThread = (
    id: string,
    operation: CommentOperation,
    propose: (thread: CommentThread) => CommentThread | null | undefined
  ): Promise<CommentMutationResult> =>
    enqueue(id, async () => {
      const current = threads.get(id);
      if (
        !current ||
        (operation === 'publishDraft'
          ? current.status !== 'draft'
          : current.status !== 'published')
      ) {
        return { status: 'invalid' };
      }
      const proposed = propose(current);
      if (proposed === undefined) return { status: 'invalid' };
      return commitMutation(id, operation, proposed && freezeComment(proposed));
    });
  const cancel = () => {
    if (!composer) return;
    dropComposer();
    snapshot = Object.freeze({ ...snapshot, pending: null });
    publish({ pending: true });
  };
  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    if (
      COMMENT_CREATION_HISTORY_REPLAYERS.get(runtimeOwner) === replayCreation
    ) {
      COMMENT_CREATION_HISTORY_REPLAYERS.delete(runtimeOwner);
    }
    unsubscribeActive?.();
    stopIndexCommit?.();
    stopIndexCommit = null;
    clearThreadIndex(storedIndex);
    attachmentViews.forEach(({ listeners, projected, stopViewState }) => {
      stopViewState();
      listeners.clear();
      projected?.clear();
    });
    attachmentViews.clear();
    viewIndexes.forEach(({ annotations, refreshers, unsubscribe }) => {
      unsubscribe();
      annotations.destroy();
      refreshers.clear();
    });
    viewIndexes.clear();
    passiveIndexes = new WeakMap();
    new Set([
      ...(composer ? [composer.anchor] : []),
      ...anchors.values(),
      ...orphans.values(),
      ...submitHolds.keys(),
    ]).forEach((anchor) => anchor.release());
    composer = null;
    anchors.clear();
    anchorIds.clear();
    orphans.clear();
    submitHolds.clear();
    rangesAwaitingMutate.clear();
    unsettledDrafts.clear();
    threads.clear();
    initialComments = null;
    queues.clear();
    generations.clear();
    sourcesByRoot = new Map();
    sourceOrder.clear();
    snapshot = Object.freeze({
      draftThreadIds: Object.freeze([]),
      issues: Object.freeze([]),
      pending: null,
      threadIds: Object.freeze([]),
      visibleThreadIds: Object.freeze([]),
    });
    threadListeners.forEach((listeners) => listeners.clear());
    threadListeners.clear();
    visibleListeners.clear();
    draftListeners.clear();
    pendingListeners.clear();
    dataListeners.clear();
    rangeListeners.clear();
  };

  COMMENT_CREATION_HISTORY_REPLAYERS.set(runtimeOwner, replayCreation);

  return {
    activate: ({ beforePublish, onCleanup }) => {
      onCleanup(destroy);
      beforePublish(initialize);
    },
    api: ({ editor: commandEditor }) => {
      const prepareCreation = (
        input: CreateCommentThreadInput,
        status: CommentThread['status'],
        pending?: Anchor<Range>
      ) => {
        const id = input.id ?? nanoid();
        const body = normalizeBody(input.body);
        const data = prepareCommentData(input.data);
        if (
          !id ||
          !body ||
          data === undefined ||
          threads.has(id) ||
          destroyed
        ) {
          return null;
        }
        let range: Range | undefined;
        if (input.target.type === 'range') {
          range = commandRange(commandEditor, input.target.range);
          if (commandEditor.read.ranges.isEmpty(range)) return null;
        } else if (!input.target.id) return null;
        const createdAt = new Date().toISOString();
        const userId = readEditorAuthor(commandEditor);
        const thread = prepareCommentThread({
          createdAt,
          excerpt: input.excerpt ?? '',
          id,
          resolution: null,
          status,
          target:
            input.target.type === 'range' ? { type: 'range' } : input.target,
          userId,
          messages: [{ body, createdAt, id: nanoid(), userId }],
          ...(data && { data }),
        });
        const anchor =
          range &&
          (pending ??
            commandEditor.anchor(range, {
              association: 'inward',
              deletion: 'nearest',
            }));
        return { thread, anchor };
      };
      const submit = async (
        input: CreateCommentThreadInput,
        claimed?: NonNullable<typeof composer>
      ): Promise<CommentMutationResult<string>> => {
        const prepared = prepareCreation(input, 'published', claimed?.anchor);
        if (!prepared) return { status: 'invalid' };
        const { thread, anchor } = prepared;
        hold(anchor);
        try {
          return await enqueue(thread.id, async () => {
            if (threads.has(thread.id)) return { status: 'invalid' };
            const result = await commitMutation(
              thread.id,
              claimed ? 'create' : 'createThread',
              thread,
              anchor,
              {
                afterWrite: (canonical) => {
                  const viewRefuses =
                    commandEditor !== editor &&
                    commandEditor.read.view.isReadOnly();
                  if (!canonical || viewRefuses) return;
                  commandEditor.update((tx) => {
                    input.withHistory?.(tx, canonical);
                    tx.effects.emit(commentCreationHistoryEffect, {
                      anchorId: anchor ? getAnchorRuntimeId(anchor) : null,
                      attachment: anchor
                        ? commandEditor.anchor.save(anchor)
                        : null,
                      messageId: canonical.messages[0].id,
                      previous: null,
                      value: canonical,
                    });
                  });
                },
              }
            );
            return result.status === 'applied'
              ? { status: 'applied', value: thread.id }
              : result;
          });
        } finally {
          unhold(thread.id, anchor);
        }
      };
      return {
        /**
         * Start a comment at a range, or expand a caret to its text block. A
         * range without a root is in this view's root.
         */
        begin: (at: Range | null = commandEditor.read.selection()) => {
          if (!at || destroyed) return false;
          let range: Range | null = commandRange(commandEditor, at);
          if (commandEditor.read.ranges.isEmpty(range)) {
            const block = commandEditor.read.nodes.block({
              at: RangeApi.start(range),
            });
            range = block
              ? (commandEditor.read.ranges.get(block[0]) ?? null)
              : null;
          }
          if (!range || commandEditor.read.ranges.isEmpty(range)) return false;
          const anchor = commandEditor.anchor(range, {
            association: 'inward',
            deletion: 'nearest',
          });
          const excerpt = commandEditor.read.text.string(range);
          dropComposer();
          composer = { anchor, excerpt, id: nanoid() };
          snapshot = Object.freeze({
            ...snapshot,
            pending: Object.freeze({ excerpt }),
          });
          setActive([]);
          publish({ pending: true });
          return true;
        },
        /**
         * Dismiss the pending composer. A create already saving keeps its
         * range until it settles.
         */
        cancel,
        /** Publish from the pending selection; failure preserves the composer. */
        create: async (body: Value): Promise<CommentMutationResult<string>> => {
          const claimed = composer;
          const range = claimed && resolveIn(commandEditor, claimed.anchor);
          return claimed && range
            ? submit(
                {
                  body,
                  excerpt: claimed.excerpt,
                  id: claimed.id,
                  target: { type: 'range', range },
                },
                claimed
              )
            : { status: 'invalid' };
        },
        /**
         * Persist and publish at an explicit range or authored change ID. A
         * range without a root is in this view's root.
         */
        createThread: (input: CreateCommentThreadInput) => submit(input),
        /**
         * Allocate a local draft; only publishDraft invokes durable storage.
         * Returns null for an ID that holds an orphan or has an action in
         * flight.
         */
        createDraft: (input: CreateCommentThreadInput) => {
          const prepared = prepareCreation(input, 'draft');
          if (
            !prepared ||
            queues.has(prepared.thread.id) ||
            orphans.has(prepared.thread.id)
          ) {
            prepared?.anchor?.release();
            return null;
          }
          setThread(prepared.thread.id, prepared.thread, prepared.anchor);
          return prepared.thread.id;
        },
        /**
         * Retire an unpublished draft and its private range. A draft whose
         * publish is waiting on `mutate` or threw keeps its range as an orphan;
         * a publish that then makes no write drops it again, unless an earlier
         * publish of the draft threw.
         */
        discardDraft: (id: string) => {
          if (threads.get(id)?.status !== 'draft' || destroyed) return false;
          const anchor = anchors.get(id);
          if (
            anchor &&
            (unsettledDrafts.has(id) || rangesAwaitingMutate.get(id) === anchor)
          ) {
            setOrphan(id, anchor);
          }
          setThread(id, null);
          return true;
        },
        /** Edit a message after application authorization and persistence. */
        edit: (
          id: string,
          messageId: string,
          body: Value
        ): Promise<CommentMutationResult> => {
          const value = normalizeBody(body);
          return mutateThread(id, 'edit', (thread) =>
            !value || !thread.messages.some((item) => item.id === messageId)
              ? undefined
              : {
                  ...thread,
                  messages: Object.freeze(
                    thread.messages.map((item) =>
                      item.id === messageId
                        ? Object.freeze({
                            ...item,
                            body: value,
                            editedAt: new Date().toISOString(),
                          })
                        : item
                    )
                  ),
                }
          );
        },
        /** Stable membership and pending-composer state for targeted UI reads. */
        getSnapshot: () => snapshot,
        /** Read immutable conversation data; document mapping preserves identity. */
        getThread: (id: string) => threads.get(id),
        /** Read live semantic records. Save ranges() with the document. */
        getThreads: (): readonly CommentThread[] =>
          Object.freeze([...threads.values()]),
        /**
         * Replace every thread and range for the exact current document. Bad
         * rows drop alone and appear in the snapshot's issues.
         */
        replace: replaceComments,
        /**
         * Ranges to save with this exact document revision, keyed by thread ID:
         * published threads, creates and draft publishes waiting on `mutate`,
         * drafts whose publish threw, and orphans. Throws once the editor is
         * destroyed.
         */
        ranges: (): CommentRanges => {
          if (destroyed) {
            throw new Error('Cannot read comment ranges after destroy');
          }
          const result: Record<string, Range> = Object.create(null);
          rangesToSave().forEach((anchor, id) => {
            const range = anchor.resolve();
            if (range) result[id] = freezeComment(structuredClone(range));
          });
          return Object.freeze(result);
        },
        /**
         * Remove a range whose thread never loaded, such as a create the
         * server rejected after the range was saved.
         */
        discardOrphan: (id: string): 'discarded' | 'not-orphan' => {
          const orphan = orphans.get(id);
          if (!orphan || destroyed) return 'not-orphan';
          orphans.delete(id);
          releaseIfUnheld(id, orphan);
          announceRanges();
          return 'discarded';
        },
        /**
         * Observe a thread gaining, losing or replacing its saved range, such as
         * a create that changes no document value. Document mapping never
         * wakes it.
         */
        subscribeRanges: (listener: () => void) => {
          if (destroyed) return () => {};
          rangeListeners.add(listener);
          return () => {
            rangeListeners.delete(listener);
          };
        },
        /** Resolve the pending selection without exposing its native handle. */
        pendingRange: () =>
          freezeComment(
            structuredClone(
              composer ? resolveIn(commandEditor, composer.anchor) : null
            )
          ),
        /** Persist a local draft; discard during the request fences late completion. */
        publishDraft: (id: string) =>
          mutateThread(id, 'publishDraft', (thread) => ({
            ...thread,
            status: 'published',
          })),
        /** Remove a message; the final message removes the thread. */
        removeMessage: (id: string, messageId: string) =>
          mutateThread(id, 'removeMessage', (thread) =>
            !thread.messages.some((message) => message.id === messageId)
              ? undefined
              : thread.messages.length === 1
                ? null
                : {
                    ...thread,
                    messages: thread.messages.filter(
                      (message) => message.id !== messageId
                    ),
                  }
          ),
        /** Remove after authorization; document undo never recreates conversations. */
        removeThread: (id: string) =>
          mutateThread(id, 'removeThread', () => null),
        /**
         * Add the current user's reply to an unresolved thread, with optional
         * app data for the new message.
         */
        reply: (
          id: string,
          body: Value,
          options: Readonly<{ data?: CommentData }> = {}
        ): Promise<CommentMutationResult> => {
          const value = normalizeBody(body);
          const data = prepareCommentData(options.data);
          return mutateThread(id, 'reply', (current) =>
            !value || data === undefined || current.resolution
              ? undefined
              : {
                  ...current,
                  messages: Object.freeze([
                    ...current.messages,
                    Object.freeze({
                      body: value,
                      createdAt: new Date().toISOString(),
                      id: nanoid(),
                      userId: readEditorAuthor(commandEditor),
                      ...(data && { data }),
                    }),
                  ]),
                }
          );
        },
        /**
         * Replace the app data of a published thread, or of one of its messages
         * when `messageId` is given, after `mutate` commits it. `null` removes
         * it.
         */
        setData: (
          id: string,
          data: CommentData | null,
          options: Readonly<{ messageId?: string }> = {}
        ): Promise<CommentMutationResult> => {
          const next = prepareCommentData(data);
          const { messageId } = options;
          return mutateThread(id, 'setData', (thread) =>
            next === undefined
              ? undefined
              : messageId === undefined
                ? replaceCommentData(thread, next)
                : thread.messages.some((message) => message.id === messageId)
                  ? {
                      ...thread,
                      messages: thread.messages.map((message) =>
                        message.id === messageId
                          ? replaceCommentData(message, next)
                          : message
                      ),
                    }
                  : undefined
          );
        },
        /** Close a discussion outside document history. Reopen is its inverse. */
        resolve: (id: string) =>
          mutateThread(id, 'resolve', (thread) =>
            thread.resolution
              ? undefined
              : {
                  ...thread,
                  resolution: {
                    resolvedAt: new Date().toISOString(),
                    userId: readEditorAuthor(commandEditor),
                  },
                }
          ),
        /** Reopen a resolved discussion without touching document history. */
        reopen: (id: string) =>
          mutateThread(id, 'reopen', (thread) =>
            thread.resolution ? { ...thread, resolution: null } : undefined
          ),
        /** Observe one record; unrelated metadata writes do not wake it. */
        subscribeThread: (id: string, listener: () => void) => {
          const listeners = threadListeners.get(id) ?? new Set<() => void>();
          listeners.add(listener);
          threadListeners.set(id, listeners);
          return () => {
            listeners.delete(listener);
            if (!listeners.size) threadListeners.delete(id);
          };
        },
        /** Observe semantic writes only; document mapping never wakes this channel. */
        subscribeThreads: (listener: (change: CommentsChange) => void) => {
          dataListeners.add(listener);
          return () => {
            dataListeners.delete(listener);
          };
        },
        subscribeVisibleThreadIds: (listener: () => void) => {
          visibleListeners.add(listener);
          return () => {
            visibleListeners.delete(listener);
          };
        },
        subscribeDraftThreadIds: (listener: () => void) => {
          draftListeners.add(listener);
          return () => {
            draftListeners.delete(listener);
          };
        },
        subscribePending: (listener: () => void) => {
          pendingListeners.add(listener);
          return () => {
            pendingListeners.delete(listener);
          };
        },
        idsAt: (location: Location) => {
          if (destroyed) return Object.freeze([]);
          const viewRoot = commandEditor.read.view.root();
          const root = locationRoot(location) ?? viewRoot;
          const annotations =
            root === viewRoot
              ? viewIndexes.get(commandEditor)?.annotations
              : undefined;
          if (!annotations) {
            if (
              attachmentViews.size > 0 &&
              !readShownPreview(commandEditor) &&
              !isDocumentView(commandEditor)
            ) {
              const matched = new Set<string>();
              for (const key of nodeKeysAt(commandEditor, location)) {
                for (const id of storedIndex.byKey.get(key) ?? []) {
                  const entry = storedIndex.entries.get(id);
                  if (
                    entry &&
                    entry.root === root &&
                    !threads.get(id)?.resolution &&
                    entry.range &&
                    RangeApi.includes(entry.range, location)
                  ) {
                    matched.add(id);
                  }
                }
              }
              return Object.freeze(
                [...matched].sort(
                  (left, right) =>
                    (sourceOrder.get(left) ?? 0) - (sourceOrder.get(right) ?? 0)
                )
              );
            }
            return Object.freeze(
              (sourcesByRoot.get(root) ?? []).flatMap(({ id }) => {
                const anchor = anchors.get(id);
                if (!anchor || threads.get(id)?.resolution) return [];
                const range = rangeIn(commandEditor, anchor);
                return range &&
                  RangeApi.includes(range, location) &&
                  textIn(commandEditor, range)
                  ? [id]
                  : [];
              })
            );
          }
          return Object.freeze(
            [
              ...new Map(
                nodeKeysAt(commandEditor, location).flatMap((key) =>
                  annotations
                    .getAnnotationsAt(key)
                    .map((annotation) => [annotation.id, annotation] as const)
                )
              ).values(),
            ]
              .filter(
                ({ id, range }) =>
                  !threads.get(id)?.resolution &&
                  range &&
                  RangeApi.includes(range, location)
              )
              .sort(
                (left, right) =>
                  (sourceOrder.get(left.id) ?? 0) -
                  (sourceOrder.get(right.id) ?? 0)
              )
              .map(({ id }) => id)
          );
        },
        /** Resolve a live attachment without copying it into the conversation. */
        attachment: (id: string): CommentAttachment | null => {
          const thread = threads.get(id);
          if (!thread) return null;
          if (thread.target.type === 'change') return thread.target;
          const anchor = anchors.get(id);
          const range = anchor && resolveIn(commandEditor, anchor);
          return range
            ? freezeComment({
                type: 'range',
                status: 'attached',
                range: structuredClone(range),
              })
            : Object.freeze({ type: 'range', status: 'unavailable' });
        },
        setActive,
        /** Observe mapped attachments without rewriting semantic thread records. */
        subscribeAttachments: (
          listener: (change: AnnotationChange) => void
        ) => {
          if (destroyed) return () => {};
          ensureThreadIndex();
          let state = attachmentViews.get(commandEditor);
          if (!state) {
            const documentView = isDocumentView(commandEditor);
            const preview = readShownPreview(commandEditor);
            const projected =
              preview || documentView ? new Map<string, ThreadEntry>() : null;
            if (projected) populateProjectedIndex(commandEditor, projected);
            const created: AttachmentViewState = {
              listeners: new Set(),
              preview,
              projected,
              rootTops:
                projected && commandEditor.read.view.root() === undefined
                  ? readNamedRootTops(commandEditor)
                  : null,
              stopViewState: documentView
                ? () => {}
                : subscribeEditorViewState(commandEditor, (change) => {
                    if (destroyed || change !== 'authored') return;
                    syncViewProjection(commandEditor, created);
                  }),
            };
            state = created;
            attachmentViews.set(commandEditor, state);
          }
          state.listeners.add(listener);
          let subscribed = true;
          return () => {
            if (!subscribed) return;
            subscribed = false;
            state.listeners.delete(listener);
            if (
              !state.listeners.size &&
              attachmentViews.get(commandEditor) === state
            ) {
              state.stopViewState();
              state.projected?.clear();
              attachmentViews.delete(commandEditor);
              teardownThreadIndex();
            }
          };
        },
      };
    },
    decorate: {
      observe: ({ editor: view, refresh }) => {
        if (destroyed) return () => {};
        const index = observeView(view);
        index.refreshers.add(refresh);
        return () => {
          index.refreshers.delete(refresh);
          releaseView(view);
        };
      },
      read: ({ editor: view, entry: [node, path] }) => {
        if (destroyed || !TextApi.isText(node)) return [];
        const key = view.key(path);
        if (!key) return [];
        const annotations = getAnnotations(view).getAnnotationsAt(key);
        const textRange = annotations.length
          ? view.read.ranges.get(path)
          : undefined;
        if (!textRange) return [];
        const activeIds = store.get('activeIds');
        return annotations.flatMap(({ id, range }) => {
          if (threads.get(id)?.resolution) return [];
          const intersection = range
            ? RangeApi.intersection(range, textRange)
            : null;
          return !intersection || RangeApi.isCollapsed(intersection)
            ? []
            : [
                {
                  attributes: {
                    'data-comment-active': activeIds.includes(id)
                      ? ''
                      : undefined,
                    'data-comment-id': id,
                    className: 'editor-comments',
                  },
                  key: `${id}:${key}`,
                  range: intersection,
                },
              ];
        });
      },
    },
  };
});
