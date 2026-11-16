import isEqual from 'lodash/isEqual.js';

import {
  defineEffect,
  definePlugin,
  getEditorRuntimeOwner,
  nanoid,
  NodeApi,
  RangeApi,
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
import { notifyObservers, runEditorObserver } from '../../facade';
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

export type CommentMessage = Readonly<{
  body: Value;
  createdAt: string;
  id: string;
  userId: string;
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
}>;

type CommentCreationHistoryTransition = Readonly<{
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
 * Primary-document ranges keyed by thread ID. Save them with the exact document
 * revision they address; the record has a null prototype.
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
  excerpt?: string;
  id?: string;
  target:
    | Readonly<{ range: Range; type: 'range' }>
    | Readonly<{ id: string; type: 'change' }>;
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
  | 'publishDraft';

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

const prepareCommentThread = (input: unknown): CommentThread =>
  validateThread(snapshotCommentData(input));

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
  let source: ReadonlyArray<{ id: string; anchor: AnnotationAnchor }> = [];
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
  const viewIndexes = new Map<
    Editor,
    {
      annotations: ReturnType<typeof createAnnotationStore>;
      listeners: Set<(change: AnnotationChange) => void>;
      refreshers: Set<(input: { nodeKeys: readonly NodeKey[] }) => void>;
      unsubscribe: () => void;
    }
  >();
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

  const getAnnotations = (view: Editor) => {
    const observed = viewIndexes.get(view);
    if (observed) return observed.annotations;
    let annotations = passiveIndexes.get(view);
    if (!annotations) {
      annotations = createAnnotationStore(view, () => source, {
        id: 'comments',
      });
      passiveIndexes.set(view, annotations);
    }
    return annotations;
  };
  const observeView = (view: Editor) => {
    let index = viewIndexes.get(view);
    if (!index) {
      const annotations = getAnnotations(view);
      passiveIndexes.delete(view);
      const listeners = new Set<(change: AnnotationChange) => void>();
      const refreshers = new Set<
        (input: { nodeKeys: readonly NodeKey[] }) => void
      >();
      const unsubscribe = annotations.subscribeChanges((change) => {
        const announce = () => {
          if (change.reason !== 'editor' && change.nodeKeys.length) {
            deliver(refreshers, 'commit-listener', {
              nodeKeys: change.nodeKeys,
            });
          }
          deliver(listeners, 'commit-listener', change);
        };
        if (heldChanges) heldChanges.push(announce);
        else announce();
      });
      index = { annotations, listeners, refreshers, unsubscribe };
      viewIndexes.set(view, index);
    }
    return index;
  };
  // No listener runs until every view has refreshed, so a listener reading
  // another view finds the new locations.
  const refreshViews = (ids?: readonly string[]) => {
    const changes: Array<() => void> = [];
    heldChanges = changes;
    viewIndexes.forEach(({ annotations }) =>
      annotations.refresh(ids && { ids, reason: 'external' })
    );
    heldChanges = null;
    return () => changes.forEach((announce) => announce());
  };
  const releaseView = (view: Editor) => {
    const index = viewIndexes.get(view);
    if (!index || index.listeners.size || index.refreshers.size) return;
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
    for (const [, path] of view.read.nodes.entries({
      at: location,
      match: TextApi.isText,
    })) {
      const key = view.key(path);
      if (key) keys.add(key);
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
  const syncSource = () => {
    source = Object.freeze(
      [...anchors].map(([id, anchor]) => ({ id, anchor }))
    );
    sourceOrder = new Map(source.map(({ id }, index) => [id, index]));
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
  const isInNamedRoot = (range: Range) =>
    range.anchor.root !== undefined || range.focus.root !== undefined;
  const validateRange = (range: Range, children = editor.read.children()) => {
    for (const point of [range.anchor, range.focus]) {
      if (point.root !== undefined) {
        throw new Error('Comment ranges must address the primary document');
      }
      const node = NodeApi.getIf({ type: '', children }, point.path);
      if (
        !TextApi.isText(node) ||
        !Number.isInteger(point.offset) ||
        point.offset < 0 ||
        point.offset > node.text.length
      ) {
        throw new Error('Invalid comment range');
      }
    }
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
        const value = snapshotCommentData(ownValue(ranges, id));
        if (!RangeApi.isRange(value)) throw new Error('Invalid comment range');
        range = value;
        validateRange(range);
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
    }: {
      afterWrite?: (canonical: CommentThread | null) => void;
      isCurrent?: () => boolean;
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
        if (location.resolve()) {
          rangesAwaitingMutate.set(id, location);
          announceRanges();
          if (isStale()) {
            dropUnwritten();
            return { status: 'stale' };
          }
          range = location.resolve();
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
          restoredAnchor = editor.anchor.restore(transition.attachment);
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
    viewIndexes.forEach(
      ({ annotations, listeners, refreshers, unsubscribe }) => {
        unsubscribe();
        annotations.destroy();
        listeners.clear();
        refreshers.clear();
      }
    );
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
    orphans.clear();
    submitHolds.clear();
    rangesAwaitingMutate.clear();
    unsettledDrafts.clear();
    threads.clear();
    initialComments = null;
    queues.clear();
    generations.clear();
    source = [];
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
        if (!id || !body || threads.has(id) || destroyed) {
          return null;
        }
        if (input.target.type === 'range') {
          if (isInNamedRoot(input.target.range)) return null;
          validateRange(input.target.range, commandEditor.read.children());
          if (RangeApi.isCollapsed(input.target.range)) return null;
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
        });
        const anchor =
          input.target.type === 'range'
            ? (pending ??
              commandEditor.anchor(input.target.range, {
                association: 'inward',
                deletion: 'nearest',
              }))
            : undefined;
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
                    tx.effects.emit(commentCreationHistoryEffect, {
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
         * Start a comment at a range, or expand a caret to its text block.
         * Returns false for a range in a named root, such as a board note.
         */
        begin: (at: Range | null = commandEditor.read.selection()) => {
          let range = at;
          if (!range || destroyed || isInNamedRoot(range)) return false;
          if (RangeApi.isCollapsed(range)) {
            const block = commandEditor.read.nodes.block({ at: range });
            range = block
              ? (commandEditor.read.ranges.get(block[1]) ?? null)
              : null;
          }
          if (!range || RangeApi.isCollapsed(range)) return false;
          validateRange(range, commandEditor.read.children());
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
          const range = claimed?.anchor.resolve(commandEditor);
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
         * Persist and publish at an explicit primary range or authored change
         * ID. A range in a named root resolves `invalid`.
         */
        createThread: (input: CreateCommentThreadInput) => submit(input),
        /**
         * Allocate a local draft; only publishDraft invokes durable storage.
         * Returns null for a range in a named root, or for an ID that holds an
         * orphan or has an action in flight.
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
            structuredClone(composer?.anchor.resolve(commandEditor) ?? null)
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
        /** Add the current user's reply to an unresolved thread. */
        reply: (id: string, body: Value): Promise<CommentMutationResult> => {
          const value = normalizeBody(body);
          return mutateThread(id, 'reply', (current) =>
            !value || current.resolution
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
                    }),
                  ]),
                }
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
          const annotations = viewIndexes.get(commandEditor)?.annotations;
          if (!annotations) {
            return Object.freeze(
              [...anchors].flatMap(([id, anchor]) => {
                if (threads.get(id)?.resolution) return [];
                const range = anchor.resolve(commandEditor);
                return range && RangeApi.includes(range, location) ? [id] : [];
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
          const range = anchors.get(id)?.resolve(commandEditor);
          return range && !RangeApi.isCollapsed(range)
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
          const index = observeView(commandEditor);
          index.listeners.add(listener);
          return () => {
            index.listeners.delete(listener);
            releaseView(commandEditor);
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
        const textRange = {
          anchor: { offset: 0, path },
          focus: { offset: node.text.length, path },
        };
        const activeIds = store.get('activeIds');
        return getAnnotations(view)
          .getAnnotationsAt(key)
          .flatMap(({ id, range }) => {
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
