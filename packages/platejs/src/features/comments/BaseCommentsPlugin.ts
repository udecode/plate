import {
  definePlugin,
  nanoid,
  NodeApi,
  RangeApi,
  TextApi,
  type Anchor,
  type Editor,
  type EditorDocumentRange,
  type Location,
  type NodeKey,
  type Range,
  type Value,
} from '../../core';
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

export type PendingComment = Readonly<{ excerpt: string }>;

/** Save together with the exact document revision; ordinary reload starts fresh undo. */
export type CommentsJSON = Readonly<{
  kind: 'plate-comments';
  ranges: ReadonlyArray<
    Readonly<{
      range: EditorDocumentRange | null;
      threadId: string;
    }>
  >;
  threads: readonly CommentThread[];
  version: 1;
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
  attachment?: EditorDocumentRange;
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
  currentUserId: string | null;
  /** Loaded once, before mount, against the matching initial document. */
  initialComments: CommentsJSON | null;
  /** Authorize and persist before publication. Throws preserve the previous state. */
  mutate: (
    request: CommentMutationRequest
  ) => CommentMutationDecision | Promise<CommentMutationDecision>;
  users: Readonly<Record<string, CommentUser>>;
};

const initialState: CommentsPluginState = {
  activeIds: [],
  currentUserId: null,
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

/** Decode semantic data here; the editor's range codec owns opaque targets. */
const decodeComments = (value: unknown): CommentsJSON => {
  const input = snapshotCommentData(value);
  if (
    !record(input) ||
    input.kind !== 'plate-comments' ||
    input.version !== 1 ||
    !Array.isArray(input.threads) ||
    !Array.isArray(input.ranges)
  ) {
    throw new Error('Invalid Comments JSON');
  }
  const threads = input.threads.map(validateThread);
  const byId = new Map<string, CommentThread>();
  for (const thread of threads) {
    if (byId.has(thread.id)) {
      throw new Error(`Duplicate comment thread ID: ${thread.id}`);
    }
    if (thread.status !== 'published') {
      throw new Error('Saved comments must be published');
    }
    byId.set(thread.id, thread);
  }
  const seen = new Set<string>();
  for (const target of input.ranges) {
    if (
      !record(target) ||
      !isCommentId(target.threadId) ||
      seen.has(target.threadId) ||
      byId.get(target.threadId)?.target.type !== 'range' ||
      (target.range !== null &&
        (!record(target.range) ||
          target.range.kind !== 'range' ||
          target.range.version !== 1))
    ) {
      throw new Error('Invalid comment range target');
    }
    seen.add(target.threadId);
  }
  return Object.freeze({
    kind: 'plate-comments',
    version: 1,
    threads: Object.freeze(threads),
    ranges: input.ranges,
  }) as CommentsJSON;
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
 * Load initialComments and save api.toJSON() with the exact document revision.
 * Conversations are independent from document undo; native anchors own mapping.
 */
export const BaseCommentsPlugin = definePlugin('comments', {
  initialState,
}).extend(({ editor, store }) => {
  let threads = new Map<string, CommentThread>();
  const anchors = new Map<string, Anchor<Range>>();
  let source: ReadonlyArray<{ id: string; anchor: AnnotationAnchor }> = [];
  let sourceOrder = new Map<string, number>();
  let pendingAnchor: Anchor<Range> | null = null;
  let snapshot: CommentsSnapshot = Object.freeze({
    draftThreadIds: Object.freeze([]),
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
  const threadListeners = new Map<string, Set<() => void>>();
  const visibleListeners = new Set<() => void>();
  const draftListeners = new Set<() => void>();
  const pendingListeners = new Set<() => void>();
  const dataListeners = new Set<(change: CommentsChange) => void>();
  let unsubscribeActive: (() => void) | null = null;

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
        if (change.reason !== 'editor' && change.nodeKeys.length) {
          refreshers.forEach((refresh) =>
            refresh({ nodeKeys: change.nodeKeys })
          );
        }
        listeners.forEach((listener) => listener(change));
      });
      index = { annotations, listeners, refreshers, unsubscribe };
      viewIndexes.set(view, index);
    }
    return index;
  };
  const releaseView = (view: Editor) => {
    const index = viewIndexes.get(view);
    if (!index || index.listeners.size || index.refreshers.size) return;
    viewIndexes.delete(view);
    index.unsubscribe();
    passiveIndexes.set(view, index.annotations);
  };

  const notifyThreads = (ids: readonly string[]) => {
    ids.forEach((id) =>
      threadListeners.get(id)?.forEach((listener) => listener())
    );
    if (ids.length) {
      const change = Object.freeze({ ids: Object.freeze([...ids]) });
      dataListeners.forEach((listener) => listener(change));
    }
  };
  const publish = (
    next: CommentsSnapshot,
    changes: {
      draft?: boolean;
      pending?: boolean;
      threads?: readonly string[];
      visible?: boolean;
    } = {}
  ) => {
    snapshot = Object.freeze(next);
    if (changes.draft) draftListeners.forEach((listener) => listener());
    if (changes.pending) pendingListeners.forEach((listener) => listener());
    if (changes.visible) visibleListeners.forEach((listener) => listener());
    if (changes.threads) notifyThreads(changes.threads);
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
    for (const [view, { annotations, refreshers }] of viewIndexes) {
      const nodeKeys = new Set<NodeKey>();
      ids.forEach((id) => {
        const range = annotations.getAnnotation(id)?.range;
        if (range) nodeKeysAt(view, range).forEach((key) => nodeKeys.add(key));
      });
      if (nodeKeys.size) {
        refreshers.forEach((refresh) => refresh({ nodeKeys: [...nodeKeys] }));
      }
    }
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
  let initialComments = seed === null ? null : decodeComments(seed);
  threads = new Map(
    initialComments?.threads.map((thread) => [thread.id, thread])
  );
  snapshot = Object.freeze({
    ...snapshot,
    threadIds: Object.freeze([...threads.keys()]),
    draftThreadIds: Object.freeze(
      [...threads.values()]
        .filter((thread) => thread.status === 'draft')
        .map((thread) => thread.id)
    ),
    visibleThreadIds: Object.freeze(
      [...threads.values()]
        .filter((thread) => !thread.resolution)
        .map((thread) => thread.id)
    ),
  });
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
  const initialize = () => {
    for (const target of initialComments?.ranges ?? []) {
      if (!target.range) continue;
      const anchor = editor.anchor.restore(target.range);
      try {
        if (anchor.root !== undefined) {
          throw new Error('Comment ranges must address the primary document');
        }
        const range = anchor.resolve();
        if (range) validateRange(range);
        anchors.set(target.threadId, anchor);
      } catch (error) {
        anchor.release();
        throw error;
      }
    }
    initialComments = null;
    syncSource();
    viewIndexes.forEach(({ annotations }) => annotations.refresh());
    let active = store.get('activeIds');
    unsubscribeActive = store.subscribe(() => {
      const next = store.get('activeIds');
      if (next === active) return;
      const previous = active;
      active = next;
      refreshIds([...previous, ...next]);
    });
  };
  const setThread = (
    id: string,
    thread: CommentThread | null,
    anchor?: Anchor<Range>
  ) => {
    const previous = threads.get(id);
    const previousAnchor = anchors.get(id);
    if (thread) {
      threads.set(id, thread);
      if (anchor) anchors.set(id, anchor);
    } else {
      threads.delete(id);
      anchors.delete(id);
      if (queues.has(id)) generations.set(id, (generations.get(id) ?? 0) + 1);
      else generations.delete(id);
    }
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
    const next =
      threadIds === snapshot.threadIds &&
      visibleThreadIds === snapshot.visibleThreadIds &&
      draftThreadIds === snapshot.draftThreadIds
        ? snapshot
        : { ...snapshot, threadIds, visibleThreadIds, draftThreadIds };
    snapshot = Object.freeze(next);
    if (previousAnchor !== anchors.get(id)) {
      syncSource();
      viewIndexes.forEach(({ annotations }) =>
        annotations.refresh({ ids: [id], reason: 'external' })
      );
      previousAnchor?.release();
    } else if (visibilityChanged) refreshIds([id]);
    if ((!thread || thread.resolution) && store.get('activeIds').includes(id)) {
      setActive(store.get('activeIds').filter((key) => key !== id));
    }
    publish(next, {
      threads: [id],
      visible: visibilityChanged,
      draft: draftChanged,
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
    isCurrent: () => boolean = () => true
  ): Promise<CommentMutationResult> => {
    const previous = threads.get(id) ?? null;
    const generation = generations.get(id) ?? 0;
    if (destroyed || !isCurrent()) return { status: 'stale' };
    const location = anchor ?? anchors.get(id);
    const decision = await store.get('mutate')(
      Object.freeze({
        mutationId: nanoid(),
        operation,
        previous,
        proposed,
        ...((operation === 'create' ||
          operation === 'createThread' ||
          operation === 'publishDraft') &&
        location
          ? { attachment: editor.anchor.save(location) }
          : {}),
      })
    );
    if (
      destroyed ||
      !isCurrent() ||
      generation !== (generations.get(id) ?? 0) ||
      (threads.get(id) ?? null) !== previous
    ) {
      return { status: 'stale' };
    }
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
    setThread(id, canonical, anchor);
    return { status: 'applied', value: undefined };
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
    if (!snapshot.pending) return;
    pendingAnchor?.release();
    pendingAnchor = null;
    publish({ ...snapshot, pending: null }, { pending: true });
  };
  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
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
    pendingAnchor?.release();
    pendingAnchor = null;
    anchors.forEach((anchor) => anchor.release());
    anchors.clear();
    threads.clear();
    initialComments = null;
    queues.clear();
    generations.clear();
    source = [];
    sourceOrder.clear();
    snapshot = Object.freeze({
      draftThreadIds: Object.freeze([]),
      pending: null,
      threadIds: Object.freeze([]),
      visibleThreadIds: Object.freeze([]),
    });
    threadListeners.clear();
    visibleListeners.clear();
    draftListeners.clear();
    pendingListeners.clear();
    dataListeners.clear();
  };

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
        const userId = store.get('currentUserId');
        const body = normalizeBody(input.body);
        if (!id || !body || !userId || threads.has(id) || destroyed) {
          return null;
        }
        if (input.target.type === 'range') {
          validateRange(input.target.range, commandEditor.read.children());
          if (RangeApi.isCollapsed(input.target.range)) return null;
        } else if (!input.target.id) return null;
        const createdAt = new Date().toISOString();
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
      const createThread = async (
        input: CreateCommentThreadInput,
        pending?: Anchor<Range>
      ): Promise<CommentMutationResult<string>> => {
        const prepared = prepareCreation(input, 'published', pending);
        if (!prepared) return { status: 'invalid' };
        const { thread, anchor } = prepared;
        let transferred = false;
        try {
          return await enqueue(thread.id, async () => {
            if (threads.has(thread.id)) return { status: 'invalid' };
            const result = await commitMutation(
              thread.id,
              pending ? 'create' : 'createThread',
              thread,
              anchor,
              () => !pending || pending === pendingAnchor
            );
            if (result.status !== 'applied') return result;
            transferred = true;
            if (pending && pending === pendingAnchor) {
              pendingAnchor = null;
              publish({ ...snapshot, pending: null }, { pending: true });
            }
            return { status: 'applied', value: thread.id };
          });
        } finally {
          if (!transferred && !pending) anchor?.release();
        }
      };
      return {
        /** Start a comment at a range, or expand a caret to its text block. */
        begin: (at: Range | null = commandEditor.read.selection()) => {
          let range = at;
          if (!range || destroyed) return false;
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
          pendingAnchor?.release();
          pendingAnchor = anchor;
          setActive([]);
          publish(
            {
              ...snapshot,
              pending: Object.freeze({
                excerpt: commandEditor.read.text.string(range),
              }),
            },
            { pending: true }
          );
          return true;
        },
        /** Dismiss the pending composer and release its private range. */
        cancel,
        /** Publish from the pending selection; failure preserves the composer. */
        create: async (body: Value): Promise<CommentMutationResult<string>> => {
          const range = pendingAnchor?.resolve(commandEditor);
          return pendingAnchor && snapshot.pending && range
            ? createThread(
                {
                  body,
                  excerpt: snapshot.pending.excerpt,
                  target: { type: 'range', range },
                },
                pendingAnchor
              )
            : { status: 'invalid' };
        },
        /** Persist and publish at an explicit primary range or authored change ID. */
        createThread,
        /** Allocate a local draft; only publishDraft invokes durable storage. */
        createDraft: (input: CreateCommentThreadInput) => {
          const prepared = prepareCreation(input, 'draft');
          if (!prepared || queues.has(prepared.thread.id)) {
            prepared?.anchor?.release();
            return null;
          }
          setThread(prepared.thread.id, prepared.thread, prepared.anchor);
          return prepared.thread.id;
        },
        /** Retire an unpublished draft, including its private range. */
        discardDraft: (id: string) => {
          if (threads.get(id)?.status !== 'draft' || destroyed) return false;
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
        /** Read live semantic records. Use toJSON for persistence. */
        getThreads: (): readonly CommentThread[] =>
          Object.freeze([...threads.values()]),
        /** Export published conversations and opaque targets for this exact document. */
        toJSON: (): CommentsJSON => {
          const records = [...threads.values()].filter(
            (thread) => thread.status === 'published'
          );
          return Object.freeze({
            kind: 'plate-comments',
            version: 1,
            threads: Object.freeze(records),
            ranges: Object.freeze(
              records.flatMap((thread) => {
                if (thread.target.type !== 'range') return [];
                const anchor = anchors.get(thread.id);
                return [
                  Object.freeze({
                    threadId: thread.id,
                    range: anchor ? editor.anchor.save(anchor) : null,
                  }),
                ];
              })
            ),
          });
        },
        /** Resolve the pending selection without exposing its native handle. */
        pendingRange: () =>
          freezeComment(
            structuredClone(pendingAnchor?.resolve(commandEditor) ?? null)
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
          const userId = store.get('currentUserId');
          return mutateThread(id, 'reply', (current) =>
            !value || current.resolution || !userId
              ? undefined
              : {
                  ...current,
                  messages: Object.freeze([
                    ...current.messages,
                    Object.freeze({
                      body: value,
                      createdAt: new Date().toISOString(),
                      id: nanoid(),
                      userId,
                    }),
                  ]),
                }
          );
        },
        /** Close a discussion outside document history. Reopen is its inverse. */
        resolve: (id: string) => {
          const userId = store.get('currentUserId');
          return mutateThread(id, 'resolve', (thread) =>
            thread.resolution || !userId
              ? undefined
              : {
                  ...thread,
                  resolution: { resolvedAt: new Date().toISOString(), userId },
                }
          );
        },
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
