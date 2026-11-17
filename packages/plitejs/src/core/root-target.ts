import type { Editor, RootKey } from '../interfaces/editor';
import { getEditorRuntime } from './editor-runtime';
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
  stale: boolean;
  subscribers: Set<Subscriber>;
  usedLatestFirst: Editor[];
  views: Set<Editor>;
};

type Key = readonly [
  owner: object,
  presentation: ViewPresentation,
  root: RootKey,
];

const ENTRIES = new WeakMap<
  object,
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

    for (const subscriber of entry.subscribers) {
      if (isSameTarget(answer, subscriber.heard)) continue;

      subscriber.heard = answer;
      subscriber.listener();
    }
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
  owner: object,
  presentation: ViewPresentation,
  root: RootKey,
  view: Editor
) => {
  const key: Key = [owner, presentation, root];
  const entry = ensureEntry(key);
  const runtime = getEditorRuntime(view);

  entry.views.add(view);
  VIEW_ENTRIES.set(runtime, entry);
  if (USED_AT.has(runtime)) {
    entry.usedLatestFirst = [...entry.usedLatestFirst, view].sort(
      (left, right) => readRootViewUse(right) - readRootViewUse(left)
    );
  }
  invalidate(entry);

  return () => {
    entry.views.delete(view);
    entry.usedLatestFirst = entry.usedLatestFirst.filter(
      (used) => used !== view
    );
    if (VIEW_ENTRIES.get(runtime) === entry) VIEW_ENTRIES.delete(runtime);

    invalidate(entry);
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
  USE_LISTENERS.get(runtime)?.forEach((listener) => listener());
};

export const reportShownChange = <T>(view: Editor, change: () => T): T => {
  const runtime = getEditorRuntime(view);
  const wasShown = runtime.hasSurface?.() ?? false;
  const result = change();

  if ((runtime.hasSurface?.() ?? false) !== wasShown) {
    invalidate(VIEW_ENTRIES.get(runtime));
  }

  return result;
};

export const readRootTarget = (
  owner: object,
  presentation: ViewPresentation,
  root: RootKey
): RootTarget | null => {
  const entry = findEntry([owner, presentation, root]);

  return entry ? readEntry(entry) : null;
};

export const subscribeRootTarget = (
  owner: object,
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
