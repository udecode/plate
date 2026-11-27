import {
  defineUpdateAnnotation,
  type Descendant,
  type EditorCommit,
  type Element,
  ElementApi,
  type NodeKey,
  type Path,
  RangeApi,
  type RootKey,
  type Selection,
  SelectionApi,
  TextApi,
} from '..';
import { getInternalDocumentChangeRootKeys } from '../core/change/document-change';
import { getEditorCommitSnapshot } from '../core/commit';
import {
  type EditorRuntimeCarrier,
  getEditorRuntime,
  getEditorRuntimeOwner,
} from '../core/editor-runtime';
import { toPublicRoot } from '../core/public-root';
import {
  type EditorHistoryEdge,
  getEditorDocumentRoots,
  getEditorDocumentValue,
  getLiveNode,
  getNodeKey,
  getPathByNodeKey,
  readEditorCommitHistoryEntry,
  withEditorRootChildren,
} from '../core/public-state';
import { readRootContentTarget } from '../core/root-target';
import {
  isValidEditorSelection,
  withLandedMarks,
} from '../core/selection-protocol';
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

export type HistoryStepHop = Readonly<{
  owner: string;
  root: RootKey;
  slot: string;
}>;

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
  afterSelection?: NonNullable<Selection> | null;
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
  | Readonly<{
      focusOwned: boolean;
      kind: 'rebinding';
      pane: EditableDOMRuntime;
    }>
  | null;

type ViewKey = object;

type HistoryStepViews = Readonly<{
  paneListeners: Set<() => void>;
  paneNotify: { pending: boolean };
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

  const hop = { owner: slot.owner, root, slot: slot.slot };

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

const matchesPrefix = (
  place: HistoryStepPlace,
  site: HistoryStepSite,
  count: number
) =>
  place.site.page === site.page &&
  place.site.hops.length === count &&
  place.site.hops.every(
    (hop, index) =>
      hop.owner === site.hops[index]?.owner &&
      hop.slot === site.hops[index]?.slot &&
      (index === count - 1 || hop.root === site.hops[index]?.root)
  );

const readChildRoot = (node: unknown, slot: string): RootKey | null => {
  const childRoots =
    node && ElementApi.isElement(node) ? node.childRoots : null;
  const bound =
    typeof childRoots === 'object' && childRoots !== null
      ? Reflect.get(childRoots, slot)
      : null;

  return typeof bound === 'string' ? bound : null;
};

const slotBindsRoot = (slot: HistoryStepSlot, root: RootKey) => {
  const [owner] = slot.parent.read.nodes.get(slot.owner as NodeKey) ?? [];

  return readChildRoot(owner, slot.slot) === root;
};

const viewsAt = (views: HistoryStepViews, site: HistoryStepSite) => {
  const atSite: Array<NonNullable<HistoryStepTarget>> = [];
  let rebindingPane: EditableDOMRuntime | null = null;
  let rebindingCount = 0;
  let rebindingFocusOwned = false;
  const depth = site.hops.length;

  for (const panes of views.panes.values()) {
    for (const pane of panes) {
      const slot = views.slots.get(keyOf(pane.editor));

      if (depth === 0) {
        if (slot !== undefined) continue;
      } else if (
        !slot ||
        !site.hops.some(
          (hop) => hop.owner === slot.owner && hop.slot === slot.slot
        )
      ) {
        continue;
      }

      const place = placeOf(views, pane.editor, pane);

      if (!place?.page.connected || !pane.connected) continue;

      const placeDepth = place.site.hops.length;

      if (
        placeDepth === depth &&
        matchesPrefix(place, site, depth) &&
        place.site.root === site.root
      ) {
        atSite.push({ focusOwned: place.focusOwned, kind: 'mounted', pane });
      } else if (
        slot &&
        placeDepth > 0 &&
        placeDepth <= depth &&
        matchesPrefix(place, site, placeDepth)
      ) {
        const targetRoot = site.hops[placeDepth - 1]?.root;

        if (
          targetRoot !== undefined &&
          place.site.root !== targetRoot &&
          slotBindsRoot(slot, targetRoot)
        ) {
          rebindingPane ??= pane;
          rebindingCount += 1;
          rebindingFocusOwned ||= place.focusOwned;
        }
      }
    }
  }

  return {
    atSite,
    rebinding:
      rebindingCount === 1 && rebindingPane
        ? ({
            focusOwned: rebindingFocusOwned,
            kind: 'rebinding',
            pane: rebindingPane,
          } as const)
        : null,
  };
};

const isSiteBound = (
  views: HistoryStepViews,
  runtime: Editor,
  site: HistoryStepSite
) => {
  if (site.hops.length === 0) return false;

  const pageRoot = pageRootOf(views, site.page);

  if (pageRoot === undefined || viewsAt(views, site).atSite.length > 1) {
    return false;
  }

  for (const panes of views.panes.values()) {
    for (const pane of panes) {
      if (!pane.connected) continue;

      const place = placeOf(views, pane.editor, pane);

      if (
        place?.focusOwned &&
        place.site.hops.length > 0 &&
        place.site.hops.length <= site.hops.length &&
        matchesPrefix(place, site, place.site.hops.length)
      ) {
        return false;
      }
    }
  }

  const owner = getEditorRuntimeOwner(runtime);
  let currentRoot = pageRoot;

  for (const hop of site.hops) {
    const entry = readNodeEntryInRoot(owner, currentRoot, hop.owner as NodeKey);

    if (!entry || readChildRoot(entry.node, hop.slot) !== hop.root) {
      return false;
    }
    currentRoot = hop.root;
  }

  return true;
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

const nodeAtPath = (
  children: readonly Descendant[] | undefined,
  path: Path
): Descendant | undefined => {
  let node: Descendant | undefined;
  let nodes = children;

  for (const index of path) {
    node = nodes?.[index];
    nodes = node && ElementApi.isElement(node) ? node.children : undefined;
  }

  return node;
};

const readNodeEntryInRoot = (
  owner: Editor,
  root: RootKey,
  at: NodeKey | Path
): Readonly<{ key: NodeKey; node: Element; path: Path }> | null => {
  if (!Object.hasOwn(getEditorDocumentRoots(owner), root)) return null;

  return withEditorRootChildren(owner, root, () => {
    const path = typeof at === 'string' ? getPathByNodeKey(owner, at) : at;

    if (!path) return null;

    const node = getLiveNode(owner, path);
    const key = typeof at === 'string' ? at : getNodeKey(owner, path);

    return key && node && ElementApi.isElement(node)
      ? { key, node, path }
      : null;
  });
};

const sameNodeKind = (left: Descendant, right: Descendant) =>
  ElementApi.isElement(left)
    ? ElementApi.isElement(right) && left.type === right.type
    : TextApi.isText(right);

const samePathSiblingShape = (
  beforeChildren: readonly Descendant[],
  afterChildren: readonly Descendant[],
  path: Path
) => {
  let beforeNodes: readonly Descendant[] | undefined = beforeChildren;
  let afterNodes: readonly Descendant[] | undefined = afterChildren;

  for (const index of path) {
    if (
      !beforeNodes ||
      !afterNodes ||
      beforeNodes.length !== afterNodes.length
    ) {
      return false;
    }

    for (let i = 0; i < beforeNodes.length; i += 1) {
      const left = beforeNodes[i];
      const right = afterNodes[i];

      if (!left || !right || !sameNodeKind(left, right)) return false;
    }

    const beforeNext: Descendant | undefined = beforeNodes[index];
    const afterNext: Descendant | undefined = afterNodes[index];

    beforeNodes =
      beforeNext && ElementApi.isElement(beforeNext)
        ? beforeNext.children
        : undefined;
    afterNodes =
      afterNext && ElementApi.isElement(afterNext)
        ? afterNext.children
        : undefined;
  }

  return true;
};

const readBeforeNodeInRoot = (
  commit: EditorCommit,
  root: RootKey,
  key: NodeKey
): Readonly<{
  children: readonly Descendant[];
  node: Element;
  path: Path;
}> | null => {
  const snapshot = getEditorCommitSnapshot(commit, root, 'before');
  const path = snapshot.index.pathOf(key);
  const node = path ? nodeAtPath(snapshot.children, path) : undefined;

  return path && node && ElementApi.isElement(node)
    ? { children: snapshot.children, node, path }
    : null;
};

const retargetSelectionInRoot = (
  owner: Editor,
  targetRoot: RootKey,
  selection: NonNullable<Selection>
): NonNullable<Selection> | null => {
  if (!Object.hasOwn(getEditorDocumentRoots(owner), targetRoot)) return null;

  const publicRoot = toPublicRoot(targetRoot);
  let candidate: NonNullable<Selection> | null = null;

  withEditorRootChildren(owner, targetRoot, () => {
    if (SelectionApi.isNode(selection)) {
      if (
        selection.paths.length === 0 ||
        !selection.paths.every((path) => getLiveNode(owner, path)) ||
        !getLiveNode(owner, selection.anchorPath) ||
        !getLiveNode(owner, selection.focusPath)
      ) {
        return;
      }

      candidate = SelectionApi.nodes(selection.paths, {
        anchorPath: selection.anchorPath,
        focusPath: selection.focusPath,
        mode: selection.mode,
        ...(publicRoot ? { root: publicRoot } : {}),
      });
      return;
    }
    if (!RangeApi.isRange(selection)) return;

    const retargetPoint = (point: typeof selection.anchor) => {
      const node = getLiveNode(owner, point.path);

      return node && TextApi.isText(node) && point.offset <= node.text.length
        ? {
            offset: point.offset,
            path: point.path,
            ...(publicRoot ? { root: publicRoot } : {}),
          }
        : null;
    };
    const anchor = retargetPoint(selection.anchor);
    const focus = retargetPoint(selection.focus);

    if (!anchor || !focus) return;

    const raw = {
      anchor,
      focus,
      kind: 'text' as const,
      ...(selection.affinity ? { affinity: selection.affinity } : {}),
      ...(selection.marks ? { marks: selection.marks } : {}),
    };

    candidate =
      SelectionApi.isText(raw) && raw.marks
        ? withLandedMarks(owner, raw, getEditorDocumentValue(owner), targetRoot)
        : raw;
  });

  return candidate && isValidEditorSelection(owner, candidate)
    ? candidate
    : null;
};

const pageRootOf = (
  views: HistoryStepViews,
  page: symbol
): RootKey | undefined => {
  for (const panes of views.panes.values()) {
    for (const pane of panes) {
      if (pane.historyStepPage === page) {
        return views.roots.get(keyOf(pane.editor));
      }
    }
  }

  return undefined;
};

const followSiteAfterCommit = (
  runtime: Editor,
  commit: EditorCommit,
  before: HistoryStepSite,
  pageRoot: RootKey,
  afterEdge: EditorHistoryEdge
): Readonly<{
  selection: NonNullable<Selection> | null;
  site: HistoryStepSite;
}> | null => {
  if (!afterEdge.selection || before.hops.length === 0) return null;

  const owner = getEditorRuntimeOwner(runtime);
  const afterRoot = afterEdge.root ?? MAIN_ROOT_KEY;
  const createdRoots = new Set<RootKey>(commit.changes.createRoots);
  const changedRoots = new Set<RootKey>(
    getInternalDocumentChangeRootKeys(commit.changes)
  );
  let oldRoot = pageRoot;
  let currentRoot = pageRoot;
  let rebound = false;
  const nextHops: HistoryStepHop[] = [];

  for (let index = 0; index < before.hops.length; index += 1) {
    const hop = before.hops[index];
    const isLast = index === before.hops.length - 1;

    if (currentRoot === oldRoot && !changedRoots.has(currentRoot)) {
      nextHops.push(hop);
      oldRoot = hop.root;
      currentRoot = hop.root;
      continue;
    }

    let nextHop: HistoryStepHop | null = null;

    if (currentRoot === oldRoot) {
      const entry = readNodeEntryInRoot(
        owner,
        currentRoot,
        hop.owner as NodeKey
      );
      const nextRoot = entry ? readChildRoot(entry.node, hop.slot) : null;

      if (entry && nextRoot) {
        nextHop = { owner: entry.key, root: nextRoot, slot: hop.slot };
      }
    } else {
      const oldEntry = readBeforeNodeInRoot(
        commit,
        oldRoot,
        hop.owner as NodeKey
      );
      const afterChildren = getEditorDocumentRoots(owner)[currentRoot];
      const byPath =
        oldEntry &&
        afterChildren &&
        samePathSiblingShape(oldEntry.children, afterChildren, oldEntry.path)
          ? readNodeEntryInRoot(owner, currentRoot, oldEntry.path)
          : null;
      const byPathRoot =
        byPath && byPath.node.type === oldEntry?.node.type
          ? readChildRoot(byPath.node, hop.slot)
          : null;

      if (
        byPath &&
        byPathRoot &&
        (byPathRoot === hop.root ||
          createdRoots.has(byPathRoot) ||
          (isLast && byPathRoot === afterRoot)) &&
        (!isLast || afterRoot === before.root || byPathRoot === afterRoot)
      ) {
        nextHop = { owner: byPath.key, root: byPathRoot, slot: hop.slot };
      }
    }

    if (!nextHop) return null;
    if (nextHop.root !== hop.root) rebound = true;
    nextHops.push(nextHop);
    if (rebound && nextHop.root === afterRoot && afterRoot !== before.root) {
      return {
        selection: null,
        site: { hops: nextHops, page: before.page, root: afterRoot },
      };
    }
    oldRoot = hop.root;
    currentRoot = nextHop.root;
  }

  if (!rebound) return null;
  if (currentRoot === afterRoot) {
    return {
      selection: null,
      site: { hops: nextHops, page: before.page, root: afterRoot },
    };
  }
  if (
    afterRoot === before.root &&
    createdRoots.has(currentRoot) &&
    !commit.changed.hasAny('selection')
  ) {
    const selection = retargetSelectionInRoot(
      owner,
      currentRoot,
      afterEdge.selection
    );

    if (selection) {
      return {
        selection,
        site: { hops: nextHops, page: before.page, root: currentRoot },
      };
    }
  }

  return null;
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
  const placeOfEdge = ({ root: named, selection }: EditorHistoryEdge) => {
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

    const place = target ? placeOf(views, target, null) : null;

    return place && rendersAtMostOnce(views, place.site) ? place : null;
  };

  if (step.how === 'merge') {
    const previous = views.records.get(step.entry);

    if (!previous) return;
    if (previous.after && !spansViews) {
      const pageRoot = pageRootOf(views, previous.after.page);
      const followed =
        pageRoot !== undefined
          ? followSiteAfterCommit(
              runtime,
              commit,
              previous.after,
              pageRoot,
              step.after
            )
          : null;

      if (followed && rendersAtMostOnce(views, followed.site)) {
        views.records.set(step.entry, {
          after: followed.site,
          ...(followed.selection ? { afterSelection: followed.selection } : {}),
          before: previous.before,
        });
        return;
      }
      if (
        !commit.changed.hasAny('selection') &&
        views.roots.get(keyOf(step.made)) !== (step.after.root ?? MAIN_ROOT_KEY)
      ) {
        return;
      }
    }

    const after = placeOfEdge(step.after)?.site ?? null;

    if (after) {
      views.records.set(step.entry, { after, before: previous.before });
    }
    return;
  }

  const beforePlace = placeOfEdge(step.before);
  const pageRoot = beforePlace
    ? views.roots.get(keyOf(beforePlace.page.editor))
    : undefined;
  const followed =
    beforePlace && pageRoot !== undefined
      ? followSiteAfterCommit(
          runtime,
          commit,
          beforePlace.site,
          pageRoot,
          step.after
        )
      : null;
  const followedValid =
    followed && rendersAtMostOnce(views, followed.site) ? followed : null;
  const after = followedValid?.site ?? placeOfEdge(step.after)?.site ?? null;

  views.records.set(step.entry, {
    after,
    ...(followedValid?.selection
      ? { afterSelection: followedValid.selection }
      : {}),
    before: beforePlace?.site ?? null,
  });
};

const schedulePaneNotify = (views: HistoryStepViews) => {
  if (views.paneListeners.size === 0 || views.paneNotify.pending) return;
  views.paneNotify.pending = true;
  queueMicrotask(() => {
    views.paneNotify.pending = false;
    for (const listener of [...views.paneListeners]) {
      if (views.paneListeners.has(listener)) listener();
    }
  });
};

/**
 * One provider's record of the view each history step edge was made in. Only
 * the provider that registered the view an update ran in records its commit,
 * so a second provider of the same editor never erases the first one's.
 */
export const createHistoryStepViews = (runtime: Editor) => {
  const views: HistoryStepViews = {
    paneListeners: new Set(),
    paneNotify: { pending: false },
    panes: new Map(),
    records: new WeakMap(),
    roots: new WeakMap(),
    slots: new WeakMap(),
  };

  return Object.freeze({
    isSiteBound: (site: HistoryStepSite) => isSiteBound(views, runtime, site),
    placeOf: (pane: EditableDOMRuntime) => placeOf(views, pane.editor, pane),
    registerPane: (pane: EditableDOMRuntime) => {
      const key = keyOf(pane.editor);
      const panes = views.panes.get(key) ?? new Set();

      panes.add(pane);
      views.panes.set(key, panes);
      schedulePaneNotify(views);

      return () => {
        panes.delete(pane);
        if (panes.size === 0 && views.panes.get(key) === panes) {
          views.panes.delete(key);
        }
        schedulePaneNotify(views);
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
    subscribePanes: (listener: () => void) => {
      views.paneListeners.add(listener);

      return () => {
        views.paneListeners.delete(listener);
      };
    },
  });
};

export const readHistoryStepSites = (view: Editor, entry: object) =>
  VIEW_STEP_VIEWS.get(keyOf(view))?.records.get(entry) ?? null;
