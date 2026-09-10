import {
  defineBasePlugin,
  nanoid,
  NodeApi,
  RangeApi,
  TextApi,
  type Location,
  type NodeKey,
  type Range,
  type Value,
} from '../../core';
import { isImmutablePluginData } from '../../internal/utils/mergePlugins';
import {
  createPliteAnnotationStore,
  type PliteAnnotationAnchor,
  type PliteAnnotationChange,
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

/** Ranges address the saved primary document; null is detached. */
export type CommentTarget =
  | Readonly<{ range: Range | null; type: 'range' }>
  | Readonly<{ id: string; type: 'suggestion' }>;

/** JSON-compatible thread data. Timestamps use ISO 8601 strings. */
export type CommentThread = Readonly<{
  createdAt: string;
  excerpt: string;
  id: string;
  messages: readonly CommentMessage[];
  resolved: boolean;
  status: 'draft' | 'published';
  target: CommentTarget;
  userId: string;
}>;

export type PendingComment = Readonly<{ excerpt: string }>;

export type CommentsSnapshot = Readonly<{
  draftThreadIds: readonly string[];
  pending: PendingComment | null;
  threadIds: readonly string[];
  visibleThreadIds: readonly string[];
}>;

/** Published record changes, including ranges mapped by document edits. */
export type CommentsChange = Readonly<{
  ids: readonly string[];
  reason: 'data' | 'document';
}>;

export type CommentsPluginState = {
  activeIds: readonly string[];
  currentUserId: string | null;
  /** Loaded once per editor. Replace live records through api.setThreads. */
  initialThreads: readonly CommentThread[];
  users: Readonly<Record<string, CommentUser>>;
};

const initialState: CommentsPluginState = {
  activeIds: [],
  currentUserId: null,
  initialThreads: [],
  users: {},
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
 * Load fetched records in initialThreads; save api.getThreads() with the same
 * document value. Independent editors bind their own ranges from those records.
 */
export const BaseCommentsPlugin = defineBasePlugin('comments', {
  initialState,
}).extend(({ editor, store }) => {
  let threads = new Map<string, CommentThread>();
  let anchors = new Map<string, PliteAnnotationAnchor>();
  let source: ReadonlyArray<{ id: string; anchor: PliteAnnotationAnchor }> = [];
  let sourceOrder = new Map<string, number>();
  let pendingAnchor: PliteAnnotationAnchor | null = null;
  let snapshot: CommentsSnapshot = Object.freeze({
    draftThreadIds: Object.freeze([]),
    pending: null,
    threadIds: Object.freeze([]),
    visibleThreadIds: Object.freeze([]),
  });
  let annotations: ReturnType<typeof createPliteAnnotationStore> | null = null;
  let initialized = false;
  let published = false;
  let initializationError: unknown;
  let destroyed = false;
  const threadListeners = new Map<string, Set<() => void>>();
  const visibleListeners = new Set<() => void>();
  const draftListeners = new Set<() => void>();
  const pendingListeners = new Set<() => void>();
  const dataListeners = new Set<(change: CommentsChange) => void>();
  const rangeListeners = new Set<(change: PliteAnnotationChange) => void>();
  const refreshers = new Set<
    (input: { nodeKeys: readonly NodeKey[] }) => void
  >();
  let unsubscribeActive: (() => void) | null = null;

  const notifyThreads = (
    ids: readonly string[],
    reason: CommentsChange['reason']
  ) => {
    ids.forEach((id) =>
      threadListeners.get(id)?.forEach((listener) => listener())
    );
    if (ids.length) {
      const change = Object.freeze({ ids: Object.freeze([...ids]), reason });
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
    if (changes.threads) notifyThreads(changes.threads, 'data');
  };
  const nodeKeysAt = (location: Location) => {
    const keys = new Set<NodeKey>();
    for (const [, path] of editor.read.nodes.entries({
      at: location,
      match: TextApi.isText,
    })) {
      const key = editor.key(path);
      if (key) keys.add(key);
    }
    return [...keys];
  };
  const refreshIds = (ids: readonly string[]) => {
    const nodeKeys = new Set<NodeKey>();
    ids.forEach((id) => {
      const range = annotations?.getAnnotation(id)?.range;
      if (range) nodeKeysAt(range).forEach((key) => nodeKeys.add(key));
    });
    if (nodeKeys.size) {
      refreshers.forEach((refresh) => refresh({ nodeKeys: [...nodeKeys] }));
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
  };
  const retainIds = (previous: readonly string[], next: string[]) =>
    previous.length === next.length &&
    previous.every((id, index) => id === next[index])
      ? previous
      : Object.freeze(next);
  const normalizeBody = (body: Value) => {
    const next = structuredClone(body);
    return next
      .map((node) => NodeApi.string(node))
      .join('\n')
      .trim()
      ? freezeComment(next)
      : null;
  };
  const prepareThreads = (records: readonly CommentThread[]) => {
    const nextThreads = new Map<string, CommentThread>();
    const immutableRecords = isImmutablePluginData(records);
    for (const record of records) {
      if (nextThreads.has(record.id)) {
        throw new Error(`Duplicate comment thread ID: ${record.id}`);
      }
      const copy =
        immutableRecords || isImmutablePluginData(record)
          ? record
          : structuredClone(record);
      if (
        !Number.isFinite(Date.parse(copy.createdAt)) ||
        copy.messages.some(
          (message) =>
            !Number.isFinite(Date.parse(message.createdAt)) ||
            (message.editedAt !== undefined &&
              !Number.isFinite(Date.parse(message.editedAt)))
        )
      ) {
        throw new Error(`Invalid comment timestamp: ${record.id}`);
      }
      nextThreads.set(record.id, freezeComment(copy));
    }
    return nextThreads;
  };
  let initialThreads: Map<string, CommentThread> | null = prepareThreads(
    store.get('initialThreads')
  );
  threads = initialThreads;
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
        .filter((thread) => !thread.resolved)
        .map((thread) => thread.id)
    ),
  });
  const validateRange = (range: Range, value = editor.read.value()) => {
    for (const point of [range.anchor, range.focus]) {
      if (point.root !== undefined) {
        throw new Error('Comment ranges must address the primary document');
      }
      const node = NodeApi.getIf(
        { type: '', children: value.children },
        point.path
      );
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
  const replaceThreads = (nextThreads: Map<string, CommentThread>) => {
    if (destroyed) return;
    const records = [...nextThreads.values()];
    const value = editor.read.value();
    const nextAnchors = new Map<string, PliteAnnotationAnchor>();
    const allocated: PliteAnnotationAnchor[] = [];
    try {
      for (const thread of nextThreads.values()) {
        if (thread.target.type !== 'range' || !thread.target.range) continue;
        validateRange(thread.target.range, value);
        const previous = anchors.get(thread.id);
        const anchor =
          previous && RangeApi.equals(previous.resolve(), thread.target.range)
            ? previous
            : editor.anchor(thread.target.range, {
                association: 'inward',
                deletion: 'nearest',
              });
        if (anchor !== previous) allocated.push(anchor);
        nextAnchors.set(thread.id, anchor);
      }
    } catch (error) {
      allocated.forEach((anchor) => anchor.release());
      throw error;
    }
    const sameRecords = threads === nextThreads;
    const threadIds = sameRecords
      ? snapshot.threadIds
      : retainIds(snapshot.threadIds, [...nextThreads.keys()]);
    const draftThreadIds = sameRecords
      ? snapshot.draftThreadIds
      : retainIds(
          snapshot.draftThreadIds,
          records
            .filter((thread) => thread.status === 'draft')
            .map((thread) => thread.id)
        );
    const visibleThreadIds = sameRecords
      ? snapshot.visibleThreadIds
      : retainIds(
          snapshot.visibleThreadIds,
          records
            .filter((thread) => !thread.resolved)
            .map((thread) => thread.id)
        );
    const ids = sameRecords
      ? [...nextThreads.keys()]
      : [...new Set([...threads.keys(), ...nextThreads.keys()])];
    const changedAnchors = [
      ...new Set([...anchors.keys(), ...nextAnchors.keys()]),
    ].filter((id) => anchors.get(id) !== nextAnchors.get(id));
    const orderedAnchorIds = [...nextAnchors.keys()];
    const orderChanged =
      source.length !== orderedAnchorIds.length ||
      source.some(({ id }, index) => id !== orderedAnchorIds[index]);
    const visibilityChanged = sameRecords
      ? []
      : ids.filter(
          (id) => threads.get(id)?.resolved !== nextThreads.get(id)?.resolved
        );
    const retired = [...anchors].flatMap(([id, anchor]) =>
      nextAnchors.get(id) === anchor ? [] : [anchor]
    );
    threads = nextThreads;
    anchors = nextAnchors;
    const next =
      threadIds === snapshot.threadIds &&
      draftThreadIds === snapshot.draftThreadIds &&
      visibleThreadIds === snapshot.visibleThreadIds
        ? snapshot
        : { ...snapshot, threadIds, draftThreadIds, visibleThreadIds };
    const changes = {
      draft: draftThreadIds !== snapshot.draftThreadIds,
      visible: visibleThreadIds !== snapshot.visibleThreadIds,
      threads: ids,
    };
    snapshot = Object.freeze(next);
    try {
      if (changedAnchors.length || orderChanged) {
        syncSource();
        annotations?.refresh({
          ...(orderChanged ? {} : { ids: changedAnchors }),
          reason: 'external',
        });
      }
      refreshIds(visibilityChanged);
      const active = store.get('activeIds');
      const retained = active.filter(
        (id) => threads.has(id) && !threads.get(id)?.resolved
      );
      if (retained.length !== active.length) setActive(retained);
      publish(next, changes);
    } finally {
      retired.forEach((anchor) => anchor.release());
    }
  };
  const initialize = () => {
    // oxlint-disable-next-line typescript/only-throw-error -- Preserve the original initialization failure for every reader of this store.
    if (initializationError) throw initializationError;
    if (!published || initialized || destroyed) return;
    initialized = true;
    try {
      if (initialThreads) replaceThreads(initialThreads);
      initialThreads = null;
      annotations = createPliteAnnotationStore(editor, () => source, {
        id: 'comments',
      });
      annotations.subscribeChanges((change) => {
        const changedThreads: string[] = [];
        if (change.reason === 'editor') {
          change.ids.forEach((id) => {
            const thread = threads.get(id);
            const range = annotations?.getAnnotation(id)?.range ?? null;
            if (
              thread?.target.type === 'range' &&
              !RangeApi.equals(thread.target.range, range)
            ) {
              threads.set(
                id,
                Object.freeze({
                  ...thread,
                  target: freezeComment({
                    type: 'range' as const,
                    range: range && structuredClone(range),
                  }),
                })
              );
              changedThreads.push(id);
            }
          });
        }
        if (change.reason !== 'editor' && change.nodeKeys.length) {
          refreshers.forEach((refresh) =>
            refresh({ nodeKeys: change.nodeKeys })
          );
        }
        rangeListeners.forEach((listener) => listener(change));
        if (change.reason === 'editor') {
          notifyThreads(changedThreads, 'document');
        }
      });
      let active = store.get('activeIds');
      unsubscribeActive = store.subscribe(() => {
        const next = store.get('activeIds');
        if (next === active) return;
        const previous = active;
        active = next;
        refreshIds([...previous, ...next]);
      });
    } catch (error) {
      initializationError = error;
      annotations?.destroy();
      unsubscribeActive?.();
      throw error;
    }
  };
  const updateThread = (
    id: string,
    update: (thread: CommentThread) => CommentThread
  ) => {
    const previous = threads.get(id);
    if (!previous || destroyed) return false;
    const thread = Object.freeze(update(previous));
    threads.set(id, thread);
    const changedVisibility = previous.resolved !== thread.resolved;
    if (changedVisibility) {
      refreshIds([id]);
      if (thread.resolved && store.get('activeIds').includes(id)) {
        setActive(store.get('activeIds').filter((activeId) => activeId !== id));
      }
    }
    publish(
      changedVisibility
        ? {
            ...snapshot,
            visibleThreadIds: Object.freeze(
              snapshot.threadIds.filter(
                (threadId) => !threads.get(threadId)?.resolved
              )
            ),
          }
        : snapshot,
      { threads: [id], visible: changedVisibility }
    );
    return true;
  };
  const removeThread = (id: string) => {
    const thread = threads.get(id);
    if (!thread || destroyed) return false;
    const anchor = anchors.get(id);
    threads.delete(id);
    anchors.delete(id);
    const next = Object.freeze({
      ...snapshot,
      threadIds: Object.freeze(
        snapshot.threadIds.filter((threadId) => threadId !== id)
      ),
      visibleThreadIds: Object.freeze(
        snapshot.visibleThreadIds.filter((threadId) => threadId !== id)
      ),
      draftThreadIds: Object.freeze(
        snapshot.draftThreadIds.filter((threadId) => threadId !== id)
      ),
    });
    snapshot = next;
    if (anchor) {
      syncSource();
      annotations?.refresh({ ids: [id], reason: 'external' });
      anchor.release();
    }
    if (store.get('activeIds').includes(id)) {
      setActive(store.get('activeIds').filter((activeId) => activeId !== id));
    }
    publish(next, {
      threads: [id],
      visible: !thread.resolved,
      draft: thread.status === 'draft',
    });
    return true;
  };
  const addThread = (
    input: {
      body: Value;
      excerpt?: string;
      id?: string;
      status?: 'draft' | 'published';
      target: CommentTarget;
      userId?: string;
    },
    pending?: PliteAnnotationAnchor
  ) => {
    initialize();
    const id = input.id ?? nanoid();
    const userId = input.userId ?? store.get('currentUserId');
    const body = normalizeBody(input.body);
    if (!body || !userId || threads.has(id) || destroyed) return null;
    const target = structuredClone(input.target);
    if (target.type === 'range' && target.range) validateRange(target.range);
    const anchor =
      target.type === 'range' && target.range
        ? (pending ??
          editor.anchor(target.range, {
            association: 'inward',
            deletion: 'nearest',
          }))
        : null;
    const createdAt = new Date().toISOString();
    const thread: CommentThread = Object.freeze({
      createdAt,
      excerpt: input.excerpt ?? '',
      id,
      resolved: false,
      status: input.status ?? 'published',
      target: freezeComment(target),
      userId,
      messages: Object.freeze([
        Object.freeze({ body, createdAt, id: nanoid(), userId }),
      ]),
    });
    threads.set(id, thread);
    if (anchor) {
      anchors.set(id, anchor);
      syncSource();
    }
    const consumePending = pending !== undefined && pending === pendingAnchor;
    if (consumePending) pendingAnchor = null;
    const next = {
      ...snapshot,
      pending: consumePending ? null : snapshot.pending,
      threadIds: Object.freeze([...snapshot.threadIds, id]),
      visibleThreadIds: Object.freeze([...snapshot.visibleThreadIds, id]),
      draftThreadIds:
        thread.status === 'draft'
          ? Object.freeze([...snapshot.draftThreadIds, id])
          : snapshot.draftThreadIds,
    };
    snapshot = Object.freeze(next);
    if (anchor) annotations?.refresh({ ids: [id], reason: 'external' });
    publish(next, {
      threads: [id],
      visible: true,
      draft: thread.status === 'draft',
      pending: consumePending,
    });
    return id;
  };
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
    annotations?.destroy();
    pendingAnchor?.release();
    pendingAnchor = null;
    anchors.forEach((anchor) => anchor.release());
    anchors.clear();
    threads.clear();
    initialThreads = null;
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
    rangeListeners.clear();
    refreshers.clear();
  };

  return {
    activate: ({ afterPublish, onCleanup }) => {
      onCleanup(destroy);
      afterPublish(() => {
        published = true;
        initialize();
      });
    },
    api: ({ editor: commandEditor }) => ({
      /** Start a comment at a range, or expand a caret to its text block. */
      begin: (at: Range | null = commandEditor.read.selection()) => {
        initialize();
        let range = at;
        if (!range || destroyed) return false;
        if (RangeApi.isCollapsed(range)) {
          const block = commandEditor.read.nodes.block({ at: range });
          range = block
            ? (commandEditor.read.ranges.get(block[1]) ?? null)
            : null;
        }
        if (!range || RangeApi.isCollapsed(range)) return false;
        validateRange(range);
        const anchor = editor.anchor(range, {
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
      /** Create from the pending selection; null leaves the composer intact. */
      create: (body: Value): string | null | Promise<string | null> => {
        initialize();
        const range = pendingAnchor?.resolve();
        return pendingAnchor && snapshot.pending && range
          ? addThread(
              {
                body,
                excerpt: snapshot.pending.excerpt,
                target: { type: 'range', range },
              },
              pendingAnchor
            )
          : null;
      },
      /** Create at an explicit range or suggestion ID; null means no thread. */
      createThread: (
        input: Parameters<typeof addThread>[0]
      ): string | null | Promise<string | null> => addThread(input),
      /** Retire an unpublished draft, including its private range. */
      discardDraft: (id: string) => {
        initialize();
        return threads.get(id)?.status === 'draft' ? removeThread(id) : false;
      },
      /** Edit the current user's message; false preserves the existing body. */
      edit: (
        id: string,
        messageId: string,
        body: Value
      ): boolean | Promise<boolean> => {
        initialize();
        const value = normalizeBody(body);
        const message = threads
          .get(id)
          ?.messages.find((item) => item.id === messageId);
        if (
          !value ||
          !message ||
          message.userId !== store.get('currentUserId')
        ) {
          return false;
        }
        return updateThread(id, (thread) => ({
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
        }));
      },
      /** Stable membership and pending-composer state for targeted UI reads. */
      getSnapshot: () => {
        initialize();
        return snapshot;
      },
      /** Read an immutable record with its current mapped range. */
      getThread: (id: string) => {
        initialize();
        return threads.get(id);
      },
      /** Save these current ranges with the same document value. */
      getThreads: (): readonly CommentThread[] => {
        initialize();
        return Object.freeze([...threads.values()]);
      },
      /** Resolve the pending selection without exposing its native handle. */
      pendingRange: () =>
        freezeComment(structuredClone(pendingAnchor?.resolve() ?? null)),
      /** Make an unpublished thread permanent in the loaded record set. */
      publishDraft: (id: string) => {
        initialize();
        const thread = threads.get(id);
        if (!thread || thread.status !== 'draft') return false;
        threads.set(id, Object.freeze({ ...thread, status: 'published' }));
        publish(
          {
            ...snapshot,
            draftThreadIds: Object.freeze(
              snapshot.draftThreadIds.filter((threadId) => threadId !== id)
            ),
          },
          { draft: true, threads: [id] }
        );
        return true;
      },
      /** Remove the current user's message; deleting the last removes its thread. */
      removeMessage: (id: string, messageId: string) => {
        initialize();
        const thread = threads.get(id);
        const message = thread?.messages.find((item) => item.id === messageId);
        if (
          !thread ||
          !message ||
          message.userId !== store.get('currentUserId')
        ) {
          return false;
        }
        return thread.messages.length === 1
          ? removeThread(id)
          : updateThread(id, (current) => ({
              ...current,
              messages: Object.freeze(
                current.messages.filter((item) => item.id !== messageId)
              ),
            }));
      },
      /** Remove a thread owned by the current user. */
      removeThread: (id: string) => {
        initialize();
        return threads.get(id)?.userId === store.get('currentUserId')
          ? removeThread(id)
          : false;
      },
      /** Add the current user's reply to an unresolved thread. */
      reply: (id: string, body: Value): boolean | Promise<boolean> => {
        initialize();
        const value = normalizeBody(body);
        const thread = threads.get(id);
        const userId = store.get('currentUserId');
        if (!value || !thread || thread.resolved || !userId) return false;
        return updateThread(id, (current) => ({
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
        }));
      },
      /** Set resolution for a thread owned by the current user. */
      resolve: (id: string, resolved = true) => {
        initialize();
        return threads.get(id)?.userId === store.get('currentUserId')
          ? updateThread(id, (thread) => ({ ...thread, resolved }))
          : false;
      },
      /** Atomically replace fetched records for the current document revision. */
      setThreads: (records: readonly CommentThread[]) => {
        initialize();
        replaceThreads(prepareThreads(records));
      },
      /** Observe one record; unrelated metadata writes do not wake it. */
      subscribeThread: (id: string, listener: () => void) => {
        initialize();
        const listeners = threadListeners.get(id) ?? new Set<() => void>();
        listeners.add(listener);
        threadListeners.set(id, listeners);
        return () => {
          listeners.delete(listener);
          if (!listeners.size) threadListeners.delete(id);
        };
      },
      /** Observe data actions and document edits that move persisted ranges. */
      subscribeThreads: (listener: (change: CommentsChange) => void) => {
        initialize();
        dataListeners.add(listener);
        return () => {
          dataListeners.delete(listener);
        };
      },
      subscribeVisibleThreadIds: (listener: () => void) => {
        initialize();
        visibleListeners.add(listener);
        return () => {
          visibleListeners.delete(listener);
        };
      },
      subscribeDraftThreadIds: (listener: () => void) => {
        initialize();
        draftListeners.add(listener);
        return () => {
          draftListeners.delete(listener);
        };
      },
      subscribePending: (listener: () => void) => {
        initialize();
        pendingListeners.add(listener);
        return () => {
          pendingListeners.delete(listener);
        };
      },
      idsAt: (location: Location) => {
        initialize();
        return Object.freeze(
          [
            ...new Map(
              nodeKeysAt(location).flatMap(
                (key) =>
                  annotations
                    ?.getAnnotationsAt(key)
                    .map(
                      (annotation) => [annotation.id, annotation] as const
                    ) ?? []
              )
            ).values(),
          ]
            .filter(
              ({ id, range }) =>
                !threads.get(id)?.resolved &&
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
      range: (id: string) => {
        initialize();
        const thread = threads.get(id);
        return thread?.target.type === 'range' ? thread.target.range : null;
      },
      setActive,
      /** Observe the same range projection used by decoration and persistence. */
      subscribe: (listener: (change: PliteAnnotationChange) => void) => {
        initialize();
        rangeListeners.add(listener);
        return () => {
          rangeListeners.delete(listener);
        };
      },
    }),
    decorate: {
      observe: ({ refresh }) => {
        initialize();
        refreshers.add(refresh);
        return () => {
          refreshers.delete(refresh);
        };
      },
      read: ({ entry: [node, path] }) => {
        if (!TextApi.isText(node)) return [];
        initialize();
        const key = editor.key(path);
        if (!key) return [];
        const textRange = {
          anchor: { offset: 0, path },
          focus: { offset: node.text.length, path },
        };
        const activeIds = store.get('activeIds');
        return (
          annotations?.getAnnotationsAt(key).flatMap(({ id, range }) => {
            if (threads.get(id)?.resolved) return [];
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
                      className: 'plite-comments',
                    },
                    key: `${id}:${key}`,
                    range: intersection,
                  },
                ];
          }) ?? []
        );
      },
    },
  };
});
