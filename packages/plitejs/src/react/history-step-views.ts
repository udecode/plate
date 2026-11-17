import { defineUpdateAnnotation, type EditorCommit, type RootKey } from '..';
import {
  type EditorRuntimeCarrier,
  getEditorRuntime,
  getEditorRuntimeOwner,
} from '../core/editor-runtime';
import {
  type EditorHistoryEdge,
  readEditorCommitHistoryEntry,
} from '../core/public-state';
import { readRootTarget } from '../core/root-target';
import { getViewPresentation } from '../editor-runtime-view';
import type { Editor } from '../interfaces/editor';
import { MAIN_ROOT_KEY } from './root-key';
import type { PliteViewSelection } from './view-selection';

export const projectedHistoryRange = defineUpdateAnnotation<PliteViewSelection>(
  { key: 'react.projected-history-range' }
);

export type HistoryStepHop = Readonly<{ owner: string; slot: string }>;

/**
 * A view as model keys under the page that renders it, so the address
 * outlives the view object a remount replaces.
 */
export type HistoryStepSite = Readonly<{
  hops: readonly HistoryStepHop[];
  page: symbol;
  root: RootKey;
}>;

export type HistoryStepSites = Readonly<{
  after: HistoryStepSite | null;
  before: HistoryStepSite | null;
}>;

export type HistoryStepSlot = Readonly<{
  nodeSelectionFocus: boolean;
  owner: string;
  parent: Editor;
  renderedBy: object | null;
  slot: string;
}>;

type ViewKey = object;

type HistoryStepViews = Readonly<{
  paneOf: (view: Editor) => object | null;
  records: WeakMap<object, HistoryStepSites>;
  roots: WeakMap<ViewKey, RootKey>;
  slots: WeakMap<ViewKey, HistoryStepSlot>;
}>;

// Core credits an update to the view inside the React view editor a provider
// registers. Both share one runtime, so the runtime is the key.
const keyOf = (view: Editor): ViewKey => getEditorRuntime(view);

// Kept after a view unmounts, so a commit observer that runs before the
// recorder and unmounts the view does not cost the record its site.
const VIEW_STEP_VIEWS = new WeakMap<ViewKey, HistoryStepViews>();

const PAGES = new WeakMap<object, symbol>();

export const historyStepPageOf = (pane: object) => {
  const page = PAGES.get(pane) ?? Symbol('history step page');

  PAGES.set(pane, page);
  return page;
};

const UNDO_RANGES = new WeakMap<object, PliteViewSelection>();
const RANGE_WATCHED = new WeakSet<Editor>();

/**
 * Records the projected range of every pushed step, keyed by its history
 * entry. A projected command runs it before its update, so the range comes
 * back on undo with no provider mounted.
 */
export const watchProjectedHistoryRanges = (editor: EditorRuntimeCarrier) => {
  const owner = getEditorRuntimeOwner(editor);

  if (RANGE_WATCHED.has(owner)) return;
  RANGE_WATCHED.add(owner);
  owner.subscribeCommit((commit) => {
    const range = commit.annotations[projectedHistoryRange.key] as
      | PliteViewSelection
      | undefined;
    const step = range ? readEditorCommitHistoryEntry(owner, commit) : null;

    if (range && step?.how === 'push') UNDO_RANGES.set(step.entry, range);
  });
};

export const readHistoryStepUndoRange = (entry: object) =>
  UNDO_RANGES.get(entry) ?? null;

const addressOf = (
  views: HistoryStepViews,
  view: Editor
): HistoryStepSite | null => {
  const key = keyOf(view);
  const root = views.roots.get(key);

  if (root === undefined) return null;

  const slot = views.slots.get(key);

  if (!slot) {
    const pane = views.paneOf(view);

    return pane ? { hops: [], page: historyStepPageOf(pane), root } : null;
  }

  const hop = { owner: slot.owner, slot: slot.slot };

  if (!views.slots.has(keyOf(slot.parent))) {
    return slot.renderedBy
      ? { hops: [hop], page: historyStepPageOf(slot.renderedBy), root }
      : null;
  }

  const parent = addressOf(views, slot.parent);

  return parent
    ? { hops: [...parent.hops, hop], page: parent.page, root }
    : null;
};

const recordCommit = (
  runtime: Editor,
  views: HistoryStepViews,
  commit: EditorCommit
) => {
  const step = readEditorCommitHistoryEntry(runtime, commit);

  if (!step || VIEW_STEP_VIEWS.get(keyOf(step.made)) !== views) return;

  const spansViews =
    commit.annotations[projectedHistoryRange.key] !== undefined;
  const siteOf = ({ root: named, selection }: EditorHistoryEdge) => {
    if (!selection || spansViews) return null;

    const root = named ?? MAIN_ROOT_KEY;

    if (views.roots.get(keyOf(step.made)) === root) {
      return addressOf(views, step.made);
    }

    const target = readRootTarget(
      getEditorRuntimeOwner(runtime),
      getViewPresentation(step.made),
      root
    );

    return target ? addressOf(views, target.view) : null;
  };
  const after = siteOf(step.after);

  if (step.how === 'push') {
    views.records.set(step.entry, { after, before: siteOf(step.before) });
    return;
  }

  const previous = views.records.get(step.entry);

  if (previous && after) {
    views.records.set(step.entry, { after, before: previous.before });
  }
};

/**
 * One provider's record of the view each history step edge was made in. Only
 * the provider that registered the view an update ran in records its commit,
 * so a second provider of the same editor never erases the first one's.
 */
export const createHistoryStepViews = (
  runtime: Editor,
  paneOf: (view: Editor) => object | null
) => {
  const views: HistoryStepViews = {
    paneOf,
    records: new WeakMap(),
    roots: new WeakMap(),
    slots: new WeakMap(),
  };

  return Object.freeze({
    registerSlot: (view: Editor, slot: HistoryStepSlot) => {
      views.slots.set(keyOf(view), slot);
    },
    registerView: (view: Editor, root: RootKey) => {
      const key = keyOf(view);

      VIEW_STEP_VIEWS.set(key, views);
      views.roots.set(key, root);
    },
    subscribe: () => {
      watchProjectedHistoryRanges(runtime);

      return runtime.subscribeCommit((commit) => {
        recordCommit(runtime, views, commit);
      });
    },
  });
};

export const readHistoryStepSites = (view: Editor, entry: object) =>
  VIEW_STEP_VIEWS.get(keyOf(view))?.records.get(entry) ?? null;
