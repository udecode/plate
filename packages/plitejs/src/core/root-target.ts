import { getViewPresentation } from '../editor-runtime-view';
import type { Editor, RootKey } from '../interfaces/editor';
import {
  getEditorRuntime,
  getEditorRuntimeOwner,
  type InternalEditorRuntime,
} from './editor-runtime';
import { notifyObservers } from './lifecycle-error';
import { getBaseCallRoot, subscribeEditorViewState } from './public-state';
import { getCaretOwner } from './view-carets';
import type { ViewPresentation } from './view-presentation';
import { countCoreWork } from './work';

export type RootTarget = Readonly<{ shown: boolean; view: Editor }>;

type Subscriber = {
  // Per subscriber: one that subscribes while a commit is half applied can read
  // a different answer than the subscribers before it.
  heard: RootTarget | null;
  listener: () => void;
};

type Entry = {
  answer: RootTarget | null;
  contentAnswer: RootTarget | null;
  contentStale: boolean;
  contentUsedLatestFirst: Editor[];
  owner: Editor;
  presentation: ViewPresentation;
  stale: boolean;
  subscribers: Set<Subscriber>;
  usedLatestFirst: Editor[];
  views: Set<Editor>;
};

type Notice = {
  latestContentAt: number;
  latestUsed: Editor | null;
  listeners: Set<() => void>;
  queued: boolean;
  revision: number;
};

type Key = readonly [
  owner: Editor,
  presentation: ViewPresentation,
  root: RootKey,
];

const ENTRIES = new WeakMap<
  Editor,
  Map<ViewPresentation, Map<RootKey, Entry>>
>();
// Keyed by view runtime, which a mounted React view editor shares with its view.
const VIEW_ENTRIES = new WeakMap<object, Entry>();
// Kept while the view is unmounted: a use can arrive before its view mounts,
// and StrictMode unmounts a view between its first use and its second mount.
// INTERACTION_USED_AT counts any press or focus in a view and orders the copy a
// control follows. CONTENT_USED_AT leaves out a press or focus on a control,
// such as a button or a slot's wrapper, so a control press inside a copy leaves
// the keyboard, input and history lookups on the copy that holds the caret.
const INTERACTION_USED_AT = new WeakMap<object, number>();
const CONTENT_USED_AT = new WeakMap<object, number>();
const USE_LISTENERS = new WeakMap<Editor, Set<() => void>>();
let lastUse = 0;
const PENDING = new Set<Entry>();
const NOTICES = new WeakMap<ViewPresentation, Notice>();

const noticeOf = (presentation: ViewPresentation) => {
  let notice = NOTICES.get(presentation);

  if (!notice) {
    notice = {
      latestContentAt: 0,
      latestUsed: null,
      listeners: new Set(),
      queued: false,
      revision: 0,
    };
    NOTICES.set(presentation, notice);
  }

  return notice;
};

const notifyOncePerMicrotask = (notice: Notice) => {
  if (notice.queued || notice.listeners.size === 0) return;

  notice.queued = true;
  queueMicrotask(() => {
    notice.queued = false;
    for (const listener of [...notice.listeners]) {
      if (notice.listeners.has(listener)) listener();
    }
  });
};

const announcePresentation = (presentation: ViewPresentation) => {
  const notice = noticeOf(presentation);

  notice.revision += 1;
  notifyOncePerMicrotask(notice);
};

const refreshPresentationLatestContent = (
  owner: Editor,
  presentation: ViewPresentation
) => {
  const notice = NOTICES.get(presentation);

  if (!notice) return;

  let latestUsed: Editor | null = null;
  let latestContentAt = 0;

  for (const entry of ENTRIES.get(owner)?.get(presentation)?.values() ?? []) {
    for (const view of entry.views) {
      const usedAt = readRootViewContentUse(view);

      if (usedAt > latestContentAt) {
        latestContentAt = usedAt;
        latestUsed = view;
      }
    }
  }

  notice.latestUsed = latestUsed;
  notice.latestContentAt = latestContentAt;
};

const recordPresentationContentUse = (
  presentation: ViewPresentation,
  view: Editor,
  forceAnnounce = false
) => {
  const notice = noticeOf(presentation);
  const usedAt = readRootViewContentUse(view);
  const becameNewest =
    usedAt > 0 &&
    usedAt >= notice.latestContentAt &&
    notice.latestUsed !== view;

  if (usedAt > 0 && usedAt >= notice.latestContentAt) {
    notice.latestContentAt = usedAt;
    notice.latestUsed = view;
  }
  if (becameNewest || forceAnnounce) announcePresentation(presentation);
};

const findEntry = ([owner, presentation, root]: Key) =>
  ENTRIES.get(owner)?.get(presentation)?.get(root);

const ensureEntry = (key: Key): Entry => {
  const found = findEntry(key);

  if (found) return found;

  const [owner, presentation, root] = key;
  const presentations = ENTRIES.get(owner) ?? new Map();
  const roots = presentations.get(presentation) ?? new Map();
  const entry: Entry = {
    answer: null,
    contentAnswer: null,
    contentStale: false,
    contentUsedLatestFirst: [],
    owner,
    presentation,
    stale: false,
    subscribers: new Set(),
    usedLatestFirst: [],
    views: new Set(),
  };

  ENTRIES.set(owner, presentations);
  presentations.set(presentation, roots);
  roots.set(root, entry);

  return entry;
};

const dropUnusedEntry = ([owner, presentation, root]: Key, entry: Entry) => {
  if (entry.views.size > 0 || entry.subscribers.size > 0) return;

  const presentations = ENTRIES.get(owner);
  const roots = presentations?.get(presentation);

  if (roots?.get(root) !== entry) return;

  roots.delete(root);
  if (roots.size === 0) presentations?.delete(presentation);
  if (presentations?.size === 0) ENTRIES.delete(owner);
};

const isShown = (view: Editor) => {
  countCoreWork('rootTargetChecks');

  return getEditorRuntime(view).hasSurface?.() ?? false;
};

const pickTarget = (
  usedLatestFirst: readonly Editor[],
  views: Iterable<Editor>
): RootTarget | null => {
  for (const view of usedLatestFirst) {
    if (isShown(view)) return { shown: true, view };
  }
  for (const view of views) {
    if (!usedLatestFirst.includes(view) && isShown(view)) {
      return { shown: true, view };
    }
  }

  const [view] = usedLatestFirst.length > 0 ? usedLatestFirst : views;

  return view ? { shown: false, view } : null;
};

const isSameTarget = (left: RootTarget | null, right: RootTarget | null) =>
  left === right ||
  (left !== null &&
    right !== null &&
    left.view === right.view &&
    left.shown === right.shown);

const readEntry = (entry: Entry) => {
  if (entry.stale) {
    const next = pickTarget(entry.usedLatestFirst, entry.views);

    if (!isSameTarget(next, entry.answer)) entry.answer = next;

    entry.stale = false;
  }

  return entry.answer;
};

const readContentEntry = (entry: Entry) => {
  if (entry.contentStale) {
    const next = pickTarget(entry.contentUsedLatestFirst, entry.views);

    if (!isSameTarget(next, entry.contentAnswer)) entry.contentAnswer = next;
    entry.contentStale = false;
  }
  return entry.contentAnswer;
};

const announce = () => {
  const entries = [...PENDING];

  PENDING.clear();

  for (const entry of entries) {
    const answer = readEntry(entry);

    notifyObservers(
      entry.owner,
      entry.subscribers,
      'commit-listener',
      (subscriber) => {
        if (isSameTarget(answer, subscriber.heard)) return;

        subscriber.heard = answer;
        subscriber.listener();
      }
    );
  }
};

// One microtask compares the answer after every change of a commit, so a view
// that loses and regains its surface in that commit wakes only a subscriber
// that joined while the surface was gone.
const invalidate = (entry: Entry | undefined) => {
  if (!entry) return;

  entry.stale = true;

  if (entry.subscribers.size === 0 || PENDING.has(entry)) return;

  PENDING.add(entry);
  if (PENDING.size === 1) queueMicrotask(announce);
};

export const flushRootTargets = () => {
  if (PENDING.size > 0) announce();
};

export const readRootViewUse = (view: Editor) =>
  INTERACTION_USED_AT.get(getEditorRuntime(view)) ?? 0;

export const readRootViewContentUse = (view: Editor) =>
  CONTENT_USED_AT.get(getEditorRuntime(view)) ?? 0;

export const isLatestPresentedContentView = (view: Editor) =>
  NOTICES.get(getViewPresentation(view))?.latestUsed === view;

/**
 * The newest use among the views the presentation shows, 0 while the user has
 * used none of them, and null while it shows none.
 */
export const readShownViewUse = (
  owner: Editor,
  presentation: ViewPresentation
): number | null => {
  let newest: number | null = null;

  for (const entry of ENTRIES.get(owner)?.get(presentation)?.values() ?? []) {
    for (const view of entry.views) {
      if (isShown(view)) newest = Math.max(newest ?? 0, readRootViewUse(view));
    }
  }

  return newest;
};

const tellViewUse = (owner: Editor) =>
  notifyObservers(
    owner,
    USE_LISTENERS.get(owner),
    'commit-listener',
    (listener) => listener()
  );

const moveToFront = (list: readonly Editor[], view: Editor) => [
  view,
  ...list.filter((used) => used !== view),
];

const placeByUse = (entry: Entry, view: Editor) => {
  const runtime = getEditorRuntime(view);

  if (INTERACTION_USED_AT.has(runtime)) {
    entry.usedLatestFirst = [
      ...entry.usedLatestFirst.filter((used) => used !== view),
      view,
    ].sort((left, right) => readRootViewUse(right) - readRootViewUse(left));
  }
  if (CONTENT_USED_AT.has(runtime)) {
    entry.contentUsedLatestFirst = [
      ...entry.contentUsedLatestFirst.filter((used) => used !== view),
      view,
    ].sort(
      (left, right) =>
        readRootViewContentUse(right) - readRootViewContentUse(left)
    );
  }
};

export const continueRootViewUse = (
  view: Editor,
  contentUsedAt: number,
  interactionUsedAt = contentUsedAt
) => {
  const runtime = getEditorRuntime(view);
  const entry = VIEW_ENTRIES.get(runtime);
  const nextInteractionAt = Math.max(contentUsedAt, interactionUsedAt);
  const contentChanged = contentUsedAt > (CONTENT_USED_AT.get(runtime) ?? 0);
  const interactionChanged =
    nextInteractionAt > (INTERACTION_USED_AT.get(runtime) ?? 0);

  if (!contentChanged && !interactionChanged) return;

  lastUse = Math.max(lastUse, contentUsedAt, nextInteractionAt);
  if (contentChanged) CONTENT_USED_AT.set(runtime, contentUsedAt);
  if (interactionChanged) INTERACTION_USED_AT.set(runtime, nextInteractionAt);
  if (entry?.views.has(view)) {
    placeByUse(entry, view);
    if (contentChanged) {
      entry.contentStale = true;
      recordPresentationContentUse(entry.presentation, view, true);
    }
    if (interactionChanged) invalidate(entry);
    tellViewUse(entry.owner);
  }
};

/**
 * Hear, in the same turn, each use of a view of the editor, and each of its
 * views that mounts, unmounts, or gains or loses its surface.
 */
export const subscribeShownViewUse = (owner: Editor, listener: () => void) => {
  const listeners = USE_LISTENERS.get(owner) ?? new Set<() => void>();

  USE_LISTENERS.set(owner, listeners);
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const mountRootView = (
  owner: Editor,
  presentation: ViewPresentation,
  root: RootKey,
  view: Editor
) => {
  const key: Key = [owner, presentation, root];
  const entry = ensureEntry(key);
  const runtime = getEditorRuntime(view);

  const stopReadOnly = subscribeEditorViewState(view, (change) => {
    if (change === 'readOnly') announcePresentation(presentation);
  });

  entry.views.add(view);
  VIEW_ENTRIES.set(runtime, entry);
  placeByUse(entry, view);
  entry.contentStale = true;
  invalidate(entry);
  recordPresentationContentUse(presentation, view, true);
  tellViewUse(owner);

  return () => {
    stopReadOnly();
    entry.views.delete(view);
    entry.usedLatestFirst = entry.usedLatestFirst.filter(
      (used) => used !== view
    );
    entry.contentUsedLatestFirst = entry.contentUsedLatestFirst.filter(
      (used) => used !== view
    );
    if (VIEW_ENTRIES.get(runtime) === entry) VIEW_ENTRIES.delete(runtime);

    const notice = NOTICES.get(presentation);
    if (notice?.latestUsed === view) {
      refreshPresentationLatestContent(owner, presentation);
    }

    entry.contentStale = true;
    invalidate(entry);
    announcePresentation(presentation);
    dropUnusedEntry(key, entry);
    tellViewUse(owner);
  };
};

export const markRootViewInteraction = (view: Editor) => {
  const runtime = getEditorRuntime(view);
  const entry = VIEW_ENTRIES.get(runtime);

  lastUse += 1;
  INTERACTION_USED_AT.set(runtime, lastUse);
  if (entry?.views.has(view) && entry.usedLatestFirst[0] !== view) {
    entry.usedLatestFirst = moveToFront(entry.usedLatestFirst, view);
    invalidate(entry);
  }
  tellViewUse(getEditorRuntimeOwner(view));
};

export const markRootViewUsed = (view: Editor) => {
  const runtime = getEditorRuntime(view);
  const entry = VIEW_ENTRIES.get(runtime);

  lastUse += 1;
  INTERACTION_USED_AT.set(runtime, lastUse);
  CONTENT_USED_AT.set(runtime, lastUse);
  if (entry?.views.has(view)) {
    if (entry.usedLatestFirst[0] !== view) {
      entry.usedLatestFirst = moveToFront(entry.usedLatestFirst, view);
      invalidate(entry);
    }
    if (entry.contentUsedLatestFirst[0] !== view) {
      entry.contentUsedLatestFirst = moveToFront(
        entry.contentUsedLatestFirst,
        view
      );
      entry.contentStale = true;
    }
    recordPresentationContentUse(entry.presentation, view);
  }
  tellViewUse(getEditorRuntimeOwner(view));
};

export const reportShownChange = <T>(view: Editor, change: () => T): T => {
  const runtime = getEditorRuntime(view);
  const wasShown = runtime.hasSurface?.() ?? false;
  const result = change();

  if ((runtime.hasSurface?.() ?? false) !== wasShown) {
    const entry = VIEW_ENTRIES.get(runtime);

    if (entry) entry.contentStale = true;
    invalidate(entry);
    if (entry) {
      announcePresentation(entry.presentation);
      tellViewUse(entry.owner);
    }
  }

  return result;
};

export const readRootTarget = (
  owner: Editor,
  presentation: ViewPresentation,
  root: RootKey
): RootTarget | null => {
  const entry = findEntry([owner, presentation, root]);

  return entry ? readEntry(entry) : null;
};

export const readRootContentTarget = (
  owner: Editor,
  presentation: ViewPresentation,
  root: RootKey
): RootTarget | null => {
  const entry = findEntry([owner, presentation, root]);

  return entry ? readContentEntry(entry) : null;
};

export const readNestedRootView = (
  owner: Editor,
  presentation: ViewPresentation,
  root: RootKey,
  mountedIn: Editor
): Editor | null => {
  const entry = findEntry([owner, presentation, root]);

  if (!entry) return null;

  if (entry.views.has(mountedIn) && isShown(mountedIn)) return mountedIn;

  const host = getEditorRuntime(mountedIn);
  const isNested = (view: Editor) => getEditorRuntime(view).mountedIn === host;

  return (
    pickTarget(
      entry.usedLatestFirst.filter(isNested),
      [...entry.views].filter(isNested)
    )?.view ?? null
  );
};

export const readCaretViewIn = <TView extends Editor>(
  area: TView
): TView | null => {
  const owner = getEditorRuntimeOwner(area);
  const caretOwner = getCaretOwner(owner);
  const target = readRootContentTarget(
    owner,
    caretOwner ? caretOwner.presentation : getViewPresentation(area),
    getBaseCallRoot(owner)
  );

  if (!target?.shown) return null;

  const host = getEditorRuntime(area);
  let runtime: InternalEditorRuntime | undefined = getEditorRuntime(
    target.view
  );

  while (runtime && runtime !== host) runtime = runtime.mountedIn;

  return runtime ? (target.view as TView) : null;
};

export const subscribeRootTarget = (
  owner: Editor,
  presentation: ViewPresentation,
  root: RootKey,
  listener: () => void
) => {
  const key: Key = [owner, presentation, root];
  const entry = ensureEntry(key);
  const subscriber: Subscriber = { heard: readEntry(entry), listener };

  entry.subscribers.add(subscriber);

  return () => {
    entry.subscribers.delete(subscriber);
    dropUnusedEntry(key, entry);
  };
};

export const readRootViewPresentationRevision = (
  presentation: ViewPresentation
) => NOTICES.get(presentation)?.revision ?? 0;

export const subscribeRootViewPresentation = (
  presentation: ViewPresentation,
  listener: () => void
) => {
  const { listeners } = noticeOf(presentation);
  const entry = () => listener();

  listeners.add(entry);

  return () => {
    listeners.delete(entry);
  };
};

const readViewState = (view: Editor): 'hidden' | 'read-only' | 'writable' => {
  countCoreWork('shownWritableViewChecks');

  if (!(getEditorRuntime(view).hasSurface?.() ?? false)) return 'hidden';

  return view.read.view.isReadOnly() ? 'read-only' : 'writable';
};

export type ShownWritableViews = Readonly<{
  shown: boolean;
  views: readonly Editor[];
}>;

export const readShownWritableRootViews = (
  owner: Editor,
  presentation: ViewPresentation,
  root: RootKey
): ShownWritableViews => {
  let shown = false;
  const views: Editor[] = [];

  for (const view of findEntry([owner, presentation, root])?.views ?? []) {
    const state = readViewState(view);

    if (state === 'hidden') continue;
    shown = true;
    if (state === 'writable') views.push(view);
  }

  return { shown, views };
};

export const readLatestShownWritableRootView = (
  owner: Editor,
  presentation: ViewPresentation,
  root: RootKey
): Editor | null => {
  let latest: Editor | null = null;

  for (const view of findEntry([owner, presentation, root])?.views ?? []) {
    if (
      readViewState(view) === 'writable' &&
      (!latest || readRootViewContentUse(view) > readRootViewContentUse(latest))
    ) {
      latest = view;
    }
  }

  return latest;
};

/**
 * The shown writable view of the presentation the user used most recently,
 * and whether the presentation shows any view.
 */
export const readLatestShownWritableView = (
  owner: Editor,
  presentation: ViewPresentation
): Readonly<{ shown: boolean; view: Editor | null }> => {
  let shown = false;
  let latest: Editor | null = null;

  for (const entry of ENTRIES.get(owner)?.get(presentation)?.values() ?? []) {
    for (const view of entry.views) {
      const state = readViewState(view);

      if (state === 'hidden') continue;
      shown = true;
      if (
        state === 'writable' &&
        (!latest ||
          readRootViewContentUse(view) > readRootViewContentUse(latest))
      ) {
        latest = view;
      }
    }
  }

  return { shown, view: latest };
};
