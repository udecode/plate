import {
  type MouseEvent,
  type MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  PathApi,
  type Point,
  type Range,
  RangeApi,
  type RootKey,
  type Selection,
  TextApi,
} from '@platejs/plite';

import { schedulePliteReactFocus } from '../hooks/focus-scheduler';
import {
  type focusPliteEditable,
  focusPliteEditableAfterEventFrame,
} from '../hooks/focus-plite-editable';
import { getPliteNodePathFromDOMElement } from '../hooks/use-plite-node-ref';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { recordPliteReactRender } from '../render-profiler';
import { MAIN_ROOT_KEY } from '../root-key';
import { getPliteRootBoundaryPoint } from '../view-boundary-graph';
import {
  createPliteViewSelection,
  writePliteViewSelection,
} from '../view-selection';
import {
  type ContentRootOwner,
  createContentRootProjectionGraph,
  findContentRootOwners,
} from './content-root-navigation';
import {
  getContentRootOwnerFromTarget,
  getEditableRootFromTarget,
  isSameOwner,
  mouseEventTargetToElement,
} from './content-root-owner-target';
import { getDragAutoScrollTarget } from './drag-auto-scroll-target';
import type { EditableDOMSelectionSyncOptions } from './input-controller';
import { writeCollapsedModelSelectionDOMPreference } from './model-selection-dom-preference';
import {
  getExpandedDOMSelectionInTarget,
  hasExpandedDOMSelectionInTarget,
  isPointInsideDOMSelection,
  needsMouseUpDOMSelectionReplay,
  restoreDOMSelectionInTarget,
  shouldReplayMouseUpDOMSelection,
} from './root-interaction-dom-selection-replay';

export { shouldReplayMouseUpDOMSelection } from './root-interaction-dom-selection-replay';

import {
  isRootInteractionEditableFocused,
  type RootInteractionFocusSelection,
  type RootInteractionMouseDownAction,
  type RootInteractionMouseUpAction,
  type RootInteractionSelectionMode,
  resolveRootInteractionMouseDown,
  resolveRootInteractionMouseUp,
  resolveRootInteractionTarget,
} from './root-interaction-resolver';
import {
  getEditableRootPliteStringCoordinatePlacement,
  getPliteStringDocumentOffset,
  getPliteStringEdgeOffset,
  getPliteStringPlacementDOMPoint,
  type PliteStringCoordinatePlacement,
  type PliteStringPlacementDOMPoint,
} from './plite-string-coordinate-placement';

type PliteFocusableEditor = Parameters<typeof focusPliteEditable>[0];
const NATIVE_EDITABLE_TEXT_TARGET =
  '[data-plite-string], [data-plite-zero-width], [data-plite-leaf], [data-plite-node="text"]';

export { canScrollY, getDragAutoScrollTarget } from './drag-auto-scroll-target';

export type RootInteractionEditor = ReactRuntimeEditor &
  PliteFocusableEditor & {
    api: ReactRuntimeEditor['api'] &
      PliteFocusableEditor['api'] & {
        dom: ReactRuntimeEditor['api']['dom'] &
          PliteFocusableEditor['api']['dom'] & {
            resolveEventRange: (event: Event) => Range | null;
          };
      };
  };

export type RootInteractionControllerOptions = {
  disabled: boolean;
  editor: RootInteractionEditor;
  getLastSelectionForRoot: (root: RootKey) => Selection;
  getMountedViewEditor: (root: RootKey) => RootInteractionEditor | null;
  ignoreBlankEditableRootClicks?: boolean;
  root: RootKey;
  selection: RootInteractionSelectionMode;
  selectionBridge?: {
    beforeModelSelection: () => void;
    importDOMSelection: () => void;
    isPartialDOMBackedSelection: (selection: Range | null) => boolean;
    syncDOMSelectionToEditor: (
      options?: EditableDOMSelectionSyncOptions
    ) => void;
  };
};

export type RootInteractionController = {
  onMouseDownCapture: MouseEventHandler<HTMLElement>;
  onMouseMoveCapture: MouseEventHandler<HTMLElement>;
  onMouseUpCapture: MouseEventHandler<HTMLElement>;
};

type PendingRootInteraction = {
  action: RootInteractionMouseDownAction;
  clientX: number;
  clientY: number;
  coordinateDragSelection: boolean;
  currentRange: Range | null;
  nativeSelectedTextClick: boolean;
  placementDOMPoint: PliteStringPlacementDOMPoint | null;
  preventNativeSelection: boolean;
  startRange: Range | null;
};

type RootInteractionDragEndpoint = {
  isDOMCoverageBoundary: boolean;
  owner?: ContentRootOwner | null;
  point: Point;
  root: RootKey;
};

type PendingProjectedDrag = {
  clientX: number;
  clientY: number;
  editor: RootInteractionEditor;
  endpoint: RootInteractionDragEndpoint;
};

type PendingDragAutoScroll = {
  animationFrame: number | null;
  clientX: number;
  clientY: number;
  currentRange: Range;
  editor: RootInteractionEditor;
  releaseCleanup: (() => void) | null;
  root: RootKey;
  rootElement: HTMLElement;
  selectionBridge?: RootInteractionControllerOptions['selectionBridge'];
  startRange: Range;
};

type PendingDragAutoScrollRef = {
  current: PendingDragAutoScroll | null;
};

let pendingProjectedDrag: PendingProjectedDrag | null = null;

const measureRootMouseDownPhase = <T>(id: string, run: () => T): T => {
  if (!globalThis.__PLITE_REACT_RENDER_PROFILER__) {
    return run();
  }

  const startedAt = performance.now();

  try {
    return run();
  } finally {
    recordPliteReactRender({
      duration: performance.now() - startedAt,
      id,
      kind: 'runtime-time',
    });
  }
};

const withInteractionRangeRoot = (range: Range, root: RootKey): Range => {
  if (root === MAIN_ROOT_KEY) {
    return range;
  }

  return {
    anchor:
      range.anchor.root === undefined
        ? { ...range.anchor, root }
        : range.anchor,
    focus:
      range.focus.root === undefined ? { ...range.focus, root } : range.focus,
  };
};

const ignoreInteraction = (): PendingRootInteraction => ({
  action: { type: 'ignore' },
  clientX: 0,
  clientY: 0,
  coordinateDragSelection: false,
  currentRange: null,
  nativeSelectedTextClick: false,
  placementDOMPoint: null,
  preventNativeSelection: false,
  startRange: null,
});

const isSameProjectedEndpoint = (
  left: RootInteractionDragEndpoint,
  right: RootInteractionDragEndpoint
) =>
  left.root === right.root &&
  isSameOwner(left.owner, right.owner) &&
  PathApi.equals(left.point.path, right.point.path) &&
  left.point.offset === right.point.offset;

const toRootedPoint = (point: Point, root: RootKey): Point =>
  root === MAIN_ROOT_KEY ? point : { ...point, root };

const isDOMCoverageBoundaryTarget = (target: EventTarget | null) =>
  !!mouseEventTargetToElement(target)?.closest(
    '[data-plite-dom-coverage-boundary]'
  );

const shouldUseViewProjectedDragSelection = ({
  anchor,
  editor,
  focus,
}: {
  anchor: RootInteractionDragEndpoint;
  editor: RootInteractionEditor;
  focus: RootInteractionDragEndpoint;
}) =>
  anchor.root !== focus.root ||
  !isSameOwner(anchor.owner, focus.owner) ||
  hasContentRootOwnerBetweenDragEndpoints({ anchor, editor, focus });

const comparePoints = (left: Point, right: Point) => {
  const pathComparison = PathApi.compare(left.path, right.path);

  if (pathComparison !== 0) {
    return pathComparison;
  }

  if (left.offset === right.offset) {
    return 0;
  }

  return left.offset < right.offset ? -1 : 1;
};

const hasContentRootOwnerBetweenDragEndpoints = ({
  anchor,
  editor,
  focus,
}: {
  anchor: RootInteractionDragEndpoint;
  editor: RootInteractionEditor;
  focus: RootInteractionDragEndpoint;
}) => {
  if (
    anchor.root !== focus.root ||
    anchor.owner ||
    focus.owner ||
    anchor.root !== MAIN_ROOT_KEY
  ) {
    return false;
  }

  const [start, end] =
    comparePoints(anchor.point, focus.point) <= 0
      ? [anchor.point, focus.point]
      : [focus.point, anchor.point];

  return findContentRootOwners(editor).some(
    (owner) =>
      owner.ownerRoot === anchor.root &&
      PathApi.compare(owner.ownerPath, start.path) >= 0 &&
      PathApi.compare(owner.ownerPath, end.path) <= 0
  );
};

const shouldUseModelProjectedDragSelection = ({
  anchor,
  focus,
}: {
  anchor: RootInteractionDragEndpoint;
  focus: RootInteractionDragEndpoint;
}) =>
  anchor.root === focus.root &&
  isSameOwner(anchor.owner, focus.owner) &&
  (anchor.isDOMCoverageBoundary || focus.isDOMCoverageBoundary);

const findOwnerContainingPoint = (
  owners: readonly ContentRootOwner[],
  root: RootKey,
  point: Point
) =>
  root === MAIN_ROOT_KEY
    ? (owners.find(
        (owner) =>
          owner.ownerRoot === root &&
          (PathApi.equals(owner.ownerPath, point.path) ||
            PathApi.isAncestor(owner.ownerPath, point.path))
      ) ?? null)
    : null;

const resolveContentRootOwnerChromeEdge = ({
  event,
  owner,
}: {
  event: MouseEvent<HTMLElement>;
  owner: ContentRootOwner;
}): 'end' | 'start' => {
  const element = mouseEventTargetToElement(event.target);
  const ownerElement = element?.closest<HTMLElement>(
    `[data-plite-node="element"][data-plite-path="${owner.ownerPath.join(',')}"]`
  );
  const slotElement = ownerElement?.querySelector<HTMLElement>(
    '[data-plite-content-root-slot]'
  );

  if (!slotElement) {
    return 'start';
  }

  const slotRect = slotElement.getBoundingClientRect();

  return event.clientY > slotRect.bottom ? 'end' : 'start';
};

const resolveContentRootOwnerChromeEndpoint = ({
  editor,
  event,
  owners,
  point,
  root,
}: {
  editor: RootInteractionEditor;
  event: MouseEvent<HTMLElement>;
  owners: readonly ContentRootOwner[];
  point: Point;
  root: RootKey;
}): RootInteractionDragEndpoint | null => {
  const owner = findOwnerContainingPoint(owners, root, point);

  if (!owner) {
    return null;
  }

  const edge = resolveContentRootOwnerChromeEdge({ event, owner });
  const childPoint = editor.read((state) =>
    getPliteRootBoundaryPoint(state.value.root(owner.childRoot), edge)
  );

  return childPoint
    ? {
        isDOMCoverageBoundary: isDOMCoverageBoundaryTarget(event.target),
        owner,
        point: toRootedPoint(childPoint, owner.childRoot),
        root: owner.childRoot,
      }
    : null;
};

const resolveProjectedDragEndpoint = ({
  editor,
  event,
  getMountedViewEditor,
  range: resolvedRange,
  root: resolvedRoot,
}: {
  editor: RootInteractionEditor;
  event: MouseEvent<HTMLElement>;
  getMountedViewEditor: (root: RootKey) => RootInteractionEditor | null;
  range?: Range | null;
  root?: RootKey;
}): RootInteractionDragEndpoint | null => {
  const targetRoot = resolvedRoot ?? getEditableRootFromTarget(event.target);
  const targetEditor = getMountedViewEditor(targetRoot) ?? editor;
  const range =
    resolvedRange ?? targetEditor.api.dom.resolveEventRange(event.nativeEvent);

  if (!range) {
    return null;
  }

  const point = toRootedPoint(RangeApi.start(range), targetRoot);
  const ownerChromeEndpoint =
    targetRoot === MAIN_ROOT_KEY
      ? resolveContentRootOwnerChromeEndpoint({
          editor,
          event,
          owners: findContentRootOwners(editor),
          point,
          root: targetRoot,
        })
      : null;

  if (ownerChromeEndpoint) {
    return ownerChromeEndpoint;
  }

  return {
    isDOMCoverageBoundary: isDOMCoverageBoundaryTarget(event.target),
    owner: getContentRootOwnerFromTarget({
      childRoot: targetRoot,
      target: event.target,
    }),
    point,
    root: targetRoot,
  };
};

const resolveExistingSelectionProjectedDragEndpoint = ({
  editor,
  event,
  getMountedViewEditor,
}: {
  editor: RootInteractionEditor;
  event: MouseEvent<HTMLElement>;
  getMountedViewEditor: (root: RootKey) => RootInteractionEditor | null;
}): RootInteractionDragEndpoint | null => {
  const element = mouseEventTargetToElement(event.target);
  const editableRoot = element?.closest<HTMLElement>(
    '[data-plite-editor="true"]'
  );

  if (
    !editableRoot ||
    !hasExpandedDOMSelectionInTarget(editableRoot) ||
    !isPointInsideDOMSelection({
      clientX: event.clientX,
      clientY: event.clientY,
      target: editableRoot,
    })
  ) {
    return null;
  }

  const targetRoot = getEditableRootFromTarget(event.target);
  const targetEditor = getMountedViewEditor(targetRoot) ?? editor;
  const selection = targetEditor.read((state) => state.selection.get());

  if (!selection || !RangeApi.isExpanded(selection)) {
    return null;
  }

  return {
    isDOMCoverageBoundary: isDOMCoverageBoundaryTarget(event.target),
    owner: getContentRootOwnerFromTarget({
      childRoot: targetRoot,
      target: event.target,
    }),
    point: toRootedPoint(RangeApi.start(selection), targetRoot),
    root: targetRoot,
  };
};

const resolveKnownOwner = (
  owners: readonly ContentRootOwner[],
  owner: ContentRootOwner | null | undefined
) => (owner ? owners.find((candidate) => isSameOwner(candidate, owner)) : null);

const applyProjectedDragSelection = ({
  anchor,
  editor,
  focus,
}: {
  anchor: RootInteractionDragEndpoint;
  editor: RootInteractionEditor;
  focus: RootInteractionDragEndpoint;
}) => {
  if (isSameProjectedEndpoint(anchor, focus)) {
    return false;
  }

  const owners = findContentRootOwners(editor);
  const anchorOwner = resolveKnownOwner(owners, anchor.owner);
  const focusOwner = resolveKnownOwner(owners, focus.owner);

  if ((anchor.owner && !anchorOwner) || (focus.owner && !focusOwner)) {
    return false;
  }

  writePliteViewSelection(
    editor,
    createPliteViewSelection(createContentRootProjectionGraph(editor, owners), {
      anchor: {
        ...(anchorOwner ? { owner: anchorOwner } : {}),
        point: anchor.point,
      },
      focus: {
        ...(focusOwner ? { owner: focusOwner } : {}),
        point: focus.point,
      },
    })
  );
  collapseModelSelectionToProjectedDragAnchor({ anchor, editor });

  return true;
};

const collapseModelSelectionToProjectedDragAnchor = ({
  anchor,
  editor,
}: {
  anchor: RootInteractionDragEndpoint;
  editor: RootInteractionEditor;
}) => {
  const viewRoot = editor.read((state) => state.view.root());

  if (anchor.root !== viewRoot) {
    return;
  }

  const range = withInteractionRangeRoot(
    {
      anchor: anchor.point,
      focus: anchor.point,
    },
    viewRoot
  );
  const selection = editor.read((state) => state.selection.get());

  if (selection && RangeApi.equals(selection, range)) {
    return;
  }

  editor.update((tx) => {
    tx.selection.set(range);
  });
};

const applyModelProjectedDragSelection = ({
  anchor,
  editor,
  focus,
  selectionBridge,
}: {
  anchor: RootInteractionDragEndpoint;
  editor: RootInteractionEditor;
  focus: RootInteractionDragEndpoint;
  selectionBridge?: RootInteractionControllerOptions['selectionBridge'];
}) => {
  if (isSameProjectedEndpoint(anchor, focus)) {
    return false;
  }

  selectionBridge?.beforeModelSelection();
  writePliteViewSelection(editor, null);
  editor.update((tx) => {
    tx.selection.set({
      anchor: anchor.point,
      focus: focus.point,
    });
  });

  return true;
};

const getEditableRootChromeCoordinatePlacement = ({
  editor,
  event,
  includeInsideString = false,
}: {
  editor: RootInteractionEditor;
  event: MouseEvent<HTMLElement>;
  includeInsideString?: boolean;
}): PliteStringCoordinatePlacement => {
  const element = mouseEventTargetToElement(event.target);
  const targetEditableRoot = element?.closest<HTMLElement>(
    '[data-plite-editor="true"]'
  );
  const currentTargetEditableRoot = event.currentTarget.matches(
    '[data-plite-editor="true"]'
  )
    ? event.currentTarget
    : event.currentTarget.querySelector<HTMLElement>(
        '[data-plite-editor="true"]'
      );
  let mountedEditableRoot: HTMLElement | null = null;

  try {
    const mountedElement = editor.api.dom.resolveDOMNode(editor);

    mountedEditableRoot =
      mountedElement instanceof HTMLElement ? mountedElement : null;
  } catch {
    mountedEditableRoot = null;
  }

  const editableRoot =
    targetEditableRoot && event.currentTarget.contains(targetEditableRoot)
      ? targetEditableRoot
      : (mountedEditableRoot ?? currentTargetEditableRoot);

  if (!editableRoot) {
    return null;
  }

  return getEditableRootPliteStringCoordinatePlacement({
    editableRoot,
    event: event.nativeEvent,
    includeInsideString,
    target: includeInsideString ? element : null,
  });
};

const resolvePliteStringPlacementRange = ({
  editor,
  placement,
}: {
  editor: RootInteractionEditor;
  placement: NonNullable<PliteStringCoordinatePlacement>;
}): Range | null => {
  const textHost = placement.string.closest<HTMLElement>(
    '[data-plite-node="text"]'
  );
  const path =
    textHost instanceof HTMLElement
      ? getPliteNodePathFromDOMElement(textHost)
      : null;
  const offset = textHost
    ? placement.offset == null
      ? getPliteStringEdgeOffset({
          edge: placement.edge,
          rect: placement.rect,
          string: placement.string,
          textHost,
        })
      : getPliteStringDocumentOffset({
          offset: placement.offset,
          string: placement.string,
          textHost,
        })
    : null;

  if (!path || offset == null) {
    return null;
  }

  const node = editor.read((state) => {
    if (!state.nodes.hasPath(path)) {
      return null;
    }

    return state.nodes.get(path)[0];
  });

  if (!node) {
    return null;
  }

  const safeOffset = TextApi.isText(node)
    ? Math.max(0, Math.min(offset, node.text.length))
    : offset;
  const point = { path, offset: safeOffset };

  return {
    anchor: point,
    focus: point,
  };
};

const hasPointerMoved = (
  pending: PendingRootInteraction,
  event: MouseEvent<HTMLElement>
) =>
  Math.abs(event.clientX - pending.clientX) > 4 ||
  Math.abs(event.clientY - pending.clientY) > 4;

const createDragSelectionRange = ({
  endRange,
  startRange,
}: {
  endRange: Range;
  startRange: Range;
}): Range => ({
  anchor: RangeApi.start(startRange),
  focus: RangeApi.end(endRange),
});

const isRegressiveDragSelectionRange = ({
  currentRange,
  delta,
  nextRange,
  startRange,
}: {
  currentRange: Range;
  delta: number;
  nextRange: Range;
  startRange: Range;
}) => {
  const startPoint = RangeApi.start(startRange);
  const currentFocus = currentRange.focus;
  const nextFocus = nextRange.focus;
  const currentProgress = comparePoints(currentFocus, startPoint);
  const nextProgress = comparePoints(nextFocus, startPoint);

  if (delta > 0) {
    return (
      nextProgress < 0 ||
      (currentProgress > 0 && comparePoints(nextFocus, currentFocus) < 0)
    );
  }

  if (delta < 0) {
    return (
      nextProgress > 0 ||
      (currentProgress < 0 && comparePoints(nextFocus, currentFocus) > 0)
    );
  }

  return false;
};

const canApplyCoordinateDragSelection = (
  pendingInteraction: PendingRootInteraction
) =>
  pendingInteraction.action.type === 'place-native-editable' ||
  pendingInteraction.coordinateDragSelection;

const clearDOMSelectionFromEvent = (event: MouseEvent<HTMLElement>) => {
  const rootNode = event.currentTarget.getRootNode() as Document | ShadowRoot;
  const domSelection =
    'getSelection' in rootNode
      ? rootNode.getSelection()
      : event.currentTarget.ownerDocument.getSelection();

  domSelection?.removeAllRanges();
};

const applyProjectedDragSelectionFromEvent = ({
  event,
  getMountedViewEditor,
  projectedDrag,
  selectionBridge,
}: {
  event: MouseEvent<HTMLElement>;
  getMountedViewEditor: (root: RootKey) => RootInteractionEditor | null;
  projectedDrag: PendingProjectedDrag;
  selectionBridge?: RootInteractionControllerOptions['selectionBridge'];
}) => {
  if (
    !hasPointerMoved(
      {
        action: { type: 'ignore' },
        clientX: projectedDrag.clientX,
        clientY: projectedDrag.clientY,
        coordinateDragSelection: false,
        currentRange: null,
        nativeSelectedTextClick: false,
        placementDOMPoint: null,
        preventNativeSelection: false,
        startRange: null,
      },
      event
    )
  ) {
    return false;
  }

  const focus = resolveProjectedDragEndpoint({
    editor: projectedDrag.editor,
    event,
    getMountedViewEditor,
  });

  if (!focus) {
    return false;
  }

  const shouldUseView = shouldUseViewProjectedDragSelection({
    anchor: projectedDrag.endpoint,
    editor: projectedDrag.editor,
    focus,
  });
  const appliedView =
    shouldUseView &&
    applyProjectedDragSelection({
      anchor: projectedDrag.endpoint,
      editor: projectedDrag.editor,
      focus,
    });
  const shouldUseModel =
    !appliedView &&
    shouldUseModelProjectedDragSelection({
      anchor: projectedDrag.endpoint,
      focus,
    });
  const appliedModel =
    shouldUseModel &&
    applyModelProjectedDragSelection({
      anchor: projectedDrag.endpoint,
      editor: projectedDrag.editor,
      focus,
      selectionBridge,
    });

  if (!(appliedView || appliedModel)) {
    return false;
  }

  event.preventDefault();
  clearDOMSelectionFromEvent(event);

  return true;
};

const applyModelDragSelection = ({
  editor,
  range,
  root,
  selectionBridge,
}: {
  editor: RootInteractionEditor;
  range: Range;
  root: RootKey;
  selectionBridge?: RootInteractionControllerOptions['selectionBridge'];
}) => {
  const rootedRange = withInteractionRangeRoot(range, root);
  const useViewSelection =
    (selectionBridge?.isPartialDOMBackedSelection(rootedRange) ?? false) ||
    hasContentRootOwnerBetweenDragEndpoints({
      anchor: {
        isDOMCoverageBoundary: false,
        owner: null,
        point: rootedRange.anchor,
        root,
      },
      editor,
      focus: {
        isDOMCoverageBoundary: false,
        owner: null,
        point: rootedRange.focus,
        root,
      },
    });

  selectionBridge?.beforeModelSelection();
  writePliteViewSelection(
    editor,
    useViewSelection
      ? createPliteViewSelection(
          createContentRootProjectionGraph(
            editor,
            findContentRootOwners(editor)
          ),
          {
            anchor: { point: rootedRange.anchor },
            focus: { point: rootedRange.focus },
          }
        )
      : null
  );
  editor.update(
    (tx) => {
      tx.selection.set(rootedRange);
    },
    {
      metadata: {
        selection: {
          scroll: false,
        },
      },
    }
  );
  selectionBridge?.syncDOMSelectionToEditor({ preserveScroll: true });
};

const stopDragAutoScroll = (ref: PendingDragAutoScrollRef) => {
  const state = ref.current;

  if (state && state.animationFrame !== null) {
    state.rootElement.ownerDocument.defaultView?.cancelAnimationFrame(
      state.animationFrame
    );
  }

  state?.releaseCleanup?.();
  ref.current = null;
};

const attachDragAutoScrollReleaseListeners = (
  ref: PendingDragAutoScrollRef,
  rootElement: HTMLElement
) => {
  const document = rootElement.ownerDocument;
  const window = document.defaultView;
  const stop = () => {
    stopDragAutoScroll(ref);
  };

  document.addEventListener('mouseup', stop, true);
  document.addEventListener('pointerup', stop, true);
  document.addEventListener('dragend', stop, true);
  window?.addEventListener('blur', stop, true);

  return () => {
    document.removeEventListener('mouseup', stop, true);
    document.removeEventListener('pointerup', stop, true);
    document.removeEventListener('dragend', stop, true);
    window?.removeEventListener('blur', stop, true);
  };
};

const resolveDragAutoScrollEventRange = ({
  clientX,
  clientY,
  editor,
  rootElement,
}: {
  clientX: number;
  clientY: number;
  editor: RootInteractionEditor;
  rootElement: HTMLElement;
}) => {
  const targetAtPoint = rootElement.ownerDocument.elementFromPoint(
    clientX,
    clientY
  );
  let target: EventTarget = rootElement;

  if (targetAtPoint) {
    try {
      if (editor.api.dom.hasDOMNode(targetAtPoint)) {
        target = targetAtPoint;
      }
    } catch {
      target = rootElement;
    }
  }

  return editor.api.dom.resolveEventRange({
    clientX,
    clientY,
    target,
  } as unknown as Event);
};

export const applyDragAutoScrollFrame = (state: PendingDragAutoScroll) => {
  const target = getDragAutoScrollTarget({
    clientX: state.clientX,
    clientY: state.clientY,
    rootElement: state.rootElement,
  });

  if (!target?.scroll()) {
    return false;
  }

  const eventRange = resolveDragAutoScrollEventRange({
    clientX: target.clientX,
    clientY: target.clientY,
    editor: state.editor,
    rootElement: state.rootElement,
  });

  if (!eventRange) {
    return false;
  }

  const nextRange = createDragSelectionRange({
    endRange: eventRange,
    startRange: state.startRange,
  });

  if (
    isRegressiveDragSelectionRange({
      currentRange: state.currentRange,
      delta: target.delta,
      nextRange,
      startRange: state.startRange,
    })
  ) {
    return true;
  }

  applyModelDragSelection({
    editor: state.editor,
    range: nextRange,
    root: state.root,
    selectionBridge: state.selectionBridge,
  });
  state.currentRange = nextRange;

  return true;
};

const scheduleDragAutoScroll = (ref: PendingDragAutoScrollRef) => {
  const state = ref.current;
  const window = state?.rootElement.ownerDocument.defaultView;

  if (!state || !window || state.animationFrame !== null) {
    return;
  }

  state.animationFrame = window.requestAnimationFrame(() => {
    const latest = ref.current;

    if (!latest) {
      return;
    }

    latest.animationFrame = null;

    if (applyDragAutoScrollFrame(latest)) {
      scheduleDragAutoScroll(ref);
    } else {
      stopDragAutoScroll(ref);
    }
  });
};

const updateDragAutoScroll = (
  ref: PendingDragAutoScrollRef,
  state: Omit<PendingDragAutoScroll, 'animationFrame' | 'releaseCleanup'>
) => {
  if (
    !getDragAutoScrollTarget({
      clientX: state.clientX,
      clientY: state.clientY,
      rootElement: state.rootElement,
    })
  ) {
    stopDragAutoScroll(ref);
    return;
  }

  const animationFrame = ref.current?.animationFrame ?? null;
  let releaseCleanup = ref.current?.releaseCleanup ?? null;

  if (ref.current?.rootElement !== state.rootElement) {
    releaseCleanup?.();
    releaseCleanup = attachDragAutoScrollReleaseListeners(
      ref,
      state.rootElement
    );
  }

  ref.current = {
    ...state,
    animationFrame,
    releaseCleanup,
  };
  scheduleDragAutoScroll(ref);
};

export const useRootInteractionController = ({
  disabled,
  editor,
  getLastSelectionForRoot,
  getMountedViewEditor,
  ignoreBlankEditableRootClicks = false,
  root,
  selection,
  selectionBridge,
}: RootInteractionControllerOptions): RootInteractionController => {
  const pendingInteractionRef = useRef<PendingRootInteraction>(
    ignoreInteraction()
  );
  const pendingDragAutoScrollRef = useRef<PendingDragAutoScroll | null>(null);

  useEffect(
    () => () => {
      stopDragAutoScroll(pendingDragAutoScrollRef);
    },
    []
  );

  const focusRoot = useCallback(
    ({
      fallbackSelection,
      forceSelection = false,
      selection: selectionPreference = selection,
    }: {
      fallbackSelection?: RootInteractionFocusSelection;
      forceSelection?: boolean;
      selection?: RootInteractionFocusSelection;
    } = {}) => {
      const focusEditor = getMountedViewEditor(root) ?? editor;
      const currentSelection = focusEditor.read((state) =>
        state.selection.get()
      );
      const getEndSelection = (): Range => {
        const point = focusEditor.read((state) => state.points.end([]));

        return { anchor: point, focus: point };
      };
      let focusSelection =
        selectionPreference === 'end'
          ? getEndSelection()
          : selectionPreference === 'restore' &&
              (forceSelection || !currentSelection)
            ? getLastSelectionForRoot(root)
            : null;

      if (
        selectionPreference === 'restore' &&
        !focusSelection &&
        !currentSelection &&
        fallbackSelection === 'end'
      ) {
        focusSelection = getEndSelection();
      }

      if (
        selectionPreference === 'restore' &&
        !focusSelection &&
        !currentSelection
      ) {
        return;
      }

      const applyFocusSelection = () => {
        if (!focusSelection) {
          return false;
        }

        writePliteViewSelection(focusEditor, null);
        focusEditor.update((tx) => {
          tx.selection.set(focusSelection);
        });

        return true;
      };
      const appliedSelection = applyFocusSelection();

      focusPliteEditableAfterEventFrame(focusEditor);

      if (appliedSelection) {
        globalThis.setTimeout?.(() => {
          applyFocusSelection();
          focusPliteEditableAfterEventFrame(focusEditor);
        }, 0);
      }
    },
    [editor, getLastSelectionForRoot, getMountedViewEditor, root, selection]
  );

  const applyInteractionAction = useCallback(
    (
      action: RootInteractionMouseUpAction,
      options: {
        placementDOMPoint?: PliteStringPlacementDOMPoint | null;
      } = {}
    ) => {
      if (action.type === 'ignore') {
        return;
      }
      const focusEditor = getMountedViewEditor(root) ?? editor;

      if (action.type === 'set-selection') {
        const range = withInteractionRangeRoot(action.range, root);

        selectionBridge?.beforeModelSelection();
        try {
          focusEditor.api.dom
            .assertDOMNode(focusEditor)
            .focus({ preventScroll: true });
        } catch {
          // The regular focus path below handles temporarily unmounted roots.
        }
        writePliteViewSelection(
          focusEditor,
          hasContentRootOwnerBetweenDragEndpoints({
            anchor: {
              isDOMCoverageBoundary: false,
              owner: null,
              point: range.anchor,
              root,
            },
            editor: focusEditor,
            focus: {
              isDOMCoverageBoundary: false,
              owner: null,
              point: range.focus,
              root,
            },
          })
            ? createPliteViewSelection(
                createContentRootProjectionGraph(
                  focusEditor,
                  findContentRootOwners(focusEditor)
                ),
                {
                  anchor: { point: range.anchor },
                  focus: { point: range.focus },
                }
              )
            : null
        );
        writeCollapsedModelSelectionDOMPreference(
          focusEditor,
          range,
          options.placementDOMPoint ?? null
        );
        focusEditor.update((tx) => {
          tx.selection.set(range);
        });
        focusPliteEditableAfterEventFrame(focusEditor);
        selectionBridge?.syncDOMSelectionToEditor();
        schedulePliteReactFocus(() => {
          selectionBridge?.syncDOMSelectionToEditor();
        });
        return;
      }

      focusRoot({
        fallbackSelection: action.fallbackSelection,
        forceSelection: action.selection === 'restore',
        selection: action.selection,
      });
    },
    [editor, focusRoot, getMountedViewEditor, root, selectionBridge]
  );

  const onMouseDownCapture = useCallback<MouseEventHandler<HTMLElement>>(
    (event) =>
      measureRootMouseDownPhase('root-mousedown.capture', () => {
        if (disabled || event.defaultPrevented) {
          return;
        }

        stopDragAutoScroll(pendingDragAutoScrollRef);

        const target = resolveRootInteractionTarget({
          currentTarget: event.currentTarget,
          target: event.target,
        });
        const editableRoot =
          target.kind === 'editable-root' || target.kind === 'native-editable'
            ? target.editableRoot
            : null;
        let action = resolveRootInteractionMouseDown({
          editableRootFocused: editableRoot
            ? isRootInteractionEditableFocused(editableRoot)
            : undefined,
          target,
        });
        const nativeEditableTextTarget =
          target.kind === 'native-editable' &&
          !!target.target.closest(NATIVE_EDITABLE_TEXT_TARGET);
        const nativeEditableMultiClick =
          nativeEditableTextTarget && event.detail > 1;
        const nativeEditableSelectedTextTarget =
          nativeEditableTextTarget &&
          isPointInsideDOMSelection({
            clientX: event.clientX,
            clientY: event.clientY,
            target: event.currentTarget,
          });
        const nativeEditableModifiedClick =
          nativeEditableTextTarget &&
          (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);

        if (
          nativeEditableMultiClick ||
          nativeEditableSelectedTextTarget ||
          nativeEditableModifiedClick
        ) {
          action = { type: 'ignore' };
        }

        const shouldResolveRootChromeFromCoordinates =
          !nativeEditableMultiClick &&
          !nativeEditableSelectedTextTarget &&
          !nativeEditableModifiedClick &&
          (action.type === 'place-editable-root' ||
            target.kind === 'editable-root' ||
            target.kind === 'native-editable' ||
            target.kind === 'root-chrome');
        const rootChromeCoordinatePlacement =
          shouldResolveRootChromeFromCoordinates
            ? measureRootMouseDownPhase(
                'root-mousedown.resolve-coordinate-placement',
                () =>
                  getEditableRootChromeCoordinatePlacement({
                    editor,
                    event,
                    includeInsideString: target.kind === 'native-editable',
                  })
              )
            : null;
        const rootEdgeCoordinatePlacement =
          rootChromeCoordinatePlacement?.source === 'root-edge';
        const placeRootChromeFromCoordinates =
          rootChromeCoordinatePlacement !== null;
        const nativeEditableChromeTarget =
          target.kind === 'native-editable' &&
          !target.target.closest(NATIVE_EDITABLE_TEXT_TARGET);
        const focusedNativeEditableCoordinateTarget =
          !nativeEditableMultiClick &&
          !nativeEditableModifiedClick &&
          ignoreBlankEditableRootClicks &&
          action.type === 'ignore' &&
          target.kind === 'native-editable';
        const ignoreBlankNativeEditableClick =
          focusedNativeEditableCoordinateTarget &&
          (!placeRootChromeFromCoordinates || rootEdgeCoordinatePlacement);
        const rootChromeSelfTarget =
          target.kind === 'root-chrome' &&
          target.target === event.currentTarget;
        const coordinatePlacementOwnsMouseDown =
          placeRootChromeFromCoordinates &&
          !rootEdgeCoordinatePlacement &&
          (action.type !== 'ignore' ||
            focusedNativeEditableCoordinateTarget ||
            nativeEditableChromeTarget ||
            target.kind === 'editable-root' ||
            (target.kind === 'root-chrome' && !rootChromeSelfTarget));
        const coordinateDragRootChromePlacement =
          coordinatePlacementOwnsMouseDown && !rootEdgeCoordinatePlacement;
        const ignoreBlankEditableRootClick =
          ignoreBlankEditableRootClicks &&
          target.kind === 'editable-root' &&
          (action.type === 'place-editable-root' || action.type === 'ignore') &&
          (!placeRootChromeFromCoordinates || rootEdgeCoordinatePlacement);
        const ignoreBlankRootChromeClick =
          ignoreBlankEditableRootClicks &&
          action.type === 'activate-root' &&
          target.kind === 'root-chrome' &&
          (!placeRootChromeFromCoordinates || rootEdgeCoordinatePlacement);
        const ignoreBlankNativeEditableChromeClick =
          ignoreBlankEditableRootClicks &&
          nativeEditableChromeTarget &&
          (!placeRootChromeFromCoordinates || rootEdgeCoordinatePlacement);

        if (
          ignoreBlankEditableRootClick ||
          ignoreBlankNativeEditableClick ||
          ignoreBlankRootChromeClick ||
          ignoreBlankNativeEditableChromeClick
        ) {
          action = { type: 'ignore' };
        } else if (
          action.type === 'place-native-editable' ||
          coordinateDragRootChromePlacement
        ) {
          action = { type: 'place-native-editable' };
        }

        const preventNativeSelection =
          action.type === 'place-native-editable' ||
          coordinatePlacementOwnsMouseDown ||
          ignoreBlankEditableRootClick ||
          ignoreBlankNativeEditableClick ||
          ignoreBlankRootChromeClick ||
          ignoreBlankNativeEditableChromeClick;

        const focusEditor = getMountedViewEditor(root) ?? editor;
        const startRange = rootChromeCoordinatePlacement
          ? measureRootMouseDownPhase(
              'root-mousedown.resolve-start-range',
              () =>
                resolvePliteStringPlacementRange({
                  editor: focusEditor,
                  placement: rootChromeCoordinatePlacement,
                }) ?? focusEditor.api.dom.resolveEventRange(event.nativeEvent)
            )
          : action.type === 'place-native-editable'
            ? measureRootMouseDownPhase(
                'root-mousedown.resolve-start-range',
                () => focusEditor.api.dom.resolveEventRange(event.nativeEvent)
              )
            : null;
        const placementDOMPoint = rootChromeCoordinatePlacement
          ? getPliteStringPlacementDOMPoint(rootChromeCoordinatePlacement)
          : null;

        if (ignoreBlankEditableRootClick && !startRange) {
          action = { type: 'ignore' };
        }

        const existingSelectionProjectedDragEndpoint = nativeEditableTextTarget
          ? measureRootMouseDownPhase(
              'root-mousedown.resolve-existing-selection-endpoint',
              () =>
                resolveExistingSelectionProjectedDragEndpoint({
                  editor,
                  event,
                  getMountedViewEditor,
                })
            )
          : null;
        const projectedDragEndpoint =
          nativeEditableMultiClick ||
          ignoreBlankEditableRootClick ||
          ignoreBlankNativeEditableClick ||
          ignoreBlankRootChromeClick ||
          rootEdgeCoordinatePlacement
            ? null
            : (existingSelectionProjectedDragEndpoint ??
              measureRootMouseDownPhase(
                'root-mousedown.resolve-projected-drag-endpoint',
                () =>
                  resolveProjectedDragEndpoint({
                    editor,
                    event,
                    getMountedViewEditor,
                    range: startRange ?? undefined,
                    root: rootChromeCoordinatePlacement ? root : undefined,
                  })
              ));

        const projectedDragEditor = projectedDragEndpoint?.owner
          ? (getMountedViewEditor(projectedDragEndpoint.owner.ownerRoot) ??
            editor)
          : editor;

        pendingProjectedDrag = projectedDragEndpoint
          ? {
              clientX: event.clientX,
              clientY: event.clientY,
              editor: projectedDragEditor,
              endpoint: projectedDragEndpoint,
            }
          : null;

        pendingInteractionRef.current = {
          action,
          clientX: event.clientX,
          clientY: event.clientY,
          coordinateDragSelection: coordinateDragRootChromePlacement,
          currentRange: startRange,
          nativeSelectedTextClick: nativeEditableSelectedTextTarget,
          placementDOMPoint,
          preventNativeSelection,
          startRange,
        };

        if (action.type === 'ignore') {
          if (preventNativeSelection) {
            event.preventDefault();
          }

          return;
        }

        if (
          ('preventDefault' in action && action.preventDefault) ||
          preventNativeSelection
        ) {
          event.preventDefault();
        }

        if (action.type === 'place-editable-root') {
          return;
        }

        if (action.type === 'place-native-editable') {
          if (startRange) {
            measureRootMouseDownPhase(
              'root-mousedown.apply-place-native-selection',
              () =>
                applyInteractionAction(
                  {
                    range: startRange,
                    type: 'set-selection',
                  },
                  { placementDOMPoint }
                )
            );
          }
          return;
        }

        schedulePliteReactFocus(() => {
          applyInteractionAction(
            resolveRootInteractionMouseUp({
              eventRange: null,
              pendingAction: action,
              selection,
            })
          );
        });
      }),
    [
      applyInteractionAction,
      disabled,
      editor,
      getMountedViewEditor,
      ignoreBlankEditableRootClicks,
      root,
      selection,
    ]
  );

  const onMouseMoveCapture = useCallback<MouseEventHandler<HTMLElement>>(
    (event) => {
      const pendingInteraction = pendingInteractionRef.current;
      const projectedDrag = pendingProjectedDrag;

      if (event.buttons === 0) {
        pendingProjectedDrag = null;
        stopDragAutoScroll(pendingDragAutoScrollRef);
        return;
      }

      if (
        projectedDrag &&
        applyProjectedDragSelectionFromEvent({
          event,
          getMountedViewEditor,
          projectedDrag,
          selectionBridge,
        })
      ) {
        stopDragAutoScroll(pendingDragAutoScrollRef);
        return;
      }

      if (disabled || !canApplyCoordinateDragSelection(pendingInteraction)) {
        stopDragAutoScroll(pendingDragAutoScrollRef);
        return;
      }

      const focusEditor = getMountedViewEditor(root) ?? editor;
      const eventRange = focusEditor.api.dom.resolveEventRange(
        event.nativeEvent
      );

      if (
        pendingInteraction.startRange &&
        hasPointerMoved(pendingInteraction, event)
      ) {
        event.preventDefault();

        if (eventRange) {
          const nextRange = createDragSelectionRange({
            endRange: eventRange,
            startRange: pendingInteraction.startRange,
          });
          const currentRange =
            pendingInteraction.currentRange ?? pendingInteraction.startRange;
          const regressiveRange = isRegressiveDragSelectionRange({
            currentRange,
            delta: event.clientY - pendingInteraction.clientY,
            nextRange,
            startRange: pendingInteraction.startRange,
          });

          if (!regressiveRange) {
            applyModelDragSelection({
              editor: focusEditor,
              range: nextRange,
              root,
              selectionBridge,
            });
            pendingInteraction.currentRange = nextRange;
          }
        }

        updateDragAutoScroll(pendingDragAutoScrollRef, {
          clientX: event.clientX,
          clientY: event.clientY,
          currentRange:
            pendingInteraction.currentRange ?? pendingInteraction.startRange,
          editor: focusEditor,
          root,
          rootElement: event.currentTarget,
          selectionBridge,
          startRange: pendingInteraction.startRange,
        });
      } else {
        stopDragAutoScroll(pendingDragAutoScrollRef);
      }
    },
    [disabled, editor, getMountedViewEditor, root, selectionBridge]
  );

  const onMouseUpCapture = useCallback<MouseEventHandler<HTMLElement>>(
    (event) => {
      const pendingInteraction = pendingInteractionRef.current;
      pendingInteractionRef.current = ignoreInteraction();
      stopDragAutoScroll(pendingDragAutoScrollRef);
      const { action: pendingAction } = pendingInteraction;
      const projectedDrag = pendingProjectedDrag;
      pendingProjectedDrag = null;

      if (
        projectedDrag &&
        applyProjectedDragSelectionFromEvent({
          event,
          getMountedViewEditor,
          projectedDrag,
          selectionBridge,
        })
      ) {
        return;
      }

      if (pendingAction.type === 'ignore') {
        const currentTarget = event.currentTarget;
        const target = resolveRootInteractionTarget({
          currentTarget,
          target: event.target,
        });
        const nativeEditableTextTarget =
          target.kind === 'native-editable' &&
          !!target.target.closest(NATIVE_EDITABLE_TEXT_TARGET);
        const expandedDOMSelection =
          getExpandedDOMSelectionInTarget(currentTarget);
        const pointerMoved = hasPointerMoved(pendingInteraction, event);

        if (!disabled && (nativeEditableTextTarget || expandedDOMSelection)) {
          selectionBridge?.importDOMSelection();
          if (
            expandedDOMSelection &&
            shouldReplayMouseUpDOMSelection({
              hasExpandedDOMRange: true,
              isFirefox: needsMouseUpDOMSelectionReplay(currentTarget),
              nativeSelectedTextClick:
                pendingInteraction.nativeSelectedTextClick,
              pointerMoved,
            })
          ) {
            schedulePliteReactFocus(() => {
              if (!hasExpandedDOMSelectionInTarget(currentTarget)) {
                restoreDOMSelectionInTarget(
                  currentTarget,
                  expandedDOMSelection
                );
                selectionBridge?.importDOMSelection();
              }
            });
          } else if (nativeEditableTextTarget) {
            schedulePliteReactFocus(() => {
              selectionBridge?.importDOMSelection();
            });
          }
        }

        return;
      }

      if (disabled) {
        return;
      }

      if (
        ('preventDefault' in pendingAction && pendingAction.preventDefault) ||
        pendingInteraction.preventNativeSelection
      ) {
        event.preventDefault();
      }

      if (
        pendingAction.type === 'place-native-editable' &&
        hasExpandedDOMSelectionInTarget(event.currentTarget)
      ) {
        selectionBridge?.importDOMSelection();
        return;
      }

      const focusEditor = getMountedViewEditor(root) ?? editor;
      const eventRange = focusEditor.api.dom.resolveEventRange(
        event.nativeEvent
      );
      const pointerMoved = hasPointerMoved(pendingInteraction, event);

      if (
        canApplyCoordinateDragSelection(pendingInteraction) &&
        eventRange &&
        pendingInteraction.startRange &&
        pointerMoved
      ) {
        const nextRange = createDragSelectionRange({
          endRange: eventRange,
          startRange: pendingInteraction.startRange,
        });
        const currentRange =
          pendingInteraction.currentRange ?? pendingInteraction.startRange;
        const regressiveRange = isRegressiveDragSelectionRange({
          currentRange,
          delta: event.clientY - pendingInteraction.clientY,
          nextRange,
          startRange: pendingInteraction.startRange,
        });

        if (regressiveRange) {
          return;
        }

        applyInteractionAction({
          range: nextRange,
          type: 'set-selection',
        });
        return;
      }

      if (
        canApplyCoordinateDragSelection(pendingInteraction) &&
        pendingInteraction.startRange &&
        pointerMoved
      ) {
        return;
      }

      if (
        pendingAction.type === 'place-native-editable' &&
        pendingInteraction.startRange &&
        !pointerMoved
      ) {
        applyInteractionAction(
          {
            range: pendingInteraction.startRange,
            type: 'set-selection',
          },
          { placementDOMPoint: pendingInteraction.placementDOMPoint }
        );
        return;
      }

      if (
        (pendingAction.type === 'activate-root' ||
          pendingAction.type === 'place-editable-root') &&
        pendingInteraction.startRange &&
        !pointerMoved
      ) {
        applyInteractionAction(
          {
            range: pendingInteraction.startRange,
            type: 'set-selection',
          },
          { placementDOMPoint: pendingInteraction.placementDOMPoint }
        );
        return;
      }

      if (
        pendingAction.type === 'place-editable-root' &&
        !pendingInteraction.startRange &&
        pointerMoved
      ) {
        return;
      }

      applyInteractionAction(
        resolveRootInteractionMouseUp({
          eventRange,
          pendingAction,
          selection,
        })
      );
    },
    [
      applyInteractionAction,
      disabled,
      editor,
      getMountedViewEditor,
      root,
      selection,
      selectionBridge,
    ]
  );

  return {
    onMouseDownCapture,
    onMouseMoveCapture,
    onMouseUpCapture,
  };
};
