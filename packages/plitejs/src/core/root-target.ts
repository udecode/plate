import type { Editor, RootKey } from '../interfaces/editor';
import { getEditorRuntime } from './editor-runtime';
import { notifyObservers } from './lifecycle-error';
import { subscribeEditorViewState } from './public-state';
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
  owner: Editor;
  presentation: ViewPresentation;
  stale: boolean;
  subscribers: Set<Subscriber>;
  usedLatestFirst: Editor[];
  views: Set<Editor>;
};

type Notice = {
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
const USED_AT = new WeakMap<object, number>();
const USE_LISTENERS = new WeakMap<object, Set<() => void>>();
let lastUse = 0;
const PENDING = new Set<Entry>();
const NOTICES = new WeakMap<ViewPresentation, Notice>();

const noticeOf = (presentation: ViewPresentation) => {
  let notice = NOTICES.get(presentation);

  if (!notice) {
    notice = {
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
    for (const listener of [...notice.listeners]) listener();
  });
};

const announcePresentation = (presentation: ViewPresentation) => {
  const notice = noticeOf(presentation);

  notice.revision += 1;
  notifyOncePerMicrotask(notice);
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

const pickTarget = ({ usedLatestFirst, views }: Entry): RootTarget | null => {
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
    const next = pickTarget(entry);

    if (!isSameTarget(next, entry.answer)) entry.answer = next;

    entry.stale = false;
  }

  return entry.answer;
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

export const readRootViewUse = (view: Editor) =>
  USED_AT.get(getEditorRuntime(view)) ?? 0;

export const subscribeRootViewUse = (view: Editor, listener: () => void) => {
  const runtime = getEditorRuntime(view);
  const listeners = USE_LISTENERS.get(runtime) ?? new Set<() => void>();

  USE_LISTENERS.set(runtime, listeners);
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
  if (USED_AT.has(runtime)) {
    entry.usedLatestFirst = [...entry.usedLatestFirst, view].sort(
      (left, right) => readRootViewUse(right) - readRootViewUse(left)
    );
  }
  invalidate(entry);
  announcePresentation(presentation);

  return () => {
    stopReadOnly();
    entry.views.delete(view);
    entry.usedLatestFirst = entry.usedLatestFirst.filter(
      (used) => used !== view
    );
    if (VIEW_ENTRIES.get(runtime) === entry) VIEW_ENTRIES.delete(runtime);

    invalidate(entry);
    announcePresentation(presentation);
    dropUnusedEntry(key, entry);
  };
};

export const markRootViewUsed = (view: Editor) => {
  const runtime = getEditorRuntime(view);
  const entry = VIEW_ENTRIES.get(runtime);

  USED_AT.set(runtime, (lastUse += 1));
  if (entry?.views.has(view) && entry.usedLatestFirst[0] !== view) {
    entry.usedLatestFirst = [
      view,
      ...entry.usedLatestFirst.filter((used) => used !== view),
    ];
    invalidate(entry);
  }
  if (entry?.views.has(view)) {
    const notice = noticeOf(entry.presentation);

    if (notice.latestUsed !== view) {
      notice.latestUsed = view;
      announcePresentation(entry.presentation);
    }
  }
  notifyObservers(
    view,
    USE_LISTENERS.get(runtime),
    'commit-listener',
    (listener) => listener()
  );
};

export const reportShownChange = <T>(view: Editor, change: () => T): T => {
  const runtime = getEditorRuntime(view);
  const wasShown = runtime.hasSurface?.() ?? false;
  const result = change();

  if ((runtime.hasSurface?.() ?? false) !== wasShown) {
    const entry = VIEW_ENTRIES.get(runtime);

    invalidate(entry);
    if (entry) announcePresentation(entry.presentation);
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

/**
 * Hear, once per microtask, that a view of the presentation mounted,
 * unmounted, gained or lost its surface, changed its read-only state, or that
 * the user used another of its views.
 */
export const subscribeRootViewPresentation = (
  presentation: ViewPresentation,
  listener: () => void
) => {
  const { listeners } = noticeOf(presentation);

  listeners.add(listener);

  return () => {
    listeners.delete(listener);
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
      (!latest || readRootViewUse(view) > readRootViewUse(latest))
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
        (!latest || readRootViewUse(view) > readRootViewUse(latest))
      ) {
        latest = view;
      }
    }
  }

  return { shown, view: latest };
};
