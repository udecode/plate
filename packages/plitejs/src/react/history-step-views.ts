import {
  defineUpdateAnnotation,
  type EditorCommit,
  ElementApi,
  type NodeKey,
  type RootKey,
} from '..';
import {
  type EditorRuntimeCarrier,
  getEditorRuntime,
  getEditorRuntimeOwner,
} from '../core/editor-runtime';
import {
  type EditorHistoryEdge,
  readEditorCommitHistoryEntry,
} from '../core/public-state';
import { readRootContentTarget } from '../core/root-target';
import { containsShadowAware } from '../dom';
import { findEditorDOMRootRuntime } from '../dom/internal';
import { focusedElementOnPage } from '../dom/plugin/dom-root-runtime';
import { getViewPresentation } from '../editor-runtime-view';
import type { Editor } from '../interfaces/editor';
import type { EditableDOMRuntime } from './editable/editable-dom-runtime';
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
  renderedBy: EditableDOMRuntime | null;
  slot: string;
}>;

export type HistoryStepPlace = Readonly<{
  focusOwned: boolean;
  page: EditableDOMRuntime;
  site: HistoryStepSite;
}>;

export type HistoryStepTarget =
  | Readonly<{ focusOwned: boolean; kind: 'mounted'; pane: EditableDOMRuntime }>
  | Readonly<{ focusOwned: boolean; kind: 'rebinding' }>
  | null;

type ViewKey = object;

type HistoryStepViews = Readonly<{
  panes: Map<ViewKey, Set<EditableDOMRuntime>>;
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

const paneOf = (views: HistoryStepViews, view: Editor) => {
  const panes = [...(views.panes.get(keyOf(view)) ?? [])];
  const mounting = panes.filter((pane) => !pane.connected);

  if (mounting.length === 1) return mounting[0];

  const holders = panes.filter((pane) => {
    const root = pane.rootElement;

    return !!root && containsShadowAware(root, focusedElementOnPage(root));
  });

  if (holders.length === 1) return holders[0];

  const active = panes[0] && findEditorDOMRootRuntime(panes[0].editor);

  return (
    (holders.length > 1 ? holders : panes).find(
      (pane) => !!active && pane.rootElement === active.rootRef.current
    ) ?? null
  );
};

const placeOf = (
  views: HistoryStepViews,
  view: Editor,
  pane: EditableDOMRuntime | null
): HistoryStepPlace | null => {
  const key = keyOf(view);
  const root = views.roots.get(key);

  if (root === undefined) return null;

  const slot = views.slots.get(key);

  if (!slot) {
    const page = pane ?? paneOf(views, view);

    return page
      ? {
          focusOwned: false,
          page,
          site: { hops: [], page: page.historyStepPage, root },
        }
      : null;
  }

  const hop = { owner: slot.owner, slot: slot.slot };

  if (!views.slots.has(keyOf(slot.parent))) {
    return slot.renderedBy
      ? {
          focusOwned: slot.nodeSelectionFocus,
          page: slot.renderedBy,
          site: {
            hops: [hop],
            page: slot.renderedBy.historyStepPage,
            root,
          },
        }
      : null;
  }

  const parent = placeOf(views, slot.parent, null);

  return parent
    ? {
        focusOwned: parent.focusOwned || slot.nodeSelectionFocus,
        page: parent.page,
        site: {
          hops: [...parent.site.hops, hop],
          page: parent.site.page,
          root,
        },
      }
    : null;
};

const isAt = (place: HistoryStepPlace, site: HistoryStepSite) =>
  place.site.page === site.page &&
  place.site.hops.length === site.hops.length &&
  place.site.hops.every(
    (hop, index) =>
      hop.owner === site.hops[index]?.owner &&
      hop.slot === site.hops[index]?.slot
  );

const slotBindsRoot = (slot: HistoryStepSlot, root: RootKey) => {
  const [owner] = slot.parent.read.nodes.get(slot.owner as NodeKey) ?? [];
  const childRoots = owner && ElementApi.isElement(owner) && owner.childRoots;

  return (
    typeof childRoots === 'object' &&
    childRoots !== null &&
    Reflect.get(childRoots, slot.slot) === root
  );
};

const viewsAt = (views: HistoryStepViews, site: HistoryStepSite) => {
  const last = site.hops.at(-1);
  const atSite: Array<NonNullable<HistoryStepTarget>> = [];
  let rebinding: HistoryStepTarget = null;

  for (const panes of views.panes.values()) {
    for (const pane of panes) {
      const slot = views.slots.get(keyOf(pane.editor));

      if (
        last
          ? slot?.owner !== last.owner || slot.slot !== last.slot
          : slot !== undefined
      ) {
        continue;
      }

      const place = placeOf(views, pane.editor, pane);

      if (!place?.page.connected || !pane.connected || !isAt(place, site)) {
        continue;
      }
      if (place.site.root === site.root) {
        atSite.push({ focusOwned: place.focusOwned, kind: 'mounted', pane });
      } else if (slot && slotBindsRoot(slot, site.root)) {
        rebinding = { focusOwned: place.focusOwned, kind: 'rebinding' };
      }
    }
  }

  return { atSite, rebinding };
};

const rendersAtMostOnce = (views: HistoryStepViews, site: HistoryStepSite) =>
  viewsAt(views, site).atSite.length < 2;

const resolve = (
  views: HistoryStepViews,
  site: HistoryStepSite
): HistoryStepTarget => {
  const { atSite, rebinding } = viewsAt(views, site);

  if (atSite.length === 0) return rebinding;
  return atSite.length === 1 ? atSite[0] : null;
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

    const target =
      views.roots.get(keyOf(step.made)) === root
        ? step.made
        : readRootContentTarget(
            getEditorRuntimeOwner(runtime),
            getViewPresentation(step.made),
            root
          )?.view;

    const site = target ? (placeOf(views, target, null)?.site ?? null) : null;

    return site && rendersAtMostOnce(views, site) ? site : null;
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
export const createHistoryStepViews = (runtime: Editor) => {
  const views: HistoryStepViews = {
    panes: new Map(),
    records: new WeakMap(),
    roots: new WeakMap(),
    slots: new WeakMap(),
  };

  return Object.freeze({
    placeOf: (pane: EditableDOMRuntime) => placeOf(views, pane.editor, pane),
    registerPane: (pane: EditableDOMRuntime) => {
      const key = keyOf(pane.editor);
      const panes = views.panes.get(key) ?? new Set();

      panes.add(pane);
      views.panes.set(key, panes);

      return () => {
        panes.delete(pane);
        if (panes.size === 0 && views.panes.get(key) === panes) {
          views.panes.delete(key);
        }
      };
    },
    registerSlot: (view: Editor, slot: HistoryStepSlot) => {
      views.slots.set(keyOf(view), slot);
    },
    registerView: (view: Editor, root: RootKey) => {
      const key = keyOf(view);

      VIEW_STEP_VIEWS.set(key, views);
      views.roots.set(key, root);
    },
    resolve: (site: HistoryStepSite) => resolve(views, site),
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
