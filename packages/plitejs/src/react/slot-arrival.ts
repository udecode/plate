import {
  type Descendant,
  type EditorCommit,
  type Element,
  ElementApi,
  type NodeKey,
  type Path,
  type RootKey,
} from '..';
import { getEditorRuntimeOwner } from '../core/editor-runtime';
import {
  getEditorDocumentRoots,
  getPathByNodeKey,
  withEditorRootChildren,
} from '../core/public-state';
import {
  continueRootViewUse,
  readCommitSlotForks,
  readRootContentTarget,
  readRootViewContentUse,
  readRootViewUse,
  type SlotCarryHost,
  type SlotCarryQuery,
  type SlotForkRecord,
} from '../core/root-target';
import {
  getCaretOwner,
  getPlacementGeneration,
  placedSince,
} from '../core/view-carets';
import type { ViewPresentation } from '../core/view-presentation';
import { containsShadowAware } from '../dom';
import { focusedElementOnPage } from '../dom/plugin/dom-root-runtime';
import { getViewPresentation } from '../editor-runtime-view';
import type { ContentRootInstanceHop } from './context';
import { findMountedEditableDOMRuntime } from './editable/editable-dom-runtime';
import { markCopyChainUsed } from './editable/interaction-owner';
import { toInternalRoot } from './editable/runtime-editor-api';
import { focusPliteEditable } from './hooks/focus-plite-editable';
import type { ReactRuntimeEditor } from './plugin/react-editor';
import type { Editor as ReactEditorType } from './plugin/with-react';

export type ViewInstanceInfo = Readonly<{
  hops: readonly ContentRootInstanceHop[];
  instanceKey: string;
  paneKey: string;
}>;

type MountedViewInstance = ViewInstanceInfo &
  Readonly<{
    presentation: ViewPresentation;
    root: RootKey;
  }>;

type SavedInstanceUse = Readonly<{
  content: number;
  instanceKey: string;
  interaction: number;
  postCommitHops: readonly ContentRootInstanceHop[];
  slotMountId: string | null;
}>;

type PendingSlotArrival = {
  anchorDepth: number;
  anchorInstanceKey: string;
  anchorMounted: boolean;
  anchorSlotMountId: string | null;
  finalRoot: RootKey;
  focusInstanceKey: string | null;
  focusPostCommitHops: readonly ContentRootInstanceHop[];
  paneKey: string;
  placementGeneration: number;
  remainingUses: Map<string, SavedInstanceUse>;
  stopFocusWatch: () => void;
};

type ResolvedHopChain = Readonly<{
  anchorDepth: number;
  anchorInstanceKey: string;
  anchorSlotMountId: string;
  finalRoot: RootKey;
  instanceKey: string;
  postCommitHops: readonly ContentRootInstanceHop[];
}>;

const EMPTY_CONTENT_ROOT_HOPS: readonly ContentRootInstanceHop[] =
  Object.freeze([]);

let nextPaneId = 0;
let nextSlotMountId = 0;

export const createContentRootPaneKey = () => `pane:${(nextPaneId += 1)}`;

export const createContentRootSlotKey = () => `slot:${(nextSlotMountId += 1)}`;

export const buildContentRootInstanceKey = (
  parentKey: string,
  ownerKey: NodeKey,
  slot: string,
  root: RootKey
) => `${parentKey}\u0000${ownerKey}\u0001${slot}\u0001${root}`;

const readElementAtPath = (
  children: readonly Descendant[],
  path: Path
): Element | null => {
  let nodes = children;
  let current: Descendant | undefined;

  for (const index of path) {
    current = nodes[index];
    if (!current || !ElementApi.isElement(current)) return null;
    nodes = current.children;
  }

  return current && ElementApi.isElement(current) ? current : null;
};

const readSlotChildRoot = (element: Element, slot: string): RootKey | null => {
  const childRoots =
    'childRoots' in element &&
    typeof element.childRoots === 'object' &&
    element.childRoots !== null
      ? (element.childRoots as Readonly<Record<string, unknown>>)
      : null;
  const value =
    childRoots && Object.hasOwn(childRoots, slot) ? childRoots[slot] : null;

  return typeof value === 'string' && value.length > 0 ? value : null;
};

const resolveForkChainForHop = (
  forks: readonly SlotForkRecord[],
  ownerKey: NodeKey,
  slot: string,
  startRoot: RootKey
): Readonly<{
  endRoot: RootKey;
  keyRemap: ReadonlyMap<string, string>;
}> | null => {
  let currentRoot = startRoot;
  let matched = false;
  const keyRemap = new Map<string, string>();

  for (const fork of forks) {
    if (
      fork.elementKey !== ownerKey ||
      fork.slot !== slot ||
      fork.oldRoot !== currentRoot
    ) {
      continue;
    }

    matched = true;
    currentRoot = fork.newRoot;
    for (const [key, mapped] of keyRemap) {
      const chained = fork.keyRemap.get(mapped);

      if (chained) keyRemap.set(key, chained);
    }
    for (const [from, to] of fork.keyRemap) {
      if (!keyRemap.has(from)) keyRemap.set(from, to);
    }
  }

  return matched ? { endRoot: currentRoot, keyRemap } : null;
};

const resolvePostCommitHops = (
  runtime: ReactEditorType,
  paneKey: string,
  hops: readonly ContentRootInstanceHop[],
  forks: readonly SlotForkRecord[]
): ResolvedHopChain | null => {
  if (hops.length === 0) return null;

  const roots = getEditorDocumentRoots(runtime);
  let currentRoot = hops[0].ownerRoot;
  let currentKey = `${paneKey}:${currentRoot}`;
  let anchorInstanceKey: string | null = null;
  let anchorSlotMountId: string | null = null;
  let anchorDepth = -1;
  let activeKeyRemap: ReadonlyMap<string, string> | null = null;
  const postCommitHops: ContentRootInstanceHop[] = [];

  for (let index = 0; index < hops.length; index += 1) {
    const hop = hops[index];

    if (!activeKeyRemap && hop.ownerRoot !== currentRoot) return null;

    const children = Object.hasOwn(roots, currentRoot)
      ? roots[currentRoot]
      : undefined;

    if (!children) return null;

    const targetOwnerKey = (
      activeKeyRemap
        ? (activeKeyRemap.get(hop.ownerKey) ?? hop.ownerKey)
        : hop.ownerKey
    ) as NodeKey;
    const ownerPath = withEditorRootChildren(runtime, currentRoot, () =>
      getPathByNodeKey(runtime, targetOwnerKey)
    );

    if (!ownerPath) return null;

    const element = readElementAtPath(children, ownerPath);

    if (!element) return null;

    const nextChildRoot = readSlotChildRoot(element, hop.slot);

    if (!nextChildRoot) return null;

    currentKey = buildContentRootInstanceKey(
      currentKey,
      targetOwnerKey,
      hop.slot,
      nextChildRoot
    );

    if (!activeKeyRemap && nextChildRoot !== hop.root) {
      const forkMatch = resolveForkChainForHop(
        forks,
        targetOwnerKey,
        hop.slot,
        hop.root
      );

      if (!forkMatch || forkMatch.endRoot !== nextChildRoot) {
        return null;
      }

      activeKeyRemap = forkMatch.keyRemap;
      anchorInstanceKey = currentKey;
      anchorSlotMountId = hop.slotMountId;
      anchorDepth = index;
    }

    postCommitHops.push({
      ownerKey: targetOwnerKey,
      ownerRoot: currentRoot,
      root: nextChildRoot,
      slot: hop.slot,
      slotMountId: hop.slotMountId,
    });
    currentRoot = nextChildRoot;
  }

  return activeKeyRemap && anchorInstanceKey && anchorSlotMountId
    ? {
        anchorDepth,
        anchorInstanceKey,
        anchorSlotMountId,
        finalRoot: currentRoot,
        instanceKey: currentKey,
        postCommitHops,
      }
    : null;
};

const matchesAnchorSlot = (
  record: MountedViewInstance,
  pending: PendingSlotArrival
) =>
  pending.anchorSlotMountId === null ||
  record.hops[pending.anchorDepth]?.slotMountId === pending.anchorSlotMountId;

export type SlotArrivalHost = SlotCarryHost &
  Readonly<{
    clear: () => void;
    onCommit: (commit: EditorCommit) => void;
    onViewMounted: (
      view: ReactRuntimeEditor,
      root: RootKey,
      instance: ViewInstanceInfo | null
    ) => () => void;
    updateViewInstance: (
      view: ReactRuntimeEditor,
      instance: ViewInstanceInfo | null
    ) => void;
  }>;

export const createSlotArrivalHost = (
  runtime: ReactEditorType
): SlotArrivalHost => {
  const runtimeOwner = getEditorRuntimeOwner(runtime);
  const viewInstances = new Map<ReactRuntimeEditor, MountedViewInstance>();
  const viewsByPresentation = new Map<
    ViewPresentation,
    Map<string, Set<ReactRuntimeEditor>>
  >();
  const pendingByPresentation = new Map<ViewPresentation, PendingSlotArrival>();
  let applyingFocus = false;

  const instanceOf = (
    root: RootKey,
    instance: ViewInstanceInfo | null
  ): ViewInstanceInfo =>
    instance ?? {
      hops: EMPTY_CONTENT_ROOT_HOPS,
      instanceKey: root,
      paneKey: root,
    };

  const disposePending = (presentation: ViewPresentation) => {
    const existing = pendingByPresentation.get(presentation);

    if (!existing) return;
    existing.stopFocusWatch();
    pendingByPresentation.delete(presentation);
  };

  const clearAllPending = () => {
    for (const presentation of [...pendingByPresentation.keys()]) {
      disposePending(presentation);
    }
  };

  const removeViewFromMap = (
    view: ReactRuntimeEditor,
    record: MountedViewInstance
  ) => {
    const map = viewsByPresentation.get(record.presentation);
    const set = map?.get(record.instanceKey);

    if (!map || !set) return;
    set.delete(view);
    if (set.size === 0) map.delete(record.instanceKey);
    if (map.size === 0) viewsByPresentation.delete(record.presentation);
  };

  const setViewRecord = (
    view: ReactRuntimeEditor,
    record: MountedViewInstance
  ) => {
    const previous = viewInstances.get(view);

    if (previous) removeViewFromMap(view, previous);

    let map = viewsByPresentation.get(record.presentation);

    if (!map) {
      map = new Map();
      viewsByPresentation.set(record.presentation, map);
    }

    let set = map.get(record.instanceKey);

    if (!set) {
      set = new Set();
      map.set(record.instanceKey, set);
    }

    viewInstances.set(view, record);
    set.add(view);
  };

  const findMatchingView = (
    presentationViews: ReadonlyMap<string, ReadonlySet<ReactRuntimeEditor>>,
    instanceKey: string,
    pending: PendingSlotArrival
  ): ReactRuntimeEditor | null => {
    const candidates = presentationViews.get(instanceKey);

    if (!candidates || candidates.size === 0) return null;
    for (const candidate of candidates) {
      const record = viewInstances.get(candidate);

      if (record && matchesAnchorSlot(record, pending)) {
        return candidate;
      }
    }

    return null;
  };

  const findPresentationDocument = (
    presentation: ViewPresentation
  ): Document | null => {
    for (const [view, record] of viewInstances) {
      if (record.presentation !== presentation) continue;
      const editable = view.api.dom.editable();

      if (editable) return editable.ownerDocument;
    }

    return null;
  };

  const isTargetOwnedByPresentation = (
    presentation: ViewPresentation,
    target: globalThis.Element
  ): boolean => {
    const nearestEditable = target.closest('[data-editor="true"]');

    if (nearestEditable instanceof HTMLElement) {
      const domRuntime = findMountedEditableDOMRuntime(nearestEditable);

      if (!domRuntime) return false;

      return (
        getEditorRuntimeOwner(domRuntime.editor) === runtimeOwner &&
        getViewPresentation(domRuntime.editor) === presentation
      );
    }

    for (const [view, record] of viewInstances) {
      if (record.presentation !== presentation) continue;
      const editable = view.api.dom.editable();

      if (editable && containsShadowAware(editable, target)) {
        return true;
      }
    }

    return false;
  };

  const isFocusInsidePresentation = (
    presentation: ViewPresentation
  ): boolean => {
    for (const [view, record] of viewInstances) {
      if (record.presentation !== presentation) continue;
      const editable = view.api.dom.editable();

      if (!editable) continue;
      const active = focusedElementOnPage(editable);

      if (active && isTargetOwnedByPresentation(presentation, active)) {
        return true;
      }
    }

    return false;
  };

  const shouldCarrySelection = (query: SlotCarryQuery): boolean | null => {
    const caretOwner = getCaretOwner(runtime);

    if (caretOwner) {
      if (!viewsByPresentation.has(caretOwner.presentation)) return null;

      const target = readRootContentTarget(
        runtime,
        caretOwner.presentation,
        query.selectionRoot
      );

      if (!target?.shown) return null;

      const record = viewInstances.get(target.view as ReactRuntimeEditor);

      if (!record) return null;

      return record.hops.some(
        (hop) => hop.ownerKey === query.elementKey && hop.slot === query.slot
      );
    }

    let sawMounted = false;

    for (const presentation of viewsByPresentation.keys()) {
      const target = readRootContentTarget(
        runtime,
        presentation,
        query.selectionRoot
      );

      if (!target?.shown) continue;

      const record = viewInstances.get(target.view as ReactRuntimeEditor);

      if (!record) continue;
      sawMounted = true;

      if (
        record.hops.some(
          (hop) => hop.ownerKey === query.elementKey && hop.slot === query.slot
        )
      ) {
        return true;
      }
    }

    return sawMounted ? false : null;
  };

  const advancePendingArrival = (
    presentation: ViewPresentation,
    pending: PendingSlotArrival,
    forks: readonly SlotForkRecord[],
    afterRoot: RootKey,
    focusSuppressed: boolean,
    placementGeneration: number
  ) => {
    const resolved = resolvePostCommitHops(
      runtime,
      pending.paneKey,
      pending.focusPostCommitHops,
      forks
    );

    if (!resolved || resolved.finalRoot !== afterRoot) {
      disposePending(presentation);
      return;
    }

    const nextUses = new Map<string, SavedInstanceUse>();

    for (const saved of pending.remainingUses.values()) {
      const nextSaved = resolvePostCommitHops(
        runtime,
        pending.paneKey,
        saved.postCommitHops,
        forks
      );

      if (!nextSaved) continue;
      nextUses.set(nextSaved.instanceKey, {
        ...saved,
        instanceKey: nextSaved.instanceKey,
        postCommitHops: nextSaved.postCommitHops,
      });
    }

    pending.anchorDepth = resolved.anchorDepth;
    pending.anchorInstanceKey = resolved.anchorInstanceKey;
    pending.finalRoot = resolved.finalRoot;
    pending.focusPostCommitHops = resolved.postCommitHops;
    pending.placementGeneration = placementGeneration;
    pending.remainingUses = nextUses;
    if (pending.focusInstanceKey !== null) {
      pending.focusInstanceKey = focusSuppressed ? null : resolved.instanceKey;
    }
  };

  const onCommit = (commit: EditorCommit) => {
    if (
      commit.tags.includes('historic') ||
      commit.tags.includes('history-restore')
    ) {
      clearAllPending();
      return;
    }

    const forkRecord = readCommitSlotForks(commit);

    if (!forkRecord || forkRecord.forks.length === 0) {
      if (commit.selectionChanged) clearAllPending();
      return;
    }

    if (!commit.selectionBefore || !commit.selectionAfter) {
      clearAllPending();
      return;
    }

    const beforeRoot = toInternalRoot(commit.selectionBeforeRoot);
    const afterRoot = toInternalRoot(commit.selectionAfterRoot);
    const focusSuppressed = commit.tags.includes('skip-selection-focus');
    const placementGeneration = getPlacementGeneration(runtime);
    const presentations = forkRecord.caretPresentation
      ? viewsByPresentation.has(forkRecord.caretPresentation)
        ? [forkRecord.caretPresentation]
        : []
      : [...viewsByPresentation.keys()];

    for (const presentation of presentations) {
      const existingPending = pendingByPresentation.get(presentation);

      if (
        existingPending &&
        !existingPending.anchorMounted &&
        existingPending.finalRoot === beforeRoot
      ) {
        advancePendingArrival(
          presentation,
          existingPending,
          forkRecord.forks,
          afterRoot,
          focusSuppressed,
          placementGeneration
        );
        continue;
      }

      const caretTarget = readRootContentTarget(
        runtime,
        presentation,
        beforeRoot
      );

      if (!caretTarget?.shown) continue;

      const caretRecord = viewInstances.get(
        caretTarget.view as ReactRuntimeEditor
      );

      if (!caretRecord || caretRecord.hops.length === 0) continue;

      const caretResolved = resolvePostCommitHops(
        runtime,
        caretRecord.paneKey,
        caretRecord.hops,
        forkRecord.forks
      );

      if (!caretResolved || caretResolved.finalRoot !== afterRoot) continue;

      const { anchorDepth, anchorInstanceKey, anchorSlotMountId } =
        caretResolved;
      const anchorBeforePrefix = caretRecord.hops
        .slice(0, anchorDepth + 1)
        .map((hop) => `${hop.ownerKey}\u0001${hop.slot}\u0001${hop.root}`)
        .join('\u0000');
      const duplicateAnchorExists = [...viewInstances.values()].some(
        (record) =>
          record.presentation === presentation &&
          record.paneKey === caretRecord.paneKey &&
          record.hops.length > anchorDepth &&
          record.hops[anchorDepth]?.slotMountId !== anchorSlotMountId &&
          record.hops
            .slice(0, anchorDepth + 1)
            .map((hop) => `${hop.ownerKey}\u0001${hop.slot}\u0001${hop.root}`)
            .join('\u0000') === anchorBeforePrefix
      );
      const matchedSlotMountId = duplicateAnchorExists
        ? anchorSlotMountId
        : null;
      const descendantPrefix = `${anchorInstanceKey}\u0000`;
      const uses: SavedInstanceUse[] = [];

      for (const [view, record] of viewInstances) {
        if (
          record.presentation !== presentation ||
          record.paneKey !== caretRecord.paneKey ||
          record.hops.length === 0
        ) {
          continue;
        }
        if (
          matchedSlotMountId !== null &&
          record.hops[anchorDepth]?.slotMountId !== matchedSlotMountId
        ) {
          continue;
        }

        const resolved = resolvePostCommitHops(
          runtime,
          record.paneKey,
          record.hops,
          forkRecord.forks
        );

        if (
          !resolved ||
          (resolved.instanceKey !== anchorInstanceKey &&
            !resolved.instanceKey.startsWith(descendantPrefix))
        ) {
          continue;
        }

        const content = readRootViewContentUse(view);
        const interaction = readRootViewUse(view);

        if (content > 0 || interaction > 0) {
          uses.push({
            content,
            instanceKey: resolved.instanceKey,
            interaction,
            postCommitHops: resolved.postCommitHops,
            slotMountId: matchedSlotMountId,
          });
        }
      }

      uses.sort(
        (left, right) =>
          left.content - right.content || left.interaction - right.interaction
      );

      disposePending(presentation);

      const hadEditorFocus = isFocusInsidePresentation(presentation);
      const focusInstanceKey =
        hadEditorFocus && !focusSuppressed ? caretResolved.instanceKey : null;
      const ownerDoc = focusInstanceKey
        ? findPresentationDocument(presentation)
        : null;
      let stopFocusWatch = () => {};

      const pending: PendingSlotArrival = {
        anchorDepth,
        anchorInstanceKey,
        anchorMounted: false,
        anchorSlotMountId: matchedSlotMountId,
        finalRoot: caretResolved.finalRoot,
        focusInstanceKey,
        focusPostCommitHops: caretResolved.postCommitHops,
        paneKey: caretRecord.paneKey,
        placementGeneration,
        remainingUses: new Map(uses.map((item) => [item.instanceKey, item])),
        stopFocusWatch: () => stopFocusWatch(),
      };

      if (ownerDoc && focusInstanceKey) {
        const handleFocusIn = () => {
          if (applyingFocus) return;
          pending.focusInstanceKey = null;
          stopFocusWatch();
          if (pending.remainingUses.size === 0) {
            pendingByPresentation.delete(presentation);
          }
        };

        ownerDoc.addEventListener('focusin', handleFocusIn, true);
        stopFocusWatch = () => {
          ownerDoc.removeEventListener('focusin', handleFocusIn, true);
          stopFocusWatch = () => {};
        };
      }

      pendingByPresentation.set(presentation, pending);
    }
  };

  const applyPendingUses = (
    presentationViews: ReadonlyMap<string, ReadonlySet<ReactRuntimeEditor>>,
    pending: PendingSlotArrival
  ) => {
    for (const [instanceKey, saved] of [...pending.remainingUses]) {
      const arrivedView = findMatchingView(
        presentationViews,
        instanceKey,
        pending
      );

      if (!arrivedView) continue;
      continueRootViewUse(arrivedView, saved.content, saved.interaction);
      pending.remainingUses.delete(instanceKey);
    }
  };

  const tryFinishArrival = (
    presentation: ViewPresentation,
    pending: PendingSlotArrival
  ) => {
    if (placedSince(runtime, pending.placementGeneration)) {
      disposePending(presentation);
      return;
    }

    const presentationViews = viewsByPresentation.get(presentation);

    if (!presentationViews || !pending.anchorMounted) return;

    applyPendingUses(presentationViews, pending);

    if (pending.focusInstanceKey) {
      const focusView = findMatchingView(
        presentationViews,
        pending.focusInstanceKey,
        pending
      );

      if (focusView) {
        const editable = focusView.api.dom.editable();
        const active = editable ? focusedElementOnPage(editable) : null;
        const ownerDoc = editable?.ownerDocument ?? null;
        const focusMovedOutside =
          !!active &&
          active !== ownerDoc?.body &&
          active !== ownerDoc?.documentElement &&
          !isTargetOwnedByPresentation(presentation, active);

        pending.focusInstanceKey = null;
        pending.stopFocusWatch();

        if (!focusMovedOutside) {
          applyingFocus = true;
          try {
            focusPliteEditable(focusView);
            markCopyChainUsed(focusView, focusView.api.dom.editable());
          } finally {
            applyingFocus = false;
          }
        }
      }
    }

    if (pending.focusInstanceKey === null && pending.remainingUses.size === 0) {
      disposePending(presentation);
    }
  };

  const onViewMounted = (
    view: ReactRuntimeEditor,
    root: RootKey,
    instance: ViewInstanceInfo | null
  ) => {
    const presentation = getViewPresentation(view);
    const resolved = instanceOf(root, instance);
    const record: MountedViewInstance = {
      hops: resolved.hops,
      instanceKey: resolved.instanceKey,
      paneKey: resolved.paneKey,
      presentation,
      root,
    };

    setViewRecord(view, record);

    const pending = pendingByPresentation.get(presentation);

    if (pending) {
      if (
        pending.anchorInstanceKey === resolved.instanceKey &&
        matchesAnchorSlot(record, pending)
      ) {
        pending.anchorMounted = true;
      }
      if (pending.anchorMounted) {
        tryFinishArrival(presentation, pending);
      }
    }

    return () => {
      const current = viewInstances.get(view);

      if (!current) return;
      viewInstances.delete(view);
      removeViewFromMap(view, current);
      if (!viewsByPresentation.has(current.presentation)) {
        disposePending(current.presentation);
      }
    };
  };

  const updateViewInstance = (
    view: ReactRuntimeEditor,
    instance: ViewInstanceInfo | null
  ) => {
    const current = viewInstances.get(view);

    if (!current) return;

    const next = instanceOf(current.root, instance);

    if (
      current.instanceKey === next.instanceKey &&
      current.paneKey === next.paneKey &&
      current.hops === next.hops
    ) {
      return;
    }

    setViewRecord(view, {
      ...current,
      hops: next.hops,
      instanceKey: next.instanceKey,
      paneKey: next.paneKey,
    });
  };

  return {
    clear: clearAllPending,
    onCommit,
    onViewMounted,
    shouldCarrySelection,
    updateViewInstance,
  };
};
