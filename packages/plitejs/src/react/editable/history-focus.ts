import {
  type EditorCommit,
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
import { isElementDrawn } from './caret-engine';
import {
  type EditableDOMRuntime,
  type EditableHistoryReplay,
  getMountedEditableDOMRuntimes,
} from './editable-dom-runtime';
import {
  getEditorRuntimeOwner,
  getEditorSelectionRoot,
  getInternalDocumentChangeRootKeys,
  toInternalRoot,
} from './runtime-editor-api';
import { readRuntimeSelection } from './runtime-selection-state';

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

type HistoryFocusDecision =
  | Readonly<{ kind: 'keep'; runtime: EditableDOMRuntime }>
  | Readonly<{ kind: 'none' | 'restore' }>
  | Readonly<{
      kind: 'wait';
      mode: 'restore' | 'walk';
      selection: NonNullable<Selection> | null;
      site: HistoryStepSite;
    }>
  | Readonly<{
      kind: 'walk';
      pane: EditableDOMRuntime;
      selection: NonNullable<Selection>;
    }>;

const NONE: HistoryFocusDecision = Object.freeze({ kind: 'none' });
const RESTORE: HistoryFocusDecision = Object.freeze({ kind: 'restore' });

const findFocusedExternalTextRuntime = (
  replay: EditableHistoryReplay
): EditableDOMRuntime | null => {
  const owner = getEditorRuntimeOwner(
    replay.runtime.editor
  ) as ReactRuntimeEditor;
  const { presentation } = replay.runtime;
  const matchesScope = (runtime: EditableDOMRuntime) =>
    runtime.connected &&
    getEditorRuntimeOwner(runtime.editor) === owner &&
    (!presentation ||
      !runtime.presentation ||
      runtime.presentation === presentation);

  if (
    matchesScope(replay.focusedView) &&
    replay.focusedView.externalText.holdsFocus()
  ) {
    return replay.focusedView;
  }
  if (
    matchesScope(replay.runtime) &&
    replay.runtime.externalText.holdsFocus()
  ) {
    return replay.runtime;
  }

  for (const runtime of getMountedEditableDOMRuntimes(owner)) {
    if (matchesScope(runtime) && runtime.externalText.holdsFocus()) {
      return runtime;
    }
  }

  return null;
};

// `checkVisibility` catches a closed `<details>`, which leaves the computed
// styles of its content alone.
const isShown = (element: HTMLElement) =>
  !element.closest('[hidden], [inert]') &&
  (typeof element.checkVisibility !== 'function' ||
    element.checkVisibility()) &&
  isElementDrawn(element);

const isFocusablePane = (pane: EditableDOMRuntime) => {
  const element = pane.rootElement;

  return (
    pane.connected &&
    !!element &&
    !pane.readOnly &&
    !pane.editor.read.view.isReadOnly() &&
    isShown(element)
  );
};

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
  didUnmountAtVersion,
  invoker,
  isSiteBound,
  replay,
  resolve,
  site,
}: {
  afterSelection: NonNullable<Selection> | null;
  didUnmountAtVersion: (site: HistoryStepSite, version: number) => boolean;
  invoker: HistoryStepPlace | null;
  isSiteBound: (site: HistoryStepSite) => boolean;
  replay: EditableHistoryReplay;
  resolve: (site: HistoryStepSite) => HistoryStepTarget;
  site: HistoryStepSite | null;
}): HistoryFocusDecision => {
  const saved = replay.receipt.selection;

  if (replay.focusPolicy !== 'restore-root') return NONE;
  if (replay.origin === 'control') {
    const externalRuntime = findFocusedExternalTextRuntime(replay);

    return externalRuntime
      ? { kind: 'keep', runtime: externalRuntime }
      : RESTORE;
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

  const target = resolve(site);

  if (
    !target &&
    isSiteBound(site) &&
    didUnmountAtVersion(site, replay.receipt.version)
  ) {
    return { kind: 'wait', mode: 'walk', selection, site };
  }

  return decideTarget(target, site, selection);
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
      ? { kind: 'wait', mode: 'walk', selection, site }
      : RESTORE;
  }

  return isFocusablePane(target.pane) &&
    selectionFitsPane(target.pane, selection)
    ? { kind: 'walk', pane: target.pane, selection }
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
    pane.externalText.focusSelection();
  }
  return !refused;
};

type HistoryFocusViews = Readonly<{
  didUnmountAtVersion: (site: HistoryStepSite, version: number) => boolean;
  followSlot: (
    site: HistoryStepSite,
    commit: EditorCommit | null,
    targetRoot: RootKey
  ) => HistoryStepSite | null;
  isSiteBound: (site: HistoryStepSite) => boolean;
  placeOf: (pane: EditableDOMRuntime) => HistoryStepPlace | null;
  resolve: (site: HistoryStepSite) => HistoryStepTarget;
  subscribePanes: (listener: () => void) => () => void;
}>;

const WAITS = new WeakMap<HistoryFocusViews, () => void>();

const restoreHistoryFocus = (
  replay: EditableHistoryReplay,
  views: HistoryFocusViews,
  invoker: HistoryStepPlace | null,
  site: HistoryStepSite | null,
  allowWait = true
) => {
  const host = replay.runtime.connected
    ? replay.runtime
    : invoker?.page.connected
      ? invoker.page
      : null;

  if (!host) return;

  const owner = getEditorRuntimeOwner(host.editor);
  const selectionRoot = readRuntimeSelection(owner)
    ? getEditorSelectionRoot(host.editor)
    : null;
  const historyRoot = replay.changes ? getChangedRoot(replay.changes) : null;
  const currentRoot = toInternalRoot(
    host.editor.read((state) => state.view.root())
  );
  const targetRoot = selectionRoot ?? historyRoot ?? currentRoot;
  const invokerRoot = replay.focusedView.connected
    ? toInternalRoot(
        replay.focusedView.editor.read((state) => state.view.root())
      )
    : null;
  let triedPane: EditableDOMRuntime | null = null;

  if (
    invoker &&
    invoker.site.hops.length > 0 &&
    !invoker.focusOwned &&
    (!replay.focusedView.connected ||
      invokerRoot !== targetRoot ||
      !views.isSiteBound(invoker.site))
  ) {
    const invokerSlot = views.followSlot(
      invoker.site,
      replay.commit,
      targetRoot
    );

    if (invokerSlot) {
      const resolved = views.resolve(invokerSlot);

      if (
        resolved &&
        !resolved.focusOwned &&
        resolved.kind === 'mounted' &&
        isFocusablePane(resolved.pane)
      ) {
        if (resolved.pane.focusTarget()) return;
        triedPane = resolved.pane;
      } else if (
        allowWait &&
        ((resolved?.kind === 'rebinding' &&
          !resolved.focusOwned &&
          !!resolved.pane.rootElement &&
          isShown(resolved.pane.rootElement)) ||
          (!resolved && views.isSiteBound(invokerSlot)))
      ) {
        waitForRebindingSlot(replay, views, invoker, site, {
          kind: 'wait',
          mode: 'restore',
          selection: null,
          site: invokerSlot,
        });
        return;
      }
    }
  }

  const targetRuntime = host.resolveRootRuntime(targetRoot);

  if (targetRuntime && targetRuntime !== triedPane) {
    targetRuntime.focusTarget();
  }
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
  site: HistoryStepSite | null,
  decision: Extract<HistoryFocusDecision, { kind: 'wait' }>
) => {
  const document =
    invoker?.page.rootElement?.ownerDocument ??
    replay.runtime.rootElement?.ownerDocument;

  if (!document) {
    restoreHistoryFocus(replay, views, invoker, site, false);
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
    if (commit.tags.includes('historic')) {
      close();
      return;
    }
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
        restoreHistoryFocus(replay, views, invoker, site, false);
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

      if (decision.mode === 'restore') {
        if (
          resolved?.kind === 'rebinding' &&
          !resolved.focusOwned &&
          resolved.pane.rootElement &&
          isShown(resolved.pane.rootElement)
        ) {
          return;
        }
        close();
        if (
          resolved?.kind === 'mounted' &&
          !resolved.focusOwned &&
          isFocusablePane(resolved.pane) &&
          resolved.pane.focusTarget()
        ) {
          return;
        }
        focusInvokingView(replay, invoker);
        return;
      }

      if (!decision.selection) {
        close();
        focusInvokingView(replay, invoker);
        return;
      }

      const next = decideTarget(resolved, decision.site, decision.selection);

      if (next.kind === 'wait') return;
      close();

      if (next.kind === 'walk') {
        if (!walkHistoryFocus(next.pane, next.selection)) {
          restoreHistoryFocus(replay, views, invoker, site, false);
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
  const site =
    (replay.direction === 'undo' ? sites?.before : sites?.after) ?? null;
  const invoker = views.placeOf(replay.focusedView);
  const decision = decideHistoryFocus({
    afterSelection: sites?.afterSelection ?? null,
    didUnmountAtVersion: views.didUnmountAtVersion,
    invoker,
    isSiteBound: views.isSiteBound,
    replay,
    resolve: views.resolve,
    site,
  });

  if (decision.kind === 'none') return;
  if (decision.kind === 'keep') {
    decision.runtime.externalText.focusSelection({ allowFocus: false });
    return;
  }
  if (decision.kind === 'wait') {
    waitForRebindingSlot(replay, views, invoker, site, decision);
    return;
  }
  if (
    decision.kind === 'walk' &&
    walkHistoryFocus(decision.pane, decision.selection)
  ) {
    return;
  }
  restoreHistoryFocus(replay, views, invoker, site);
};
