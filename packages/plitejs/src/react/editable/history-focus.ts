import {
  type EditorCommit,
  type Path,
  type RootKey,
  type Selection,
  SelectionApi,
} from '../..';
import { reportEditorLifecycleError } from '../../core/lifecycle-error';
import { getMutationVersion } from '../../core/public-state';
import { markRootViewUsed } from '../../core/root-target';
import { isValidEditorSelection } from '../../core/selection-protocol';
import { setSelectionAsView } from '../../core/view-carets';
import { focusedElementOnPage } from '../../dom/plugin/dom-root-runtime';
import {
  type HistoryStepPlace,
  type HistoryStepSite,
  type HistoryStepTarget,
  readHistoryStepSites,
} from '../history-step-views';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { MAIN_ROOT_KEY } from '../root-key';
import {
  isPliteViewSelectionCollapsed,
  readPliteViewSelection,
} from '../view-selection';
import { isElementDrawn } from './caret-engine';
import type {
  EditableDOMRuntime,
  EditableHistoryReplay,
} from './editable-dom-runtime';
import type { EditableRepairRequest } from './mutation-controller';
import { shouldForceRenderAfterModelOwnedHistory } from './mutation-history';
import {
  getEditorRuntimeOwner,
  getEditorSelectionRoot,
  getInternalDocumentChangeRootKeys,
  toInternalRoot,
} from './runtime-editor-api';
import { readRuntimeSelection } from './runtime-selection-state';

export type HistoryContentRootOwner = {
  childRoot: RootKey;
  ownerPath: Path;
  ownerRoot: RootKey;
};

export type HistoryFocusOwnerApi = {
  getActiveContentRootOwner?: (root: RootKey) => HistoryContentRootOwner | null;
  getContentRootOwnerViewEditor?: (
    owner: HistoryContentRootOwner
  ) => ReactRuntimeEditor | null;
  getMountedViewEditor?: (root: RootKey) => ReactRuntimeEditor | null;
  getWritableViewEditor?: (root: RootKey) => ReactRuntimeEditor | null;
};

export const resolveHistoryFocusEditor = ({
  currentRoot,
  editor,
  getActiveContentRootOwner,
  getContentRootOwnerViewEditor,
  getMountedViewEditor,
  getWritableViewEditor,
  historyRoot,
  selectionRoot,
}: HistoryFocusOwnerApi & {
  currentRoot?: RootKey | null;
  editor: ReactRuntimeEditor;
  historyRoot?: RootKey | null;
  selectionRoot?: RootKey | null;
}) => {
  const ownerOf = (root: RootKey) => {
    const owner = getActiveContentRootOwner?.(root);

    return owner?.childRoot === root ? owner : null;
  };
  const viewOf = (root: RootKey, owner: HistoryContentRootOwner | null) => {
    const view =
      (owner ? getContentRootOwnerViewEditor?.(owner) : null) ??
      getMountedViewEditor?.(root) ??
      editor;

    if (!getWritableViewEditor || view === editor) return view;

    return view.read.view.isReadOnly()
      ? (getWritableViewEditor(root) ?? editor)
      : view;
  };

  if (selectionRoot) return viewOf(selectionRoot, ownerOf(selectionRoot));
  if (!historyRoot) return viewOf(currentRoot ?? MAIN_ROOT_KEY, null);

  const historyOwner = ownerOf(historyRoot);

  if (historyOwner) return viewOf(historyRoot, historyOwner);

  const currentOwner = currentRoot ? ownerOf(currentRoot) : null;

  return viewOf(
    historyRoot,
    currentOwner?.ownerRoot === historyRoot ? currentOwner : null
  );
};

const getChangedRoot = (changes: EditorCommit['changes']): RootKey | null => {
  const createdOrDeleted = new Set<RootKey>([
    ...changes.createRoots,
    ...changes.deleteRoots,
  ]);
  const surviving = new Set(
    getInternalDocumentChangeRootKeys(changes).filter(
      (root) => !createdOrDeleted.has(root)
    )
  );
  const roots = surviving.size > 0 ? surviving : createdOrDeleted;

  return roots.size === 1 ? (roots.values().next().value ?? null) : null;
};

export const getModelOwnedHistoryFocusRepair = ({
  editor,
  getActiveContentRootOwner,
  getContentRootOwnerViewEditor,
  getMountedViewEditor,
  getWritableViewEditor,
  replayChanges,
}: {
  editor: ReactRuntimeEditor;
  replayChanges: EditorCommit['changes'] | null;
} & HistoryFocusOwnerApi): {
  focusEditor?: ReactRuntimeEditor;
  repair?: EditableRepairRequest;
} => {
  const shouldForceRender = shouldForceRenderAfterModelOwnedHistory(editor);
  const selectionRoot = readRuntimeSelection(getEditorRuntimeOwner(editor))
    ? getEditorSelectionRoot(editor)
    : null;
  const currentRoot = toInternalRoot(editor.read((state) => state.view.root()));
  const focusEditor = resolveHistoryFocusEditor({
    currentRoot,
    editor,
    getActiveContentRootOwner,
    getContentRootOwnerViewEditor,
    getMountedViewEditor,
    getWritableViewEditor,
    historyRoot: replayChanges ? getChangedRoot(replayChanges) : null,
    selectionRoot,
  });

  if (focusEditor !== editor) {
    return {
      focusEditor,
      repair: { forceRender: true, kind: 'force-render' },
    };
  }

  const viewSelection = readPliteViewSelection(editor);

  if (viewSelection && !isPliteViewSelectionCollapsed(viewSelection)) {
    return shouldForceRender
      ? { repair: { forceRender: true, kind: 'force-render' } }
      : {};
  }

  return {
    repair: {
      focus: true,
      forceRender: true,
      kind: 'repair-caret',
      selectionSourceTransition: {
        preferModelSelection: true,
        reason: 'model-command',
        selectionSource: 'model-owned',
      },
    },
  };
};

type HistoryFocusDecision =
  | Readonly<{ kind: 'keep' | 'restore' }>
  | Readonly<{
      kind: 'wait';
      selection: NonNullable<Selection>;
      site: HistoryStepSite;
    }>
  | Readonly<{
      kind: 'walk';
      pane: EditableDOMRuntime;
      selection: NonNullable<Selection>;
    }>;

const KEEP: HistoryFocusDecision = Object.freeze({ kind: 'keep' });
const RESTORE: HistoryFocusDecision = Object.freeze({ kind: 'restore' });

// `checkVisibility` catches a closed `<details>`, which leaves the computed
// styles of its content alone.
const isShown = (element: HTMLElement) =>
  !element.closest('[hidden], [inert]') &&
  (typeof element.checkVisibility !== 'function' ||
    element.checkVisibility()) &&
  isElementDrawn(element);

const hasReboundAncestor = (
  invoker: HistoryStepSite,
  site: HistoryStepSite
) => {
  const shared = Math.min(invoker.hops.length, site.hops.length);

  for (let index = 0; index < shared; index += 1) {
    const from = invoker.hops[index];
    const to = site.hops[index];

    if (from.owner !== to.owner || from.slot !== to.slot) return false;
    if (from.root !== to.root) return true;
  }

  return false;
};

const decideHistoryFocus = ({
  afterSelection,
  invoker,
  replay,
  resolve,
  site,
}: {
  afterSelection: NonNullable<Selection> | null;
  invoker: HistoryStepPlace | null;
  replay: EditableHistoryReplay;
  resolve: (site: HistoryStepSite) => HistoryStepTarget;
  site: HistoryStepSite | null;
}): HistoryFocusDecision => {
  const saved = replay.receipt.selection;

  if (replay.focusPolicy !== 'restore-root') return RESTORE;
  if (replay.origin === 'control') {
    return replay.runtime.externalText.holdsFocus() ? KEEP : RESTORE;
  }
  if (!site) return RESTORE;

  const selection =
    saved?.selection && saved.root === site.root
      ? saved.selection
      : replay.direction === 'redo' &&
          afterSelection &&
          replay.changes?.createRoots.has(site.root)
        ? afterSelection
        : null;

  if (!selection) return RESTORE;
  if (
    !invoker ||
    invoker.site.page !== site.page ||
    (invoker.site.root === site.root &&
      !hasReboundAncestor(invoker.site, site)) ||
    invoker.focusOwned
  ) {
    return RESTORE;
  }

  return decideTarget(resolve(site), site, selection);
};

const selectionFitsPane = (
  pane: EditableDOMRuntime,
  selection: NonNullable<Selection>
) =>
  toInternalRoot(SelectionApi.root(selection)) ===
    toInternalRoot(pane.editor.read((state) => state.view.root())) &&
  isValidEditorSelection(getEditorRuntimeOwner(pane.editor), selection);

const decideTarget = (
  target: HistoryStepTarget,
  site: HistoryStepSite,
  selection: NonNullable<Selection>
): HistoryFocusDecision => {
  if (!target || target.focusOwned) return RESTORE;
  if (target.kind === 'rebinding') {
    const element = target.pane.rootElement;

    return element && isShown(element)
      ? { kind: 'wait', selection, site }
      : RESTORE;
  }

  const { pane } = target;
  const element = pane.rootElement;

  return pane.connected &&
    element &&
    !pane.readOnly &&
    !pane.editor.read.view.isReadOnly() &&
    isShown(element) &&
    selectionFitsPane(pane, selection)
    ? { kind: 'walk', pane, selection }
    : RESTORE;
};

const walkHistoryFocus = (
  pane: EditableDOMRuntime,
  selection: NonNullable<Selection>
) => {
  const root = pane.rootElement;

  if (!root || !selectionFitsPane(pane, selection)) return false;

  const owner = getEditorRuntimeOwner(pane.editor);
  const before = focusedElementOnPage(root);
  const version = getMutationVersion(owner);

  if (before !== root) root.focus({ preventScroll: true });

  const focused = focusedElementOnPage(root);
  const refused = focused === before && focused !== root;
  const handlerEdited = getMutationVersion(owner) !== version;

  if (focused === root && !handlerEdited) {
    markRootViewUsed(pane.editor);
    setSelectionAsView(pane.editor, selection);
  }
  return !refused;
};

type HistoryFocusViews = Readonly<{
  isSiteBound: (site: HistoryStepSite) => boolean;
  placeOf: (pane: EditableDOMRuntime) => HistoryStepPlace | null;
  resolve: (site: HistoryStepSite) => HistoryStepTarget;
  subscribePanes: (listener: () => void) => () => void;
}>;

const WAITS = new WeakMap<HistoryFocusViews, () => void>();

const restoreHistoryFocus = (replay: EditableHistoryReplay) => {
  replay.runtime.restoreSelectionFocus(replay.focusPolicy, replay.changes);
};

const focusInvokingView = (
  replay: EditableHistoryReplay,
  invoker: HistoryStepPlace | null
) => {
  const view = replay.focusedView.connected
    ? replay.focusedView
    : invoker?.page;

  if (view?.connected) view.rootElement?.focus({ preventScroll: true });
};

const waitForRebindingSlot = (
  replay: EditableHistoryReplay,
  views: HistoryFocusViews,
  invoker: HistoryStepPlace | null,
  decision: Extract<HistoryFocusDecision, { kind: 'wait' }>
) => {
  const document =
    invoker?.page.rootElement?.ownerDocument ??
    replay.runtime.rootElement?.ownerDocument;

  if (!document) {
    restoreHistoryFocus(replay);
    return;
  }

  const owner = getEditorRuntimeOwner(replay.runtime.editor);
  const startVersion = getMutationVersion(owner);

  const close = () => {
    if (WAITS.get(views) === close) WAITS.delete(views);
    unsubscribePanes();
    unsubscribeCommits();
    document.removeEventListener('focusin', close, true);
    document.removeEventListener('keydown', close, true);
    document.removeEventListener('pointerdown', close, true);
  };
  const unsubscribeCommits = owner.subscribeCommit((commit) => {
    if (!commit.changed.hasAny('snapshot')) return;
    close();
    const pageRoot = invoker?.page.rootElement;
    if (
      !replay.focusedView.connected &&
      pageRoot &&
      focusedElementOnPage(pageRoot) === document.body
    ) {
      focusInvokingView(replay, invoker);
    }
  });
  const unsubscribePanes = views.subscribePanes(() => {
    try {
      if (views.placeOf(replay.focusedView)?.focusOwned) {
        close();
        restoreHistoryFocus(replay);
        return;
      }
      if (
        getMutationVersion(owner) !== startVersion ||
        (invoker && !invoker.page.connected)
      ) {
        close();
        return;
      }

      const resolved = views.resolve(decision.site);

      if (!resolved && views.isSiteBound(decision.site)) return;

      const next = decideTarget(resolved, decision.site, decision.selection);

      if (next.kind === 'wait') return;
      close();

      if (next.kind === 'walk') {
        if (!walkHistoryFocus(next.pane, next.selection)) {
          restoreHistoryFocus(replay);
        }
        return;
      }
      focusInvokingView(replay, invoker);
    } catch (error) {
      close();
      reportEditorLifecycleError({
        cause: error,
        direction: replay.direction,
        editor: replay.runtime.editor,
        phase: 'observer',
        source: 'history',
      });
    }
  });

  document.addEventListener('focusin', close, true);
  document.addEventListener('keydown', close, true);
  document.addEventListener('pointerdown', close, true);
  WAITS.set(views, close);
};

export const completeHistoryFocus = (
  replay: EditableHistoryReplay,
  views: HistoryFocusViews
) => {
  WAITS.get(views)?.();

  const sites = readHistoryStepSites(
    replay.runtime.editor,
    replay.receipt.group
  );
  const invoker = views.placeOf(replay.focusedView);
  const decision = decideHistoryFocus({
    afterSelection: sites?.afterSelection ?? null,
    invoker,
    replay,
    resolve: views.resolve,
    site: (replay.direction === 'undo' ? sites?.before : sites?.after) ?? null,
  });

  if (decision.kind === 'keep') {
    replay.runtime.externalText.focusSelection();
    return;
  }
  if (decision.kind === 'wait') {
    waitForRebindingSlot(replay, views, invoker, decision);
    return;
  }
  if (
    decision.kind === 'walk' &&
    walkHistoryFocus(decision.pane, decision.selection)
  ) {
    return;
  }
  restoreHistoryFocus(replay);
};
