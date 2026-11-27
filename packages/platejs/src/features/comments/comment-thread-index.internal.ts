import {
  PathApi,
  PointApi,
  RangeApi,
  SelectionApi,
  TextApi,
  type Anchor,
  type Editor,
  type Location,
  type NodeKey,
  type Range,
} from '../../core';
import {
  type AnchorValue,
  type EditorCommit,
  getAuthoredViewCommit,
  getViewCommitSource,
  isDocumentView,
  notifyObservers,
  type ReadonlyAnchor,
  readShownPreview,
  subscribeEditorViewState,
  withStoredAuthoredRead,
} from '../../facade';

/**
 * Mapped attachment change emitted by `subscribeAttachments` when comment
 * ranges move, appear, disappear, or change due to an editor commit (`'editor'`)
 * or an external thread update (`'external'`).
 *
 * Placement-only updates (such as a named root moving within a page without
 * changing text nodes inside that root) can carry affected `ids` with an empty
 * `nodeKeys` array.
 */
export type CommentAttachmentChange = Readonly<{
  ids: readonly string[];
  nodeKeys: readonly NodeKey[];
  reason: 'editor' | 'external';
}>;

export type CommentThreadEntry = {
  keys: readonly NodeKey[];
  range: Range | null;
  root: Anchor<Range>['root'];
};

type ThreadIndex = {
  byKey: Map<NodeKey, Set<string>>;
  entries: Map<string, CommentThreadEntry>;
  unplacedByRoot: Map<Anchor<Range>['root'], Set<string>>;
};

type ThreadEntryChange = {
  changed: boolean;
  hadPrevious: boolean;
  hasNext: boolean;
  nextKeys: readonly NodeKey[];
  nextRoot: Anchor<Range>['root'];
  previousKeys: readonly NodeKey[];
  previousRoot: Anchor<Range>['root'];
};

type SnapshotIdentity = {
  children: unknown;
  index: unknown;
};

type ObservedViewState = {
  attachmentListeners: Set<(change: CommentAttachmentChange) => void>;
  documentView: boolean;
  lastOwnerVersion: number;
  lastSchema: unknown;
  lastSnapshot: SnapshotIdentity;
  lastSourceRevision: number;
  paintRefreshers: Set<(input: { nodeKeys: readonly NodeKey[] }) => void>;
  preview: 'accepted' | 'proposed' | undefined;
  projected: ThreadIndex | null;
  rootTops: Map<string, string | null> | null;
  stopViewState: () => void;
};

type PassiveViewIndex = {
  faultedRoots: Set<Anchor<Range>['root']>;
  index: ThreadIndex;
  preview: 'accepted' | 'proposed' | undefined;
  roots: Map<Anchor<Range>['root'], SnapshotIdentity>;
  schema: unknown;
  sourceRevision: number;
};

const EMPTY_ROOT_CHILDREN: readonly unknown[] = Object.freeze([]);

const INVALID_PROJECTION_RANGE_ERROR =
  /Cannot project a range outside the committed snapshot|Point offset .* is outside text bounds|Invalid text offset|Point path .* is not a text node/;

const sameNodeKeys = (left: readonly NodeKey[], right: readonly NodeKey[]) =>
  left.length === right.length &&
  left.every((key, index) => key === right[index]);

const createThreadIndex = (): ThreadIndex => ({
  byKey: new Map(),
  entries: new Map(),
  unplacedByRoot: new Map(),
});

const clearThreadIndex = (index: ThreadIndex) => {
  index.byKey.clear();
  index.entries.clear();
  index.unplacedByRoot.clear();
};

const detachThreadEntry = (
  index: ThreadIndex,
  id: string,
  entry: CommentThreadEntry
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

const attachThreadEntry = (
  index: ThreadIndex,
  id: string,
  entry: CommentThreadEntry
) => {
  index.entries.set(id, entry);
  if (entry.keys.length) {
    for (const key of entry.keys) {
      const ids = index.byKey.get(key) ?? new Set<string>();
      ids.add(id);
      index.byKey.set(key, ids);
    }
  } else {
    const unplaced = index.unplacedByRoot.get(entry.root) ?? new Set<string>();
    unplaced.add(id);
    index.unplacedByRoot.set(entry.root, unplaced);
  }
};

const threadMatchesView = (
  viewRoot: Anchor<Range>['root'],
  root: Anchor<Range>['root']
) => viewRoot === undefined || root === viewRoot;

const placementChangedIn = (commit: EditorCommit) =>
  commit.changed.hasAny('structure') ||
  commit.changed.hasAny('properties') ||
  commit.changed.hasAny('replace');

const locationRoot = (location: Location) => {
  if (PathApi.isPath(location)) return undefined;
  return PointApi.isPoint(location)
    ? location.root
    : SelectionApi.root(location);
};

export const nodeKeysAt = (view: Editor, location: Location) => {
  const keys = new Set<NodeKey>();
  for (const [node] of view.read.nodes.entries({
    at: location,
    match: TextApi.isText,
  })) {
    keys.add(view.key(node));
  }
  return [...keys];
};

const readSnapshotIdentity = (view: Editor): SnapshotIdentity => {
  const snapshot = view.read.runtime.snapshot();
  return { children: snapshot.children, index: snapshot.index };
};

const readRootIdentity = (
  view: Editor,
  root: Anchor<Range>['root']
): SnapshotIdentity => {
  if (root === undefined || root === view.read.view.root()) {
    return readSnapshotIdentity(view);
  }
  const children = view.read.root(root);
  return {
    children: children.length ? children : EMPTY_ROOT_CHILDREN,
    index: null,
  };
};

const sameSnapshotIdentity = (
  left: SnapshotIdentity,
  right: SnapshotIdentity
) => left.children === right.children && left.index === right.index;

export type CommentThreadIndexController = {
  destroy: () => void;
  idsAt: (view: Editor, location: Location) => readonly string[];
  invalidateSources: () => void;
  observePaint: (
    view: Editor,
    refresh: (input: { nodeKeys: readonly NodeKey[] }) => void
  ) => () => void;
  readPaintEntriesAt: (
    view: Editor,
    nodeKey: NodeKey
  ) => ReadonlyArray<Readonly<{ id: string; range: Range }>>;
  refreshIds: (ids: readonly string[]) => void;
  refreshViews: (ids?: readonly string[]) => () => void;
  subscribeAttachments: (
    view: Editor,
    listener: (change: CommentAttachmentChange) => void
  ) => () => void;
};

export const createCommentThreadIndex = ({
  anchors,
  editor,
  getAnchorIds,
  getSourceOrder,
  getSourcesByRoot,
  isDestroyed,
  isResolved,
  rangeIn,
  textIn,
}: Readonly<{
  anchors: ReadonlyMap<string, Anchor<Range>>;
  editor: Editor;
  getAnchorIds: () => ReadonlyMap<ReadonlyAnchor<AnchorValue>, string>;
  getSourceOrder: () => ReadonlyMap<string, number>;
  getSourcesByRoot: () => ReadonlyMap<
    Anchor<Range>['root'],
    ReadonlyArray<Readonly<{ anchor: Anchor<Range>; id: string }>>
  >;
  isDestroyed: () => boolean;
  isResolved: (id: string) => boolean;
  rangeIn: (view: Editor, anchor: Anchor<Range>) => Range | null;
  textIn: (
    view: { read: { ranges: { isEmpty: (range: Range) => boolean } } },
    range: Range | null
  ) => Range | null;
}>): CommentThreadIndexController => {
  const observedViews = new Map<Editor, ObservedViewState>();
  const storedIndex = createThreadIndex();
  let passiveViews = new WeakMap<Editor, PassiveViewIndex>();
  let passiveStored: PassiveViewIndex | null = null;
  let sourceRevision = 0;
  let storedOwnerVersion = -1;
  let storedSchema: unknown;
  let storedSnapshot: SnapshotIdentity = { children: null, index: null };
  let storedSourceRevision = -1;
  let stopIndexCommit: (() => void) | null = null;
  let heldChanges: Array<() => void> | null = null;

  const readOwnerVersion = () =>
    withStoredAuthoredRead(
      editor,
      () => editor.read.runtime.snapshot().version
    );

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

  const queueChange = (announce: () => void) => {
    if (heldChanges) heldChanges.push(announce);
    else announce();
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

  const hasNamedThreads = () => {
    const sourcesByRoot = getSourcesByRoot();
    return sourcesByRoot.size > (sourcesByRoot.has(undefined) ? 1 : 0);
  };

  const readNamedRootTops = (view: Editor) => {
    const tops = new Map<string, string | null>();
    if (!hasNamedThreads()) return tops;
    const byRoot = new Map(
      view.read.roots().map((entry) => [entry.root, entry.top])
    );
    for (const root of getSourcesByRoot().keys()) {
      if (root === undefined) continue;
      const top = byRoot.get(root);
      tops.set(root, top ? `${top.join('.')}:${view.key(top)}` : null);
    }
    return tops;
  };

  const placementThreadIds = (commit: EditorCommit, force = false) => {
    if (!hasNamedThreads() || (!force && !placementChangedIn(commit))) {
      return [];
    }
    const sourcesByRoot = getSourcesByRoot();
    const ids: string[] = [];
    for (const root of commit.changed.rootPlacements()) {
      for (const { id } of sourcesByRoot.get(root) ?? []) ids.push(id);
    }
    return ids;
  };

  const hasPageAttachmentView = () => {
    for (const [view, state] of observedViews) {
      if (
        state.attachmentListeners.size > 0 &&
        !state.documentView &&
        view.read.view.root() === undefined
      ) {
        return true;
      }
    }
    return false;
  };

  const resolveEntrySafely = (
    reader: Editor,
    id: string,
    anchor: Anchor<Range>,
    resolve: (anchor: Anchor<Range>) => Range | null
  ): { entry: CommentThreadEntry; ok: true } | { ok: false } => {
    let resolved: Range | null;
    try {
      resolved = resolve(anchor);
    } catch (error) {
      if (
        error instanceof Error &&
        INVALID_PROJECTION_RANGE_ERROR.test(error.message)
      ) {
        return {
          entry: { keys: [], range: null, root: anchor.root },
          ok: true,
        };
      }
      console.error(
        `Comment thread "${id}" failed while resolving its anchor.`,
        error
      );
      return { ok: false };
    }
    try {
      const nextRange = textIn(reader, resolved);
      const nextKeys = resolved ? nodeKeysAt(reader, resolved) : [];
      return {
        entry: { keys: nextKeys, range: nextRange, root: anchor.root },
        ok: true,
      };
    } catch (error) {
      if (
        error instanceof Error &&
        INVALID_PROJECTION_RANGE_ERROR.test(error.message)
      ) {
        return {
          entry: { keys: [], range: null, root: anchor.root },
          ok: true,
        };
      }
      console.error(
        `Comment thread "${id}" failed while indexing its range.`,
        error
      );
      return { ok: false };
    }
  };

  const updateThreadEntry = (
    index: ThreadIndex,
    id: string,
    reader: Editor,
    resolve: (anchor: Anchor<Range>) => Range | null,
    allowedViewRoot?: Anchor<Range>['root'],
    filterByViewRoot = false
  ): ThreadEntryChange => {
    const previous = index.entries.get(id);
    const anchor = anchors.get(id);
    if (
      !anchor ||
      (filterByViewRoot && !threadMatchesView(allowedViewRoot, anchor.root))
    ) {
      if (previous) detachThreadEntry(index, id, previous);
      index.entries.delete(id);
      return {
        changed: previous !== undefined,
        hadPrevious: previous !== undefined,
        hasNext: false,
        nextKeys: [],
        nextRoot: undefined,
        previousKeys: previous?.keys ?? [],
        previousRoot: previous?.root,
      };
    }

    const staged = resolveEntrySafely(reader, id, anchor, resolve);
    if (!staged.ok) {
      return {
        changed: false,
        hadPrevious: previous !== undefined,
        hasNext: previous !== undefined,
        nextKeys: previous?.keys ?? [],
        nextRoot: previous?.root,
        previousKeys: previous?.keys ?? [],
        previousRoot: previous?.root,
      };
    }

    if (previous) detachThreadEntry(index, id, previous);
    attachThreadEntry(index, id, staged.entry);

    return {
      changed:
        !previous ||
        previous.root !== staged.entry.root ||
        !RangeApi.equals(previous.range, staged.entry.range) ||
        !sameNodeKeys(previous.keys, staged.entry.keys),
      hadPrevious: previous !== undefined,
      hasNext: true,
      nextKeys: staged.entry.keys,
      nextRoot: staged.entry.root,
      previousKeys: previous?.keys ?? [],
      previousRoot: previous?.root,
    };
  };

  const populateRootEntries = (
    reader: Editor,
    target: ThreadIndex,
    root: Anchor<Range>['root'],
    resolve: (anchor: Anchor<Range>) => Range | null,
    fallbackIndex?: ThreadIndex
  ) => {
    let hadFault = false;
    for (const [id, entry] of [...target.entries]) {
      if (entry.root === root && !anchors.has(id)) {
        detachThreadEntry(target, id, entry);
        target.entries.delete(id);
      }
    }
    for (const { anchor, id } of getSourcesByRoot().get(root) ?? []) {
      const current = target.entries.get(id);
      const fallback = current ?? fallbackIndex?.entries.get(id);
      const staged = resolveEntrySafely(reader, id, anchor, resolve);
      if (!staged.ok) {
        hadFault = true;
        if (fallback && current !== fallback) {
          if (current) detachThreadEntry(target, id, current);
          attachThreadEntry(target, id, fallback);
        }
        continue;
      }
      if (current) detachThreadEntry(target, id, current);
      attachThreadEntry(target, id, staged.entry);
    }
    return hadFault;
  };

  const adoptPassiveRoot = (
    target: ThreadIndex,
    passive: ThreadIndex,
    root: Anchor<Range>['root']
  ) => {
    for (const [id, entry] of [...target.entries]) {
      if (entry.root === root) {
        detachThreadEntry(target, id, entry);
        target.entries.delete(id);
      }
    }
    passive.entries.forEach((entry, id) => {
      if (entry.root === root) {
        attachThreadEntry(target, id, entry);
      }
    });
  };

  const populateProjectedIndex = (
    view: Editor,
    projected: ThreadIndex,
    fallbackIndex?: ThreadIndex
  ) => {
    const viewRoot = view.read.view.root();
    for (const [id, entry] of [...projected.entries]) {
      if (!anchors.has(id) || !threadMatchesView(viewRoot, entry.root)) {
        detachThreadEntry(projected, id, entry);
        projected.entries.delete(id);
      }
    }
    for (const root of getSourcesByRoot().keys()) {
      if (!threadMatchesView(viewRoot, root)) continue;
      populateRootEntries(
        view,
        projected,
        root,
        (target) => rangeIn(view, target),
        fallbackIndex
      );
    }
  };

  const markStoredFresh = () => {
    storedSchema = editor.read.schema.identity();
    const ownerSnapshot = withStoredAuthoredRead(editor, () =>
      editor.read.runtime.snapshot()
    );
    storedOwnerVersion = ownerSnapshot.version;
    storedSnapshot = {
      children: ownerSnapshot.children,
      index: ownerSnapshot.index,
    };
    storedSourceRevision = sourceRevision;
    passiveStored = null;
  };

  const markViewFresh = (view: Editor, state: ObservedViewState) => {
    state.lastSchema = view.read.schema.identity();
    state.lastSourceRevision = sourceRevision;
    if (!state.documentView) {
      state.lastOwnerVersion = readOwnerVersion();
      state.lastSnapshot = readSnapshotIdentity(view);
    }
    passiveViews.delete(view);
  };

  const reindexStored = (ids?: readonly string[]) => {
    const changed = new Map<string, ThreadEntryChange>();
    const targetIds =
      ids ?? new Set([...storedIndex.entries.keys(), ...anchors.keys()]);
    withStoredAuthoredRead(editor, () => {
      targetIds.forEach((id) => {
        const result = updateThreadEntry(storedIndex, id, editor, (anchor) =>
          anchor.resolve()
        );
        if (result.changed) changed.set(id, result);
      });
    });
    markStoredFresh();
    return changed;
  };

  const updateProjectedView = (
    view: Editor,
    projected: ThreadIndex,
    targetIds?: Iterable<string>
  ) => {
    const viewRoot = view.read.view.root();
    const attachmentIds: string[] = [];
    const attachmentKeys: NodeKey[] = [];
    const paintKeys: NodeKey[] = [];
    const checkIds =
      targetIds ?? new Set([...projected.entries.keys(), ...anchors.keys()]);
    for (const id of checkIds) {
      const result = updateThreadEntry(
        projected,
        id,
        view,
        (anchor) => rangeIn(view, anchor),
        viewRoot,
        true
      );
      if (!result.changed) continue;
      attachmentIds.push(id);
      attachmentKeys.push(...result.previousKeys, ...result.nextKeys);
      if (result.hadPrevious && result.previousRoot === viewRoot) {
        paintKeys.push(...result.previousKeys);
      }
      if (result.hasNext && result.nextRoot === viewRoot) {
        paintKeys.push(...result.nextKeys);
      }
    }
    return { attachmentIds, attachmentKeys, paintKeys };
  };

  const storedChangedForView = (
    storedChanged: ReadonlyMap<string, ThreadEntryChange>,
    viewRoot: Anchor<Range>['root']
  ) => {
    const attachmentIds: string[] = [];
    const attachmentKeys: NodeKey[] = [];
    const paintKeys: NodeKey[] = [];
    storedChanged.forEach((change, id) => {
      const matchesAttachment =
        viewRoot === undefined ||
        (change.hadPrevious && change.previousRoot === viewRoot) ||
        (change.hasNext && change.nextRoot === viewRoot);
      if (matchesAttachment) {
        attachmentIds.push(id);
        attachmentKeys.push(...change.previousKeys, ...change.nextKeys);
      }
      if (change.hadPrevious && change.previousRoot === viewRoot) {
        paintKeys.push(...change.previousKeys);
      }
      if (change.hasNext && change.nextRoot === viewRoot) {
        paintKeys.push(...change.nextKeys);
      }
    });
    return { attachmentIds, attachmentKeys, paintKeys };
  };

  const announcePaint = (
    view: Editor,
    state: ObservedViewState,
    keys: Iterable<NodeKey>
  ) => {
    if (!state.paintRefreshers.size) return;
    const uniqueKeys = [...new Set(keys)];
    if (!uniqueKeys.length) return;
    queueChange(() => {
      if (observedViews.get(view) !== state || !state.paintRefreshers.size) {
        return;
      }
      deliver(state.paintRefreshers, 'commit-listener', {
        nodeKeys: uniqueKeys,
      });
    });
  };

  const announceAttachments = (
    view: Editor,
    state: ObservedViewState,
    ids: Iterable<string>,
    reason: CommentAttachmentChange['reason'],
    keys: Iterable<NodeKey> = []
  ) => {
    if (!state.attachmentListeners.size) return;
    const uniqueIds = [...new Set(ids)];
    if (!uniqueIds.length) return;
    const uniqueKeys = [...new Set(keys)];
    queueChange(() => {
      if (
        observedViews.get(view) !== state ||
        !state.attachmentListeners.size
      ) {
        return;
      }
      const liveIds =
        reason === 'editor'
          ? uniqueIds.filter((id) => anchors.has(id))
          : uniqueIds;
      if (!liveIds.length) return;
      const change: CommentAttachmentChange = Object.freeze({
        ids: Object.freeze(liveIds),
        nodeKeys: Object.freeze(uniqueKeys),
        reason,
      });
      deliver(state.attachmentListeners, 'commit-listener', change);
    });
  };

  const snapshotViewState = (view: Editor, state: ObservedViewState) => {
    const viewRoot = view.read.view.root();
    const previousEntries = state.projected?.entries ?? storedIndex.entries;
    const ranges = new Map<string, CommentThreadEntry>();
    previousEntries.forEach((entry, id) => {
      if (threadMatchesView(viewRoot, entry.root)) ranges.set(id, entry);
    });
    const tops =
      viewRoot === undefined &&
      state.attachmentListeners.size > 0 &&
      hasNamedThreads()
        ? (state.rootTops ??
          withStoredAuthoredRead(editor, () => readNamedRootTops(editor)))
        : null;
    return { ranges, tops };
  };

  const syncViewProjection = (
    view: Editor,
    state: ObservedViewState,
    previous = snapshotViewState(view, state),
    extraIds: readonly string[] = [],
    notifyPaint = false
  ) => {
    const viewRoot = view.read.view.root();
    const nextPreview = readShownPreview(view);
    const passive = passiveViews.get(view);
    const hadPassiveFault = Boolean(passive?.faultedRoots.size);
    state.preview = nextPreview;
    if (nextPreview) {
      if (!state.projected) {
        const projected = createThreadIndex();
        previous.ranges.forEach((entry, id) => {
          attachThreadEntry(projected, id, entry);
        });
        state.projected = projected;
      }
      const adoptedRoots = new Set<Anchor<Range>['root']>();
      if (
        passive &&
        passive.sourceRevision === sourceRevision &&
        passive.schema === view.read.schema.identity() &&
        passive.preview === nextPreview
      ) {
        for (const [root, recorded] of passive.roots) {
          if (!threadMatchesView(viewRoot, root)) continue;
          if (sameSnapshotIdentity(recorded, readRootIdentity(view, root))) {
            adoptPassiveRoot(state.projected, passive.index, root);
            adoptedRoots.add(root);
          }
        }
      }
      if (adoptedRoots.size === 0) {
        updateProjectedView(view, state.projected);
      } else {
        const remainingIds = new Set<string>();
        state.projected.entries.forEach((entry, id) => {
          if (!adoptedRoots.has(entry.root)) remainingIds.add(id);
        });
        anchors.forEach((anchor, id) => {
          if (
            threadMatchesView(viewRoot, anchor.root) &&
            !adoptedRoots.has(anchor.root)
          ) {
            remainingIds.add(id);
          }
        });
        if (remainingIds.size > 0) {
          updateProjectedView(view, state.projected, remainingIds);
        }
      }
    } else {
      state.projected = null;
    }
    markViewFresh(view, state);

    const nextEntries = state.projected?.entries ?? storedIndex.entries;
    const ids = new Set<string>(extraIds);
    const keys = new Set<NodeKey>();
    const paintKeys = new Set<NodeKey>();
    const seen = new Set([...previous.ranges.keys(), ...nextEntries.keys()]);
    seen.forEach((id) => {
      const prev = previous.ranges.get(id);
      const next = nextEntries.get(id);
      if (next && !threadMatchesView(viewRoot, next.root)) return;
      if (
        Boolean(prev) !== Boolean(next) ||
        !RangeApi.equals(prev?.range ?? null, next?.range ?? null) ||
        !sameNodeKeys(prev?.keys ?? [], next?.keys ?? [])
      ) {
        ids.add(id);
        for (const key of prev?.keys ?? []) keys.add(key);
        for (const key of next?.keys ?? []) keys.add(key);
        if (prev && prev.root === viewRoot) {
          for (const key of prev.keys) paintKeys.add(key);
        }
        if (next && next.root === viewRoot) {
          for (const key of next.keys) paintKeys.add(key);
        }
      }
    });
    if (
      viewRoot === undefined &&
      state.attachmentListeners.size > 0 &&
      hasNamedThreads()
    ) {
      const afterTops = state.projected
        ? readNamedRootTops(view)
        : withStoredAuthoredRead(editor, () => readNamedRootTops(editor));
      if (previous.tops) {
        for (const [root, group] of getSourcesByRoot()) {
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
    if (notifyPaint || hadPassiveFault) {
      announcePaint(view, state, paintKeys);
    }
    announceAttachments(view, state, ids, 'editor', keys);
  };

  const syncObservedViews = (
    storedChanged: ReadonlyMap<string, ThreadEntryChange>,
    reason: CommentAttachmentChange['reason'],
    notifyPaint: boolean,
    ids?: readonly string[],
    baseCommit?: EditorCommit,
    reconfigured = false,
    skipViews?: ReadonlyMap<Editor, unknown>
  ) => {
    const basePlacements =
      baseCommit && hasPageAttachmentView()
        ? placementThreadIds(baseCommit, true)
        : [];
    for (const [view, state] of [...observedViews]) {
      if (
        observedViews.get(view) !== state ||
        skipViews?.has(view) ||
        (reason === 'editor' && state.documentView && !reconfigured)
      ) {
        continue;
      }
      const viewRoot = view.read.view.root();
      const pageView = viewRoot === undefined;
      const changed = state.projected
        ? updateProjectedView(view, state.projected, ids)
        : storedChangedForView(storedChanged, viewRoot);
      markViewFresh(view, state);

      const changedIds = new Set(changed.attachmentIds);
      if (
        !state.documentView &&
        pageView &&
        state.attachmentListeners.size > 0 &&
        baseCommit
      ) {
        const placements = state.projected
          ? placementThreadIds(getAuthoredViewCommit(view, baseCommit), true)
          : basePlacements;
        for (const id of placements) changedIds.add(id);
        if (state.projected && hasNamedThreads()) {
          state.rootTops = readNamedRootTops(view);
        }
      } else if (
        !state.documentView &&
        pageView &&
        state.attachmentListeners.size > 0 &&
        state.projected &&
        hasNamedThreads()
      ) {
        state.rootTops = readNamedRootTops(view);
      }
      if (notifyPaint) {
        announcePaint(view, state, changed.paintKeys);
      }
      announceAttachments(
        view,
        state,
        changedIds,
        reason,
        changed.attachmentKeys
      );
    }
  };

  const onIndexCommit = (commit?: EditorCommit) => {
    if (isDestroyed() || !observedViews.size) return;
    const baseCommit = commit && getViewCommitSource(commit);
    const nextSchema = editor.read.schema.identity();
    const reconfigured = nextSchema !== storedSchema;

    const pendingSwitches = new Map<
      Editor,
      ReturnType<typeof snapshotViewState>
    >();
    for (const [view, state] of observedViews) {
      if (!state.documentView && readShownPreview(view) !== state.preview) {
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
      const ownerVersion = readOwnerVersion();
      storedOwnerVersion = ownerVersion;
      observedViews.forEach((state) => {
        if (!state.documentView) state.lastOwnerVersion = ownerVersion;
      });
      return;
    }

    const flush = runHeld(() => {
      if (!baseCommit || reconfigured) {
        const storedChanged = reindexStored();
        const basePlacements =
          baseCommit && hasPageAttachmentView()
            ? placementThreadIds(baseCommit, true)
            : [];
        for (const [view, switched] of pendingSwitches) {
          const state = observedViews.get(view);
          if (!state || state.documentView) continue;
          const pageView = view.read.view.root() === undefined;
          const extra =
            pageView && state.attachmentListeners.size > 0 && baseCommit
              ? readShownPreview(view)
                ? placementThreadIds(
                    getAuthoredViewCommit(view, baseCommit),
                    true
                  )
                : basePlacements
              : [];
          syncViewProjection(view, state, switched, extra, reconfigured);
        }
        syncObservedViews(
          storedChanged,
          'editor',
          reconfigured,
          undefined,
          baseCommit,
          reconfigured,
          pendingSwitches
        );
        return;
      }

      const anchorIds = getAnchorIds();
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
        : new Map<string, ThreadEntryChange>();
      if (!storedCandidates.size) markStoredFresh();

      const placementIds = hasPageAttachmentView()
        ? placementThreadIds(baseCommit)
        : [];
      const sourcesByRoot = getSourcesByRoot();

      for (const [view, state] of [...observedViews]) {
        if (observedViews.get(view) !== state || state.documentView) {
          continue;
        }
        const viewRoot = view.read.view.root();
        const pageView = viewRoot === undefined;
        const switched = pendingSwitches.get(view);
        if (switched) {
          const extra =
            pageView && state.attachmentListeners.size > 0
              ? readShownPreview(view)
                ? placementThreadIds(getAuthoredViewCommit(view, baseCommit))
                : placementIds
              : [];
          syncViewProjection(view, state, switched, extra);
          continue;
        }
        const { projected } = state;
        if (!projected) {
          markViewFresh(view, state);
          if (!state.attachmentListeners.size) continue;
          const changed = storedChangedForView(storedChanged, viewRoot);
          const ids = new Set(changed.attachmentIds);
          if (pageView) {
            for (const id of placementIds) ids.add(id);
          }
          announceAttachments(
            view,
            state,
            ids,
            'editor',
            changed.attachmentKeys
          );
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
              const entry = projected.entries.get(id);
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
        markViewFresh(view, state);
        if (!state.attachmentListeners.size) continue;
        const ids = new Set(changed.attachmentIds);
        if (pageView) {
          const viewPlacements = placementThreadIds(viewCommit);
          for (const id of viewPlacements) ids.add(id);
          if (viewPlacements.length) state.rootTops = readNamedRootTops(view);
        }
        announceAttachments(view, state, ids, 'editor', changed.attachmentKeys);
      }
    });
    flush();
  };

  const ensureThreadIndex = () => {
    if (stopIndexCommit) return;
    clearThreadIndex(storedIndex);
    reindexStored();
    stopIndexCommit = editor.subscribeCommit(onIndexCommit);
  };

  const teardownThreadIndex = () => {
    if (observedViews.size > 0) return;
    stopIndexCommit?.();
    stopIndexCommit = null;
    clearThreadIndex(storedIndex);
    storedOwnerVersion = -1;
    storedSnapshot = { children: null, index: null };
    storedSchema = undefined;
    storedSourceRevision = -1;
    passiveStored = null;
  };

  const ensureObservedView = (view: Editor) => {
    ensureThreadIndex();
    let state = observedViews.get(view);
    if (!state) {
      passiveViews.delete(view);
      const documentView = isDocumentView(view);
      const preview = readShownPreview(view);
      const projected = preview || documentView ? createThreadIndex() : null;
      if (projected) populateProjectedIndex(view, projected);
      const created: ObservedViewState = {
        attachmentListeners: new Set(),
        documentView,
        lastOwnerVersion: documentView ? -1 : readOwnerVersion(),
        lastSchema: view.read.schema.identity(),
        lastSnapshot: documentView
          ? { children: null, index: null }
          : readSnapshotIdentity(view),
        lastSourceRevision: sourceRevision,
        paintRefreshers: new Set(),
        preview,
        projected,
        rootTops: null,
        stopViewState: documentView
          ? () => {}
          : subscribeEditorViewState(view, (change) => {
              if (
                isDestroyed() ||
                change !== 'authored' ||
                (readShownPreview(view) === created.preview &&
                  isObservedStateFresh(view, created, view.read.view.root()))
              ) {
                return;
              }
              syncViewProjection(view, created);
            }),
      };
      state = created;
      observedViews.set(view, state);
    }
    return state;
  };

  const releaseObservedViewIfUnused = (
    view: Editor,
    state: ObservedViewState
  ) => {
    if (
      state.paintRefreshers.size === 0 &&
      state.attachmentListeners.size === 0 &&
      observedViews.get(view) === state
    ) {
      state.stopViewState();
      if (state.projected) clearThreadIndex(state.projected);
      observedViews.delete(view);
      teardownThreadIndex();
    }
  };

  const getPassiveIndex = (
    view: Editor,
    root: Anchor<Range>['root'],
    fallbackIndex?: ThreadIndex
  ): ThreadIndex => {
    const documentView = isDocumentView(view);
    const preview = readShownPreview(view);
    const schema = view.read.schema.identity();
    const rootIdentity = documentView
      ? { children: null, index: null }
      : readRootIdentity(view, root);
    let cached = passiveViews.get(view);
    if (
      !cached ||
      cached.sourceRevision !== sourceRevision ||
      cached.schema !== schema ||
      cached.preview !== preview
    ) {
      cached = {
        faultedRoots: new Set(),
        index: createThreadIndex(),
        preview,
        roots: new Map(),
        schema,
        sourceRevision,
      };
      passiveViews.set(view, cached);
    }
    const recorded = cached.roots.get(root);
    if (
      recorded &&
      (documentView || sameSnapshotIdentity(recorded, rootIdentity))
    ) {
      return cached.index;
    }
    const hadFault = populateRootEntries(
      view,
      cached.index,
      root,
      (target) => rangeIn(view, target),
      fallbackIndex
    );
    if (hadFault) {
      cached.faultedRoots.add(root);
      cached.roots.delete(root);
    } else {
      cached.faultedRoots.delete(root);
      cached.roots.set(root, rootIdentity);
    }
    return cached.index;
  };

  const getStoredPassiveIndex = (root: Anchor<Range>['root']): ThreadIndex =>
    withStoredAuthoredRead(editor, () => {
      const schema = editor.read.schema.identity();
      const rootIdentity = readRootIdentity(editor, root);
      if (
        !passiveStored ||
        passiveStored.sourceRevision !== sourceRevision ||
        passiveStored.schema !== schema
      ) {
        passiveStored = {
          faultedRoots: new Set(),
          index: createThreadIndex(),
          preview: undefined,
          roots: new Map(),
          schema,
          sourceRevision,
        };
      }
      const recorded = passiveStored.roots.get(root);
      if (recorded && sameSnapshotIdentity(recorded, rootIdentity)) {
        return passiveStored.index;
      }
      const hadFault = populateRootEntries(
        editor,
        passiveStored.index,
        root,
        (target) => target.resolve(),
        observedViews.size > 0 ? storedIndex : undefined
      );
      if (hadFault) {
        passiveStored.faultedRoots.add(root);
        passiveStored.roots.delete(root);
      } else {
        passiveStored.faultedRoots.delete(root);
        passiveStored.roots.set(root, rootIdentity);
      }
      return passiveStored.index;
    });

  const isStoredFresh = () => {
    if (
      storedSourceRevision !== sourceRevision ||
      storedSchema !== editor.read.schema.identity()
    ) {
      return false;
    }
    const ownerSnapshot = withStoredAuthoredRead(editor, () =>
      editor.read.runtime.snapshot()
    );
    return (
      storedOwnerVersion === ownerSnapshot.version &&
      storedSnapshot.children === ownerSnapshot.children &&
      storedSnapshot.index === ownerSnapshot.index
    );
  };

  const isObservedStateFresh = (
    view: Editor,
    state: ObservedViewState,
    root: Anchor<Range>['root']
  ) => {
    if (
      state.lastSourceRevision !== sourceRevision ||
      state.lastSchema !== view.read.schema.identity()
    ) {
      return false;
    }
    if (state.documentView) return true;
    if (readShownPreview(view) !== state.preview) return false;
    const viewRoot = view.read.view.root();
    if (root === viewRoot) {
      const currentSnapshot = readSnapshotIdentity(view);
      if (!sameSnapshotIdentity(state.lastSnapshot, currentSnapshot)) {
        return false;
      }
      if (!state.projected) {
        if (
          storedSourceRevision !== sourceRevision ||
          storedSchema !== editor.read.schema.identity()
        ) {
          return false;
        }
        const ownerSnapshot = withStoredAuthoredRead(editor, () =>
          readSnapshotIdentity(editor)
        );
        if (!sameSnapshotIdentity(storedSnapshot, ownerSnapshot)) {
          return false;
        }
      }
      return true;
    }
    if (state.lastOwnerVersion !== readOwnerVersion()) {
      return false;
    }
    if (!state.projected && !isStoredFresh()) {
      return false;
    }
    return true;
  };

  const getCurrentViewIndex = (
    view: Editor,
    root: Anchor<Range>['root']
  ): ThreadIndex => {
    const observed = observedViews.get(view);
    if (observed) {
      if (isObservedStateFresh(view, observed, root)) {
        return observed.projected ?? storedIndex;
      }
      if (
        !observed.documentView &&
        !readShownPreview(view) &&
        isStoredFresh()
      ) {
        return storedIndex;
      }
    }
    return getPassiveIndex(
      view,
      root,
      observed ? (observed.projected ?? storedIndex) : undefined
    );
  };

  const sortBySourceOrder = (ids: Iterable<string>) => {
    const list = [...ids];
    if (list.length <= 1) return list;
    const order = getSourceOrder();
    return list.sort(
      (left, right) => (order.get(left) ?? 0) - (order.get(right) ?? 0)
    );
  };

  return {
    destroy: () => {
      stopIndexCommit?.();
      stopIndexCommit = null;
      clearThreadIndex(storedIndex);
      observedViews.forEach(
        ({
          attachmentListeners,
          paintRefreshers,
          projected,
          stopViewState,
        }) => {
          stopViewState();
          attachmentListeners.clear();
          paintRefreshers.clear();
          if (projected) clearThreadIndex(projected);
        }
      );
      observedViews.clear();
      passiveViews = new WeakMap();
      passiveStored = null;
      storedOwnerVersion = -1;
      storedSnapshot = { children: null, index: null };
      storedSchema = undefined;
      storedSourceRevision = -1;
    },
    idsAt: (view: Editor, location: Location) => {
      if (isDestroyed()) return Object.freeze([]);
      const viewRoot = view.read.view.root();
      const root = locationRoot(location) ?? viewRoot;
      if (viewRoot !== undefined && root !== viewRoot) {
        if (isDocumentView(view) || readShownPreview(view)) {
          return Object.freeze([]);
        }
        const index =
          observedViews.size > 0 && isStoredFresh()
            ? storedIndex
            : getStoredPassiveIndex(root);
        const matched = new Set<string>();
        withStoredAuthoredRead(editor, () => {
          for (const key of nodeKeysAt(editor, location)) {
            for (const id of index.byKey.get(key) ?? []) {
              const entry = index.entries.get(id);
              if (
                entry &&
                entry.root === root &&
                !isResolved(id) &&
                entry.range &&
                RangeApi.includes(entry.range, location)
              ) {
                matched.add(id);
              }
            }
          }
        });
        return Object.freeze(sortBySourceOrder(matched));
      }
      const index = getCurrentViewIndex(view, root);
      const matched = new Set<string>();
      for (const key of nodeKeysAt(view, location)) {
        for (const id of index.byKey.get(key) ?? []) {
          const entry = index.entries.get(id);
          if (
            entry &&
            entry.root === root &&
            !isResolved(id) &&
            entry.range &&
            RangeApi.includes(entry.range, location)
          ) {
            matched.add(id);
          }
        }
      }
      return Object.freeze(sortBySourceOrder(matched));
    },
    invalidateSources: () => {
      sourceRevision += 1;
      passiveViews = new WeakMap();
      passiveStored = null;
    },
    observePaint: (view, refresh) => {
      if (isDestroyed()) return () => {};
      const state = ensureObservedView(view);
      state.paintRefreshers.add(refresh);
      let subscribed = true;
      return () => {
        if (!subscribed) return;
        subscribed = false;
        state.paintRefreshers.delete(refresh);
        releaseObservedViewIfUnused(view, state);
      };
    },
    readPaintEntriesAt: (view, nodeKey) => {
      if (isDestroyed()) return [];
      const viewRoot = view.read.view.root();
      const index = getCurrentViewIndex(view, viewRoot);
      const ids = index.byKey.get(nodeKey);
      if (!ids || ids.size === 0) return [];
      const orderedIds = sortBySourceOrder(ids);
      const entries: Array<Readonly<{ id: string; range: Range }>> = [];
      for (const id of orderedIds) {
        if (isResolved(id)) continue;
        const entry = index.entries.get(id);
        if (entry && entry.root === viewRoot && entry.range) {
          entries.push({ id, range: entry.range });
        }
      }
      return entries;
    },
    refreshIds: (ids) => {
      for (const [view, state] of [...observedViews]) {
        if (observedViews.get(view) !== state || !state.paintRefreshers.size) {
          continue;
        }
        const viewRoot = view.read.view.root();
        const index = getCurrentViewIndex(view, viewRoot);
        const nodeKeys = new Set<NodeKey>();
        for (const id of ids) {
          const entry = index.entries.get(id);
          if (entry && entry.root === viewRoot && entry.range) {
            for (const key of entry.keys) nodeKeys.add(key);
          }
        }
        if (nodeKeys.size) {
          deliver(state.paintRefreshers, 'commit-listener', {
            nodeKeys: [...nodeKeys],
          });
        }
      }
    },
    refreshViews: (ids) =>
      runHeld(() => {
        if (observedViews.size > 0) {
          const fullReload = ids === undefined;
          const previousPaintKeysByView = fullReload
            ? new Map(
                [...observedViews]
                  .filter(([, state]) => state.paintRefreshers.size > 0)
                  .map(([view, state]) => {
                    const viewRoot = view.read.view.root();
                    const { entries } = state.projected ?? storedIndex;
                    const keys = new Set<NodeKey>();
                    entries.forEach((entry) => {
                      if (entry.root === viewRoot) {
                        for (const key of entry.keys) keys.add(key);
                      }
                    });
                    return [view, keys] as const;
                  })
              )
            : null;
          syncObservedViews(reindexStored(ids), 'external', !fullReload, ids);
          if (previousPaintKeysByView) {
            previousPaintKeysByView.forEach((keys, view) => {
              const state = observedViews.get(view);
              if (!state || !state.paintRefreshers.size) return;
              const viewRoot = view.read.view.root();
              const { entries } = state.projected ?? storedIndex;
              entries.forEach((entry) => {
                if (entry.root === viewRoot) {
                  for (const key of entry.keys) keys.add(key);
                }
              });
              announcePaint(view, state, keys);
            });
          }
        }
      }),
    subscribeAttachments: (view, listener) => {
      if (isDestroyed()) return () => {};
      const state = ensureObservedView(view);
      if (
        state.attachmentListeners.size === 0 &&
        state.projected &&
        view.read.view.root() === undefined &&
        hasNamedThreads()
      ) {
        state.rootTops = readNamedRootTops(view);
      }
      state.attachmentListeners.add(listener);
      let subscribed = true;
      return () => {
        if (!subscribed) return;
        subscribed = false;
        state.attachmentListeners.delete(listener);
        if (state.attachmentListeners.size === 0) {
          state.rootTops = null;
        }
        releaseObservedViewIfUnused(view, state);
      };
    },
  };
};
