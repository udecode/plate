import {
  type MouseEvent,
  type MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  type NodeKey,
  PathApi,
  type Point,
  PointApi,
  type Range,
  RangeApi,
  type RootKey,
  type Selection,
  SelectionApi,
  TextApi,
} from '../..';
import {
  getPlacementGeneration,
  liftShownTarget,
} from '../../core/view-carets';
import { isDOMNode } from '../../dom';
import type {
  DOMPhase,
  DOMPhaseScheduler,
  DOMPhaseTiming,
} from '../../dom/internal';
import { getDragAutoScrollTarget } from '../../dom/plugin/dom-drag-scroll';
import {
  isGeckoDOMHost,
  usesAppleDOMHotkeys,
} from '../../dom/utils/environment';
import { writeDOMSelection } from '../../dom/utils/selection-writes';
import {
  type focusPliteEditable,
  focusPliteEditableAfterEventFrame,
} from '../hooks/focus-plite-editable';
import { getPliteNodePathFromDOMElement } from '../hooks/use-plite-node-ref';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { profilePliteReactDuration } from '../render-profiler';
import { MAIN_ROOT_KEY } from '../root-key';
import {
  getPliteRootBoundaryPoint,
  PliteViewBoundaryGraph,
  type PliteViewBoundaryGraphModel,
  type PliteViewBoundaryPoint,
} from '../view-boundary-graph';
import {
  createPliteViewSelection,
  readPliteViewSelection,
  refreshPliteViewSelection,
  writePliteViewSelection,
} from '../view-selection';
import {
  type ContentRootOwner,
  createContentRootViewBoundaryGraph,
  findContentRootOwners,
} from './content-root-navigation';
import {
  getContentRootOwnerFromTarget,
  getEditableRootFromTarget,
  isSameOwner,
  mouseEventTargetToElement,
} from './content-root-owner-target';
import {
  findCrossingContentRootOwners,
  readRootNodes,
} from './content-root-owners';
import {
  findMountedEditableDOMRuntime,
  focusPressedView,
  getMountedEditableDOMRuntime,
  type EditableDOMRuntime,
} from './editable-dom-runtime';
import type { EditableDOMSelectionSyncOptions } from './input-controller';
import { writeCollapsedModelSelectionDOMPreference } from './model-selection-dom-preference';
import {
  classifyPlacedPress,
  getPlacedUnit,
  getShiftSpanFrom,
  isTapOnTextBlock,
  type PlacedPointer,
  type PlacedPress,
  type PlacedPressKind,
  type PlacedUnit,
  placedSelectionWord,
  spanPlacedUnits,
  watchSelectionDrag,
} from './placed-drag';
import {
  getEditableRootPliteStringCoordinatePlacement,
  getPliteStringDocumentOffset,
  getPliteStringEdgeOffset,
  getPliteStringPlacementDOMPoint,
  type PliteStringCoordinatePlacement,
  type PliteStringPlacementDOMPoint,
} from './plite-string-coordinate-placement';
import {
  getExpandedDOMSelectionInTarget,
  hasExpandedDOMSelectionInTarget,
  isPointInsideDOMSelection,
  needsMouseUpDOMSelectionReplay,
  restoreDOMSelectionInTarget,
  shouldReplayMouseUpDOMSelection,
} from './root-interaction-dom-selection-replay';
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
  dispatchCommand,
  editorCommands,
  getSelection as getEditorSelection,
  getSelectionDOMRange,
  toInternalRoot,
} from './runtime-editor-api';
import { canUseNativeViewSelection } from './selection-projected-dom';
import {
  readSelectionAnnotation,
  tripleClickedBlock,
} from './selection-triple-click';
import { settleViewFocus } from './set-root-endpoints';
import { activateViewCaret } from './view-caret-restore';
import type { ViewLines } from './view-lines';

export { shouldReplayMouseUpDOMSelection } from './root-interaction-dom-selection-replay';

type PliteFocusableEditor = Parameters<typeof focusPliteEditable>[0];
const NATIVE_EDITABLE_TEXT_TARGET =
  '[data-editor-string], [data-editor-zero-width], [data-editor-leaf], [data-editor-node="text"]';

export type RootInteractionEditor = ReactRuntimeEditor &
  PliteFocusableEditor & {
    api: ReactRuntimeEditor['api'] &
      PliteFocusableEditor['api'] & {
        dom: ReactRuntimeEditor['api']['dom'] & {
          resolveEventRange: (event: Event) => Range | null;
        };
      };
  };

export type RootInteractionControllerOptions = {
  disabled: boolean;
  editor: RootInteractionEditor;
  getMountedViewEditor: (root: RootKey) => RootInteractionEditor | null;
  ignoreBlankEditableRootClicks?: boolean;
  root: RootKey;
  runtime?: EditableDOMRuntime;
  selection: RootInteractionSelectionMode;
  selectionBridge?: {
    beginProjectedDrag: () => void;
    beforeModelSelection: () => void;
    finishProjectedDrag: () => void;
    importDOMSelection: () => void;
    isViewportBackedSelection: (selection: Range | null) => boolean;
    syncDOMSelectionToEditor: (
      options?: EditableDOMSelectionSyncOptions
    ) => void;
  };
  viewLines?: ViewLines | null;
};

export type RootInteractionController = {
  onMouseDownCapture: MouseEventHandler<HTMLElement>;
  onMouseMoveCapture: MouseEventHandler<HTMLElement>;
  onMouseUpCapture: MouseEventHandler<HTMLElement>;
};

export const shouldRestoreMouseUpDOMSelection = ({
  currentSelection,
  replaySelection,
  sameDocument,
  sameInteraction,
}: {
  currentSelection: Selection;
  replaySelection: Selection;
  sameDocument: boolean;
  sameInteraction: boolean;
}) => {
  if (!sameDocument || !sameInteraction) return false;
  if (SelectionApi.equals(currentSelection, replaySelection)) return true;

  return (
    currentSelection?.kind === 'text' &&
    replaySelection?.kind === 'text' &&
    RangeApi.isExpanded(replaySelection) &&
    RangeApi.isBackward(replaySelection) &&
    RangeApi.isCollapsed(currentSelection) &&
    PointApi.equals(currentSelection.anchor, replaySelection.focus)
  );
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
  affinity?: 'backward' | 'forward';
  isDOMCoverageBoundary: boolean;
  owner?: ContentRootOwner | null;
  point: Point;
  root: RootKey;
};

type PendingProjectedDrag = {
  browserOwned: boolean;
  clientX: number;
  clientY: number;
  editor: RootInteractionEditor;
  endpoint: RootInteractionDragEndpoint;
  finish: () => void;
  /**
   * Whether the drag holds a model selection the set law settled. WebKit runs
   * its own drag selection after a cancelled mousemove, so the drag projects
   * until release and then draws its selection again.
   */
  ownsSettledSelection: boolean;
  wroteViewSelection: boolean;
  releaseCleanup: () => void;
};

type PendingDragAutoScroll = {
  cancelScheduledFrame: (() => void) | null;
  clientX: number;
  clientY: number;
  currentRange: Range;
  editor: RootInteractionEditor;
  follow?: (clientX: number, clientY: number) => void;
  releaseCleanup: (() => void) | null;
  root: RootKey;
  rootElement: HTMLElement;
  selectionBridge?: RootInteractionControllerOptions['selectionBridge'];
  startRange: Range;
};

type PendingDragAutoScrollRef = {
  current: PendingDragAutoScroll | null;
};

type PlacedDrag = {
  currentRange: Range;
  detach: () => void;
  editor: RootInteractionEditor;
  kind: PlacedPressKind;
  moved: boolean;
  placementDOMPoint: PliteStringPlacementDOMPoint | null;
  pressInRoot: Readonly<{ x: number; y: number }>;
  pressSelection: Range;
  projecting: boolean;
  rootElement: HTMLElement;
  spanFrom: PlacedUnit;
  viewLines: ViewLines;
  word: Range | null;
};

type ArmedPress = Readonly<{
  detach: () => void;
  lines: ViewLines;
  pressInRoot: Readonly<{ x: number; y: number }>;
  rootElement: HTMLElement;
  target: Element;
}>;

let pendingProjectedDrag: PendingProjectedDrag | null = null;

const setNativeSelectionDragActive = (
  runtime: EditableDOMRuntime | undefined,
  active: boolean
) => {
  if (runtime) {
    runtime.inputController.state.isNativeSelectionDragActive = active;
  }
};

const finishPendingProjectedDrag = (projectedDrag: PendingProjectedDrag) => {
  projectedDrag.releaseCleanup();
  projectedDrag.finish();
  if (pendingProjectedDrag === projectedDrag) {
    pendingProjectedDrag = null;
  }
};

const attachProjectedDragReleaseListeners = (
  projectedDrag: PendingProjectedDrag,
  rootElement: HTMLElement
) => {
  const document = rootElement.ownerDocument;
  const window = document.defaultView;
  const release = () => {
    if (pendingProjectedDrag === projectedDrag) {
      finishPendingProjectedDrag(projectedDrag);
    }
  };
  const releaseOnBlur = () => {
    finishPendingProjectedDrag(projectedDrag);
  };

  document.addEventListener('mouseup', release);
  window?.addEventListener('blur', releaseOnBlur);

  return () => {
    document.removeEventListener('mouseup', release);
    window?.removeEventListener('blur', releaseOnBlur);
  };
};

const attachPlacedDragListeners = (
  rootElement: HTMLElement,
  {
    onBlur,
    onMove,
    onUp,
  }: {
    onBlur: () => void;
    onMove: (pointer: globalThis.MouseEvent) => void;
    onUp: (pointer: globalThis.MouseEvent) => void;
  }
) => {
  const document = rootElement.ownerDocument;
  const window = document.defaultView;
  const outside =
    (handle: (pointer: globalThis.MouseEvent) => void) =>
    (pointer: globalThis.MouseEvent) => {
      if (
        !(isDOMNode(pointer.target) && rootElement.contains(pointer.target))
      ) {
        handle(pointer);
      }
    };
  const move = outside(onMove);
  const up = outside(onUp);

  document.addEventListener('mousemove', move, true);
  document.addEventListener('mouseup', up, true);
  window?.addEventListener('blur', onBlur);

  return () => {
    document.removeEventListener('mousemove', move, true);
    document.removeEventListener('mouseup', up, true);
    window?.removeEventListener('blur', onBlur);
  };
};

const getKeptTripleClickedBlock = (drag: PlacedDrag, range: Range) =>
  drag.spanFrom.block && RangeApi.equals(range, drag.spanFrom.range)
    ? drag.spanFrom.block
    : null;

const PLACED_DRAG_DEAD_ZONE_PX = 4;

const hasPlacedPointerMoved = (drag: PlacedDrag, pointer: PlacedPointer) => {
  const root = drag.rootElement.getBoundingClientRect();

  return (
    Math.abs(pointer.clientX - root.left - drag.pressInRoot.x) >
      PLACED_DRAG_DEAD_ZONE_PX ||
    Math.abs(pointer.clientY - root.top - drag.pressInRoot.y) >
      PLACED_DRAG_DEAD_ZONE_PX
  );
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
    '[data-editor-dom-coverage-boundary]'
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

  return findCrossingContentRootOwners(editor).some(
    (owner) =>
      owner.ownerRoot === anchor.root &&
      PathApi.compare(owner.ownerPath, start.path) >= 0 &&
      PathApi.compare(owner.ownerPath, end.path) <= 0
  );
};

const shouldUseModelProjectedDragSelection = ({
  anchor,
  focus,
  settled,
}: {
  anchor: RootInteractionDragEndpoint;
  focus: RootInteractionDragEndpoint;
  settled: boolean;
}) =>
  anchor.root === focus.root &&
  isSameOwner(anchor.owner, focus.owner) &&
  (settled || anchor.isDOMCoverageBoundary || focus.isDOMCoverageBoundary);

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

// A content root owner renders no model text, so the native hit test on its
// chrome returns an engine-dependent point, which can sit in another block.
const findOwnerAtChromeTarget = (
  owners: readonly ContentRootOwner[],
  root: RootKey,
  target: EventTarget | null
) => {
  if (root !== MAIN_ROOT_KEY || getEditableRootFromTarget(target) !== root) {
    return null;
  }

  const element = mouseEventTargetToElement(target)?.closest(
    '[data-editor-node="element"][data-editor-path]'
  );
  const path = element ? getPliteNodePathFromDOMElement(element) : null;

  return path
    ? (owners.find(
        (owner) =>
          owner.ownerRoot === root && PathApi.equals(owner.ownerPath, path)
      ) ?? null)
    : null;
};

const resolveContentRootOwnerChromeEdge = ({
  event,
  owner,
}: {
  event: MouseEvent<HTMLElement>;
  owner: ContentRootOwner;
}): 'end' | 'start' => {
  const element = mouseEventTargetToElement(event.target);
  const ownerElement = element?.closest<HTMLElement>(
    `[data-editor-node="element"][data-editor-path="${owner.ownerPath.join(
      ','
    )}"]`
  );
  const slotElement = ownerElement?.querySelector<HTMLElement>(
    '[data-editor-content-root-slot]'
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
  const owner =
    findOwnerAtChromeTarget(owners, root, event.target) ??
    findOwnerContainingPoint(owners, root, point);

  if (!owner) {
    return null;
  }

  const edge = resolveContentRootOwnerChromeEdge({ event, owner });
  const childPoint = editor.read((state) =>
    getPliteRootBoundaryPoint(
      readRootNodes(editor, state, owner.childRoot),
      edge
    )
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
  const eventRange =
    resolvedRange ?? targetEditor.api.dom.resolveEventRange(event.nativeEvent);
  const coordinatePlacement = eventRange
    ? null
    : getEditableRootChromeCoordinatePlacement({
        editor: targetEditor,
        event,
        includeInsideString: true,
      });
  const range =
    eventRange ??
    (coordinatePlacement
      ? resolvePliteStringPlacementRange({
          editor: targetEditor,
          placement: coordinatePlacement,
        })
      : null);

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
  const editableRoot = element?.closest<HTMLElement>('[data-editor="true"]');

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
  const selection = getSelectionDOMRange(
    targetEditor,
    getEditorSelection(targetEditor)
  );

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

const toDragBoundaryPoint = (
  graph: PliteViewBoundaryGraphModel,
  owners: readonly ContentRootOwner[],
  endpoint: RootInteractionDragEndpoint
): PliteViewBoundaryPoint | null => {
  const owner = resolveKnownOwner(owners, endpoint.owner);

  if (endpoint.owner && !owner) {
    return null;
  }

  const point = {
    ...(endpoint.affinity ? { affinity: endpoint.affinity } : {}),
    ...(owner ? { owner } : {}),
    point: endpoint.point,
  };

  // The graph holds the view the drag started in: its root and the content
  // roots it owns. A sibling root under the pointer, such as another root of a
  // multi-root document, is outside that view, so the drag stays with the
  // browser and the selection stays in the root where it started.
  return PliteViewBoundaryGraph.resolvePointNode(graph, point) ? point : null;
};

const applyProjectedDragSelection = ({
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

  const owners = findContentRootOwners(editor);
  const graph = createContentRootViewBoundaryGraph(editor, owners);
  const anchorPoint = toDragBoundaryPoint(graph, owners, anchor);
  const focusPoint = toDragBoundaryPoint(graph, owners, focus);

  if (!anchorPoint || !focusPoint) {
    return false;
  }

  selectionBridge?.beginProjectedDrag();
  writePliteViewSelection(
    editor,
    createPliteViewSelection(graph, {
      anchor: anchorPoint,
      focus: focusPoint,
    }),
    {
      place: () =>
        collapseModelSelectionToProjectedDragAnchor({ anchor, editor }),
    }
  );

  return true;
};

const selectShown = (view: RootInteractionEditor, shown: Range) => {
  const target = liftShownTarget(view, shown);

  if (target) dispatchCommand(view, editorCommands.select, { target });
};

const collapseModelSelectionToProjectedDragAnchor = ({
  anchor,
  editor,
}: {
  anchor: RootInteractionDragEndpoint;
  editor: RootInteractionEditor;
}) => {
  const viewRoot = toInternalRoot(editor.read((state) => state.view.root()));

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
  const selection = editor.read((state) => state.selection());

  if (selection && RangeApi.equals(selection, range)) {
    return;
  }

  selectShown(editor, range);
};

const applyModelProjectedDragSelection = ({
  anchor,
  editor,
  focus,
  projecting,
  selectionBridge,
}: {
  anchor: RootInteractionDragEndpoint;
  editor: RootInteractionEditor;
  focus: RootInteractionDragEndpoint;
  projecting: boolean;
  selectionBridge?: RootInteractionControllerOptions['selectionBridge'];
}) => {
  if (projecting) {
    selectionBridge?.beginProjectedDrag();
  } else if (isSameProjectedEndpoint(anchor, focus)) {
    return false;
  } else {
    selectionBridge?.beforeModelSelection();
  }
  writePliteViewSelection(editor, null);
  selectShown(editor, {
    anchor: anchor.point,
    focus: focus.point,
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
    '[data-editor="true"]'
  );
  const currentTargetEditableRoot = event.currentTarget.matches(
    '[data-editor="true"]'
  )
    ? event.currentTarget
    : event.currentTarget.querySelector<HTMLElement>('[data-editor="true"]');
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
    target: element,
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
    '[data-editor-node="text"]'
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

  const node = editor.read((state) => state.nodes.get(path)?.[0]) ?? null;

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

const resolveCoordinatePlacementTarget = ({
  editor,
  event,
  placement,
}: {
  editor: RootInteractionEditor;
  event: MouseEvent<HTMLElement>;
  placement: NonNullable<PliteStringCoordinatePlacement>;
}) => {
  const range = resolvePliteStringPlacementRange({ editor, placement });

  if (
    range &&
    placement.offset == null &&
    placement.string.closest('[data-editor-text-flow-host="true"]')
  ) {
    const native = editor.api.dom.resolveEventRange(event.nativeEvent);

    if (
      native &&
      RangeApi.isCollapsed(native) &&
      PathApi.equals(native.anchor.path, range.anchor.path) &&
      native.anchor.offset !== range.anchor.offset
    ) {
      return { placementDOMPoint: null, range: native };
    }
  }

  return {
    placementDOMPoint: getPliteStringPlacementDOMPoint(placement),
    range: range ?? editor.api.dom.resolveEventRange(event.nativeEvent),
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

const isDragSelectionOppositePointerDirection = ({
  delta,
  nextRange,
  startRange,
}: {
  delta: number;
  nextRange: Range;
  startRange: Range;
}) => {
  const startPoint = RangeApi.start(startRange);
  const nextFocus = nextRange.focus;
  const nextProgress = comparePoints(nextFocus, startPoint);

  if (delta > 0) {
    return nextProgress < 0;
  }

  if (delta < 0) {
    return nextProgress > 0;
  }

  return false;
};

const isRegressiveDragAutoScrollRange = ({
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
  if (
    isDragSelectionOppositePointerDirection({
      delta,
      nextRange,
      startRange,
    })
  ) {
    return true;
  }

  const startPoint = RangeApi.start(startRange);
  const currentFocus = currentRange.focus;
  const nextFocus = nextRange.focus;
  const currentProgress = comparePoints(currentFocus, startPoint);

  if (delta > 0) {
    return currentProgress > 0 && comparePoints(nextFocus, currentFocus) < 0;
  }

  if (delta < 0) {
    return currentProgress < 0 && comparePoints(nextFocus, currentFocus) > 0;
  }

  return false;
};

const isRootLocalRange = (range: Range | null, root: RootKey) =>
  !range || (range.anchor.root ?? root) === root;

const canApplyCoordinateDragSelection = (
  pendingInteraction: PendingRootInteraction,
  root: RootKey
) =>
  isRootLocalRange(pendingInteraction.startRange, root) &&
  (pendingInteraction.action.type === 'place-native-editable' ||
    pendingInteraction.coordinateDragSelection);

const clearDOMSelectionFromEvent = (event: MouseEvent<HTMLElement>) => {
  writeDOMSelection(
    event.currentTarget.getRootNode() as Document | ShadowRoot,
    null
  );
};

const shouldIgnoreDragTarget = (event: MouseEvent<HTMLElement>) => {
  const target = resolveRootInteractionTarget({
    currentTarget: event.currentTarget,
    target: event.target,
  });

  return target.kind === 'external' || target.kind === 'interactive-descendant';
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

  const resolvedFocus = resolveProjectedDragEndpoint({
    editor: projectedDrag.editor,
    event,
    getMountedViewEditor,
  });

  if (!resolvedFocus) {
    return false;
  }
  const focus = settleViewFocus(
    projectedDrag.editor,
    projectedDrag.endpoint,
    resolvedFocus
  );

  const shouldUseView =
    projectedDrag.wroteViewSelection ||
    shouldUseViewProjectedDragSelection({
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
      selectionBridge,
    });
  if (appliedView) {
    projectedDrag.wroteViewSelection = true;
  }
  const settled = projectedDrag.ownsSettledSelection || focus !== resolvedFocus;
  const shouldUseModel =
    !appliedView &&
    shouldUseModelProjectedDragSelection({
      anchor: projectedDrag.endpoint,
      focus,
      settled,
    });
  const appliedModel =
    shouldUseModel &&
    applyModelProjectedDragSelection({
      anchor: projectedDrag.endpoint,
      editor: projectedDrag.editor,
      focus,
      projecting: settled,
      selectionBridge,
    });

  if (!(appliedView || appliedModel)) {
    return false;
  }
  if (appliedModel && settled) {
    projectedDrag.ownsSettledSelection = true;
  }

  event.preventDefault();
  const viewSelection = readPliteViewSelection(projectedDrag.editor);
  if (
    (appliedModel && settled) ||
    (viewSelection &&
      canUseNativeViewSelection(projectedDrag.editor, viewSelection))
  ) {
    selectionBridge?.syncDOMSelectionToEditor({ preserveScroll: true });
  } else {
    clearDOMSelectionFromEvent(event);
  }

  return true;
};

const applyModelDragSelection = ({
  block = null,
  editor,
  projecting = false,
  range,
  root,
  selectionBridge,
  word = null,
}: {
  block?: NodeKey | null;
  editor: RootInteractionEditor;
  projecting?: boolean;
  range: Range;
  root: RootKey;
  selectionBridge?: RootInteractionControllerOptions['selectionBridge'];
  word?: Range | null;
}) => {
  const rootedRange = withInteractionRangeRoot(range, root);
  const useViewSelection =
    (selectionBridge?.isViewportBackedSelection(rootedRange) ?? false) ||
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

  if (projecting) selectionBridge?.beginProjectedDrag();
  else selectionBridge?.beforeModelSelection();
  writePliteViewSelection(
    editor,
    useViewSelection
      ? createPliteViewSelection(
          createContentRootViewBoundaryGraph(
            editor,
            findContentRootOwners(editor)
          ),
          {
            anchor: { point: rootedRange.anchor },
            focus: { point: rootedRange.focus },
          }
        )
      : null,
    {
      place: () =>
        editor.update({ tags: 'skip-scroll-into-view' }, (tx) => {
          selectShown(editor, rootedRange);
          if (block) tx.annotations.set(tripleClickedBlock, block);
          if (word) tx.annotations.set(placedSelectionWord, word);
        }),
    }
  );
  selectionBridge?.syncDOMSelectionToEditor({ preserveScroll: true });
};

const stopDragAutoScroll = (ref: PendingDragAutoScrollRef) => {
  const state = ref.current;

  state?.cancelScheduledFrame?.();

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

const extendDragAutoScrollSelection = (
  state: PendingDragAutoScroll,
  {
    clientX,
    clientY,
    delta,
  }: { clientX: number; clientY: number; delta: number }
) => {
  if (state.follow) {
    state.follow(clientX, clientY);
    return;
  }
  const eventRange = resolveDragAutoScrollEventRange({
    clientX,
    clientY,
    editor: state.editor,
    rootElement: state.rootElement,
  });

  if (!eventRange) return;

  const nextRange = createDragSelectionRange({
    endRange: eventRange,
    startRange: state.startRange,
  });

  if (
    isRegressiveDragAutoScrollRange({
      currentRange: state.currentRange,
      delta,
      nextRange,
      startRange: state.startRange,
    })
  ) {
    return;
  }

  applyModelDragSelection({
    editor: state.editor,
    range: nextRange,
    root: state.root,
    selectionBridge: state.selectionBridge,
  });
  state.currentRange = nextRange;
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

  extendDragAutoScrollSelection(state, target);

  return true;
};

const scheduleDragAutoScroll = (
  ref: PendingDragAutoScrollRef,
  domPhaseScheduler: DOMPhaseScheduler
) => {
  const state = ref.current;

  if (!state || state.cancelScheduledFrame !== null) {
    return;
  }

  state.cancelScheduledFrame = domPhaseScheduler.schedule(
    'dom-read',
    'drag-auto-scroll',
    () => {
      const latest = ref.current;

      if (!latest) {
        return;
      }

      latest.cancelScheduledFrame = null;

      if (applyDragAutoScrollFrame(latest)) {
        scheduleDragAutoScroll(ref, domPhaseScheduler);
      } else {
        stopDragAutoScroll(ref);
      }
    },
    { timing: 'animation-frame' }
  );
};

const updateDragAutoScroll = (
  ref: PendingDragAutoScrollRef,
  state: Omit<PendingDragAutoScroll, 'cancelScheduledFrame' | 'releaseCleanup'>,
  domPhaseScheduler: DOMPhaseScheduler
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

  const cancelScheduledFrame = ref.current?.cancelScheduledFrame ?? null;
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
    cancelScheduledFrame,
    releaseCleanup,
  };
  scheduleDragAutoScroll(ref, domPhaseScheduler);
};

export const useRootInteractionController = ({
  disabled,
  editor,
  getMountedViewEditor,
  ignoreBlankEditableRootClicks = false,
  root,
  runtime: rootRuntime,
  selection,
  selectionBridge,
  viewLines = null,
}: RootInteractionControllerOptions): RootInteractionController => {
  const [pendingInteractionRef] = useState(() => ({
    current: ignoreInteraction(),
  }));
  const interactionEpochRef = useRef(0);
  const pendingDragAutoScrollRef = useRef<PendingDragAutoScroll | null>(null);
  const placedDragRef = useRef<PlacedDrag | null>(null);
  const armedPressRef = useRef<ArmedPress | null>(null);
  const endPlacedDrag = useCallback(() => {
    const armed = armedPressRef.current;
    const drag = placedDragRef.current;

    armedPressRef.current = null;
    placedDragRef.current = null;
    armed?.detach();
    drag?.detach();
    stopDragAutoScroll(pendingDragAutoScrollRef);
  }, []);
  useEffect(
    () => () => {
      endPlacedDrag();
    },
    [endPlacedDrag]
  );
  const scheduleInteractionFrame = useCallback(
    (
      label: string,
      callback: () => void,
      {
        phase = 'selection-repair',
        target,
        timing = 'animation-frame',
      }: {
        phase?: DOMPhase;
        target?: HTMLElement | null;
        timing?: DOMPhaseTiming;
      } = {}
    ) => {
      const mountedEditor = getMountedViewEditor(root) ?? editor;
      const runtime =
        rootRuntime ??
        (target ? findMountedEditableDOMRuntime(target) : null) ??
        getMountedEditableDOMRuntime(mountedEditor) ??
        getMountedEditableDOMRuntime(editor);

      return runtime?.domPhaseScheduler.schedule(phase, label, callback, {
        timing,
      });
    },
    [editor, getMountedViewEditor, root, rootRuntime]
  );
  const focusRoot = useCallback(
    ({
      fallbackSelection,
      receipt,
      selection: selectionPreference = selection,
    }: {
      fallbackSelection?: RootInteractionFocusSelection;
      receipt?: number;
      selection?: RootInteractionFocusSelection;
    } = {}) => {
      const view = getMountedViewEditor(root) ?? editor;

      focusPressedView(rootRuntime?.rootElement);
      activateViewCaret(view, {
        fallback: fallbackSelection === 'end' ? 'end' : undefined,
        focus: true,
        press: true,
        receipt,
        target: selectionPreference === 'end' ? 'end' : undefined,
      });
    },
    [editor, getMountedViewEditor, root, rootRuntime, selection]
  );

  const applyInteractionAction = useCallback(
    (
      action: RootInteractionMouseUpAction,
      options: {
        block?: NodeKey | null;
        keepScroll?: boolean;
        placementDOMPoint?: PliteStringPlacementDOMPoint | null;
        receipt?: number;
        word?: Range | null;
      } = {}
    ) => {
      if (action.type === 'ignore') {
        return;
      }
      const focusEditor = getMountedViewEditor(root) ?? editor;

      if (action.type === 'set-selection') {
        const range = withInteractionRangeRoot(action.range, root);
        const selectionRoot = range.anchor.root ?? root;

        if (selectionRoot !== root) {
          const selectionEditor = getMountedViewEditor(selectionRoot);

          if (selectionEditor) {
            writePliteViewSelection(focusEditor, null);
            selectShown(selectionEditor, range);
            focusPliteEditableAfterEventFrame(selectionEditor, {
              receipt: getPlacementGeneration(selectionEditor),
            });
          }
          return;
        }

        selectionBridge?.beforeModelSelection();
        focusPressedView(rootRuntime?.rootElement);
        focusEditor.api.dom.editable()?.focus({ preventScroll: true });
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
                createContentRootViewBoundaryGraph(
                  focusEditor,
                  findContentRootOwners(focusEditor)
                ),
                {
                  anchor: { point: range.anchor },
                  focus: { point: range.focus },
                }
              )
            : null,
          {
            place: () => {
              writeCollapsedModelSelectionDOMPreference(
                focusEditor,
                range,
                options.placementDOMPoint ?? null
              );
              const { block, keepScroll, word } = options;
              const select = () => selectShown(focusEditor, range);

              if (block || keepScroll || word) {
                focusEditor.update((tx) => {
                  select();
                  if (keepScroll) tx.tags.add('skip-scroll-into-view');
                  if (block) tx.annotations.set(tripleClickedBlock, block);
                  if (word) tx.annotations.set(placedSelectionWord, word);
                });
              } else {
                select();
              }
            },
          }
        );
        focusPliteEditableAfterEventFrame(focusEditor, {
          receipt: getPlacementGeneration(focusEditor),
        });
        const syncOptions = { preserveScroll: options.keepScroll };

        selectionBridge?.syncDOMSelectionToEditor(syncOptions);
        scheduleInteractionFrame('root-interaction-selection-sync', () => {
          selectionBridge?.syncDOMSelectionToEditor(syncOptions);
        });
        return;
      }

      focusRoot({
        fallbackSelection: action.fallbackSelection,
        receipt: options.receipt,
        selection: action.selection,
      });
    },
    [
      editor,
      focusRoot,
      getMountedViewEditor,
      root,
      rootRuntime,
      scheduleInteractionFrame,
      selectionBridge,
    ]
  );

  const resolvePlacedRange = useCallback(
    (drag: PlacedDrag, x: number, y: number, target: Element | null) => {
      const placement = drag.viewLines.placementAt({
        reach: 'drag',
        target,
        x,
        y,
      });
      const point = placement
        ? resolvePliteStringPlacementRange({ editor: drag.editor, placement })
            ?.focus
        : null;

      return placement && point
        ? spanPlacedUnits(
            drag.spanFrom.range,
            getPlacedUnit({
              editor: drag.editor,
              kind: drag.kind,
              overLetterBefore: placement.overLetterBefore,
              point,
            }).range
          )
        : null;
    },
    []
  );
  const followPlacedDrag = useCallback(
    (drag: PlacedDrag, x: number, y: number, target: Element | null) => {
      const range = resolvePlacedRange(drag, x, y, target);

      if (!range || RangeApi.equals(range, drag.currentRange)) return;
      applyModelDragSelection({
        block: getKeptTripleClickedBlock(drag, range),
        editor: drag.editor,
        projecting: drag.projecting,
        range,
        root,
        selectionBridge,
        word: drag.word,
      });
      drag.currentRange = range;
    },
    [resolvePlacedRange, root, selectionBridge]
  );
  const movePlacedDrag = useCallback(
    (drag: PlacedDrag, pointer: PlacedPointer) => {
      if (pointer.buttons === 0) {
        endPlacedDrag();
        return;
      }
      if (!drag.moved && !hasPlacedPointerMoved(drag, pointer)) return;
      drag.moved = true;
      followPlacedDrag(
        drag,
        pointer.clientX,
        pointer.clientY,
        mouseEventTargetToElement(pointer.target)
      );
      const phaseScheduler =
        rootRuntime?.domPhaseScheduler ??
        findMountedEditableDOMRuntime(drag.rootElement)?.domPhaseScheduler;

      if (!phaseScheduler) {
        stopDragAutoScroll(pendingDragAutoScrollRef);
        return;
      }
      updateDragAutoScroll(
        pendingDragAutoScrollRef,
        {
          clientX: pointer.clientX,
          clientY: pointer.clientY,
          currentRange: drag.currentRange,
          editor: drag.editor,
          follow: (x, y) => followPlacedDrag(drag, x, y, null),
          root,
          rootElement: drag.rootElement,
          selectionBridge,
          startRange: drag.spanFrom.range,
        },
        phaseScheduler
      );
    },
    [endPlacedDrag, followPlacedDrag, root, rootRuntime, selectionBridge]
  );
  const releasePlacedDrag = useCallback(
    (drag: PlacedDrag, pointer: PlacedPointer) => {
      const moved = drag.moved || hasPlacedPointerMoved(drag, pointer);

      endPlacedDrag();
      const range = moved
        ? (resolvePlacedRange(
            drag,
            pointer.clientX,
            pointer.clientY,
            mouseEventTargetToElement(pointer.target)
          ) ?? drag.currentRange)
        : drag.pressSelection;

      applyInteractionAction(
        { range, type: 'set-selection' },
        {
          block: getKeptTripleClickedBlock(drag, range),
          keepScroll: true,
          placementDOMPoint: moved ? null : drag.placementDOMPoint,
          word: drag.word,
        }
      );
    },
    [applyInteractionAction, endPlacedDrag, resolvePlacedRange]
  );
  const createPlacedDrag = useCallback(
    (
      rootElement: HTMLElement,
      lines: ViewLines,
      fields: Pick<
        PlacedDrag,
        | 'kind'
        | 'placementDOMPoint'
        | 'pressInRoot'
        | 'pressSelection'
        | 'projecting'
        | 'spanFrom'
        | 'word'
      >,
      release = () => {}
    ) => {
      const drag: PlacedDrag = {
        ...fields,
        currentRange: fields.pressSelection,
        detach: () => {},
        editor: getMountedViewEditor(root) ?? editor,
        moved: false,
        rootElement,
        viewLines: lines,
      };
      const detachListeners = attachPlacedDragListeners(rootElement, {
        onBlur: endPlacedDrag,
        onMove: (pointer) => {
          if (placedDragRef.current === drag) movePlacedDrag(drag, pointer);
        },
        onUp: (pointer) => {
          if (placedDragRef.current === drag) releasePlacedDrag(drag, pointer);
        },
      });

      drag.detach = () => {
        detachListeners();
        release();
      };
      placedDragRef.current = drag;
      return drag;
    },
    [
      editor,
      endPlacedDrag,
      getMountedViewEditor,
      movePlacedDrag,
      releasePlacedDrag,
      root,
    ]
  );
  const beginPlacedDrag = useCallback(
    (
      event: MouseEvent<HTMLElement>,
      lines: ViewLines,
      fields: Pick<
        PlacedDrag,
        'kind' | 'placementDOMPoint' | 'pressSelection' | 'spanFrom' | 'word'
      >
    ) => {
      event.preventDefault();
      pendingProjectedDrag?.releaseCleanup();
      pendingProjectedDrag?.finish();
      pendingProjectedDrag = null;
      pendingInteractionRef.current = ignoreInteraction();

      const rootElement = event.currentTarget;
      const rootRect = rootElement.getBoundingClientRect();

      createPlacedDrag(rootElement, lines, {
        ...fields,
        pressInRoot: {
          x: event.clientX - rootRect.left,
          y: event.clientY - rootRect.top,
        },
        projecting: false,
      });
      applyInteractionAction(
        { range: fields.pressSelection, type: 'set-selection' },
        {
          block: fields.spanFrom.block,
          keepScroll: true,
          placementDOMPoint: fields.placementDOMPoint,
          word: fields.word,
        }
      );
    },
    [applyInteractionAction, createPlacedDrag, pendingInteractionRef]
  );
  // Chromium keeps extending its own selection drag after the cancelled
  // `selectstart`.
  const holdAdoptedSelection = useCallback(
    (drag: PlacedDrag) => {
      let cancel: (() => void) | undefined;
      const hold = () => {
        if (placedDragRef.current !== drag) return;
        profilePliteReactDuration('placed-drag.hold-selection', () =>
          selectionBridge?.syncDOMSelectionToEditor({ preserveScroll: true })
        );
        cancel = scheduleInteractionFrame('placed-drag-hold-selection', hold, {
          target: drag.rootElement,
        });
      };

      cancel = scheduleInteractionFrame('placed-drag-hold-selection', hold, {
        target: drag.rootElement,
      });
      return () => cancel?.();
    },
    [scheduleInteractionFrame, selectionBridge]
  );
  const adoptSelectionDrag = useCallback(
    (armed: ArmedPress, pointer: PlacedPointer) => {
      if (armedPressRef.current !== armed) return false;
      const view = getMountedViewEditor(root) ?? editor;
      const rootRect = armed.rootElement.getBoundingClientRect();
      const placement = armed.lines.placementAt({
        reach: 'press',
        target: armed.target,
        x: rootRect.left + armed.pressInRoot.x,
        y: rootRect.top + armed.pressInRoot.y,
      });
      const point = placement
        ? resolvePliteStringPlacementRange({ editor: view, placement })?.focus
        : null;

      if (!point) return false;
      armedPressRef.current = null;
      pendingInteractionRef.current = ignoreInteraction();
      if (pendingProjectedDrag) {
        finishPendingProjectedDrag(pendingProjectedDrag);
      }
      setNativeSelectionDragActive(rootRuntime, false);

      const pressSelection = { anchor: point, focus: point };
      let releaseHold = () => {};
      const drag = createPlacedDrag(
        armed.rootElement,
        armed.lines,
        {
          kind: 'plain',
          placementDOMPoint: null,
          pressInRoot: armed.pressInRoot,
          pressSelection,
          projecting: true,
          spanFrom: { block: null, range: pressSelection },
          word: null,
        },
        () => {
          armed.detach();
          releaseHold();
          selectionBridge?.finishProjectedDrag();
        }
      );

      applyModelDragSelection({
        editor: drag.editor,
        projecting: true,
        range: pressSelection,
        root,
        selectionBridge,
      });
      releaseHold = holdAdoptedSelection(drag);
      drag.moved = true;
      movePlacedDrag(drag, pointer);
      return true;
    },
    [
      createPlacedDrag,
      editor,
      getMountedViewEditor,
      holdAdoptedSelection,
      movePlacedDrag,
      pendingInteractionRef,
      root,
      rootRuntime,
      selectionBridge,
    ]
  );
  const armSelectedPress = useCallback(
    (event: MouseEvent<HTMLElement>, lines: ViewLines, target: Element) => {
      const rootElement = event.currentTarget;
      const rootRect = rootElement.getBoundingClientRect();
      const armed: ArmedPress = {
        detach: watchSelectionDrag(rootElement, {
          onEnd: endPlacedDrag,
          onSelectionDrag: (pointer) => adoptSelectionDrag(armed, pointer),
        }),
        lines,
        pressInRoot: {
          x: event.clientX - rootRect.left,
          y: event.clientY - rootRect.top,
        },
        rootElement,
        target,
      };

      armedPressRef.current = armed;
    },
    [adoptSelectionDrag, endPlacedDrag]
  );
  const startPlacedDrag = useCallback(
    (event: MouseEvent<HTMLElement>, lines: ViewLines, press: PlacedPress) => {
      const view = getMountedViewEditor(root) ?? editor;
      const held =
        press.kind === 'shift' ? view.read((state) => state.selection()) : null;
      const shiftFrom =
        RangeApi.isRange(held) && isRootLocalRange(held, root) ? held : null;

      if (press.kind === 'shift' && !shiftFrom) return false;
      const placement = lines.placementAt({
        reach: press.kind === 'shift' ? 'drag' : 'press',
        target: press.target,
        x: event.clientX,
        y: event.clientY,
      });
      const point = placement
        ? resolvePliteStringPlacementRange({ editor: view, placement })?.focus
        : null;

      if (!placement || !point) return false;
      const gecko = isGeckoDOMHost(event.nativeEvent);
      const word = shiftFrom
        ? readSelectionAnnotation(view, placedSelectionWord, shiftFrom)
        : null;
      // Chromium and WebKit extend a double-click's selection by words,
      // Firefox by characters.
      const kind = word && !gecko ? 'word' : press.kind;
      const spanFrom = shiftFrom
        ? getShiftSpanFrom({
            editor: view,
            keepsFarEnd: usesAppleDOMHotkeys(event.nativeEvent) && !gecko,
            point,
            selection: shiftFrom,
            word,
          })
        : null;
      const unit = getPlacedUnit({
        editor: view,
        kind,
        overLetterBefore: placement.overLetterBefore,
        point,
      });

      beginPlacedDrag(event, lines, {
        kind,
        placementDOMPoint:
          kind === 'plain' ? getPliteStringPlacementDOMPoint(placement) : null,
        pressSelection: spanFrom
          ? spanPlacedUnits(spanFrom, unit.range)
          : unit.range,
        spanFrom: spanFrom ? { block: null, range: spanFrom } : unit,
        word: word ?? (kind === 'word' ? unit.range : null),
      });
      return true;
    },
    [beginPlacedDrag, editor, getMountedViewEditor, root]
  );

  const onMouseDownCapture = useCallback<MouseEventHandler<HTMLElement>>(
    (event) => {
      profilePliteReactDuration('root-mousedown.capture', () => {
        if (disabled || event.defaultPrevented) {
          return;
        }

        interactionEpochRef.current += 1;

        endPlacedDrag();

        const target = resolveRootInteractionTarget({
          currentTarget: event.currentTarget,
          target: event.target,
        });

        const classified = viewLines
          ? classifyPlacedPress(event, target)
          : null;
        const placedPress = classified?.takes === 'press' ? classified : null;

        if (
          viewLines &&
          placedPress &&
          startPlacedDrag(event, viewLines, placedPress)
        ) {
          return;
        }
        if (viewLines && classified?.takes === 'selection-drag') {
          armSelectedPress(event, viewLines, classified.target);
        }
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
        const nativeEditableTextHit =
          target.kind === 'native-editable' &&
          (isTapOnTextBlock(event, target.target) ||
            target.target.closest(NATIVE_EDITABLE_TEXT_TARGET) !== null);
        const nativeEditableTextTarget =
          nativeEditableTextHit ||
          (target.kind === 'native-editable' &&
            target.target.closest(
              '[data-editor-inline="true"][data-editor-node="element"]'
            ) !== null);
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
        const modelOwnsExpandedSelectionReplacementClick =
          nativeEditableTextTarget &&
          !nativeEditableMultiClick &&
          !nativeEditableSelectedTextTarget &&
          !nativeEditableModifiedClick &&
          hasExpandedDOMSelectionInTarget(event.currentTarget);
        const nativeEditableTableCellTarget =
          nativeEditableTextTarget && Boolean(target.target.closest('td, th'));
        const nativeSelectionOwnsInteraction =
          nativeEditableTextTarget &&
          !modelOwnsExpandedSelectionReplacementClick &&
          (!nativeEditableTableCellTarget ||
            nativeEditableMultiClick ||
            nativeEditableSelectedTextTarget ||
            nativeEditableModifiedClick);

        if (modelOwnsExpandedSelectionReplacementClick) {
          action = { type: 'place-native-editable' };
        } else if (nativeSelectionOwnsInteraction) {
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
            ? profilePliteReactDuration(
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
          target.kind === 'native-editable' && !nativeEditableTextHit;
        const focusedNativeEditableCoordinateTarget =
          !nativeEditableMultiClick &&
          !nativeEditableSelectedTextTarget &&
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
        const coordinatePlacementTarget = rootChromeCoordinatePlacement
          ? profilePliteReactDuration(
              'root-mousedown.resolve-start-range',
              () =>
                resolveCoordinatePlacementTarget({
                  editor: focusEditor,
                  event,
                  placement: rootChromeCoordinatePlacement,
                })
            )
          : null;
        const startRange = coordinatePlacementTarget
          ? coordinatePlacementTarget.range
          : action.type === 'place-native-editable'
            ? profilePliteReactDuration(
                'root-mousedown.resolve-start-range',
                () => focusEditor.api.dom.resolveEventRange(event.nativeEvent)
              )
            : null;
        const placementDOMPoint =
          coordinatePlacementTarget?.placementDOMPoint ?? null;
        // A content root owner hides its own children, so a click on its
        // chrome places the caret in its content root instead.
        const ownerChromeClickEndpoint =
          startRange && RangeApi.isCollapsed(startRange)
            ? resolveContentRootOwnerChromeEndpoint({
                editor,
                event,
                owners: findContentRootOwners(editor),
                point: startRange.anchor,
                root,
              })
            : null;
        const clickRange = ownerChromeClickEndpoint
          ? {
              anchor: ownerChromeClickEndpoint.point,
              focus: ownerChromeClickEndpoint.point,
            }
          : startRange;

        if (ignoreBlankEditableRootClick && !startRange) {
          action = { type: 'ignore' };
        }
        const placedDragTakesCoordinateDrag =
          viewLines &&
          placedPress &&
          placedPress.kind !== 'shift' &&
          (placedPress.kind === 'plain' || !ownerChromeClickEndpoint) &&
          coordinateDragRootChromePlacement &&
          clickRange;

        if (placedDragTakesCoordinateDrag) {
          const { kind } = placedPress;
          const spanFrom =
            kind === 'plain'
              ? { block: null, range: clickRange }
              : getPlacedUnit({
                  editor: focusEditor,
                  kind,
                  overLetterBefore: false,
                  point: clickRange.focus,
                });

          beginPlacedDrag(event, viewLines, {
            kind,
            placementDOMPoint: kind === 'plain' ? placementDOMPoint : null,
            pressSelection: spanFrom.range,
            spanFrom,
            word: kind === 'word' ? spanFrom.range : null,
          });
          return;
        }

        const existingSelectionProjectedDragEndpoint = nativeEditableTextTarget
          ? profilePliteReactDuration(
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
              profilePliteReactDuration(
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

        pendingProjectedDrag?.releaseCleanup();
        pendingProjectedDrag?.finish();
        if (projectedDragEndpoint) {
          const nextProjectedDrag: PendingProjectedDrag = {
            clientX: event.clientX,
            clientY: event.clientY,
            browserOwned: nativeSelectionOwnsInteraction,
            editor: projectedDragEditor,
            endpoint: projectedDragEndpoint,
            ownsSettledSelection: false,
            wroteViewSelection: false,
            finish: () => {
              setNativeSelectionDragActive(rootRuntime, false);
              if (!nextProjectedDrag.browserOwned) {
                selectionBridge?.finishProjectedDrag();
                refreshPliteViewSelection(projectedDragEditor);
              }
              if (nextProjectedDrag.ownsSettledSelection) {
                focusPliteEditableAfterEventFrame(
                  getMountedViewEditor(projectedDragEndpoint.root) ??
                    projectedDragEditor
                );
              }
            },
            releaseCleanup: () => {},
          };

          pendingProjectedDrag = nextProjectedDrag;
        } else {
          pendingProjectedDrag = null;
        }
        if (nativeSelectionOwnsInteraction) {
          setNativeSelectionDragActive(rootRuntime, true);
        }
        if (
          pendingProjectedDrag?.browserOwned &&
          !nativeEditableMultiClick &&
          !nativeEditableSelectedTextTarget &&
          !nativeEditableModifiedClick
        ) {
          writePliteViewSelection(pendingProjectedDrag.editor, null);
          collapseModelSelectionToProjectedDragAnchor({
            anchor: pendingProjectedDrag.endpoint,
            editor: pendingProjectedDrag.editor,
          });
        }
        if (pendingProjectedDrag) {
          pendingProjectedDrag.releaseCleanup =
            attachProjectedDragReleaseListeners(
              pendingProjectedDrag,
              event.currentTarget
            );
        }

        pendingInteractionRef.current = {
          action,
          clientX: event.clientX,
          clientY: event.clientY,
          coordinateDragSelection: coordinateDragRootChromePlacement,
          currentRange: clickRange,
          nativeSelectedTextClick: nativeEditableSelectedTextTarget,
          placementDOMPoint,
          preventNativeSelection,
          startRange: clickRange,
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

        if (
          action.type === 'place-editable-root' &&
          rootEdgeCoordinatePlacement
        ) {
          clearDOMSelectionFromEvent(event);
        }

        if (action.type === 'place-editable-root') {
          return;
        }

        if (action.type === 'place-native-editable') {
          if (clickRange) {
            profilePliteReactDuration(
              'root-mousedown.apply-place-native-selection',
              () =>
                applyInteractionAction(
                  {
                    range: clickRange,
                    type: 'set-selection',
                  },
                  { placementDOMPoint }
                )
            );
          }
          return;
        }

        const receipt = getPlacementGeneration(focusEditor);

        scheduleInteractionFrame(
          'root-interaction-mouse-down',
          () => {
            applyInteractionAction(
              resolveRootInteractionMouseUp({
                eventRange: null,
                pendingAction: action,
                selection,
              }),
              { receipt }
            );
          },
          { phase: 'model', target: event.currentTarget }
        );
      });
    },
    [
      applyInteractionAction,
      armSelectedPress,
      beginPlacedDrag,
      disabled,
      editor,
      endPlacedDrag,
      getMountedViewEditor,
      ignoreBlankEditableRootClicks,
      pendingInteractionRef,
      root,
      rootRuntime,
      scheduleInteractionFrame,
      selection,
      selectionBridge,
      startPlacedDrag,
      viewLines,
    ]
  );

  const onMouseMoveCapture = useCallback<MouseEventHandler<HTMLElement>>(
    (event) => {
      const placedDrag = placedDragRef.current;

      if (placedDrag) {
        // A portal's events reach these handlers too; the document listener
        // owns every event outside the root.
        if (event.currentTarget.contains(event.target as Node)) {
          event.preventDefault();
          movePlacedDrag(placedDrag, event.nativeEvent);
        }
        return;
      }
      const pendingInteraction = pendingInteractionRef.current;
      const projectedDrag = pendingProjectedDrag;

      if (event.buttons === 0) {
        setNativeSelectionDragActive(rootRuntime, false);
        if (projectedDrag) {
          finishPendingProjectedDrag(projectedDrag);
        }
        stopDragAutoScroll(pendingDragAutoScrollRef);
        return;
      }

      if (
        ((projectedDrag && !projectedDrag.browserOwned) ||
          canApplyCoordinateDragSelection(pendingInteraction, root)) &&
        shouldIgnoreDragTarget(event)
      ) {
        event.preventDefault();
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
        projectedDrag.browserOwned = false;
        setNativeSelectionDragActive(rootRuntime, false);
        stopDragAutoScroll(pendingDragAutoScrollRef);
        return;
      }

      if (
        disabled ||
        !canApplyCoordinateDragSelection(pendingInteraction, root)
      ) {
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
          applyModelDragSelection({
            editor: focusEditor,
            range: nextRange,
            root,
            selectionBridge,
          });
          pendingInteraction.currentRange = nextRange;
        }

        const runtime =
          findMountedEditableDOMRuntime(event.currentTarget) ??
          getMountedEditableDOMRuntime(focusEditor);
        const phaseScheduler =
          rootRuntime?.domPhaseScheduler ?? runtime?.domPhaseScheduler;

        if (phaseScheduler) {
          updateDragAutoScroll(
            pendingDragAutoScrollRef,
            {
              clientX: event.clientX,
              clientY: event.clientY,
              currentRange:
                pendingInteraction.currentRange ??
                pendingInteraction.startRange,
              editor: focusEditor,
              root,
              rootElement: event.currentTarget,
              selectionBridge,
              startRange: pendingInteraction.startRange,
            },
            phaseScheduler
          );
        } else {
          stopDragAutoScroll(pendingDragAutoScrollRef);
        }
      } else {
        stopDragAutoScroll(pendingDragAutoScrollRef);
      }
    },
    [
      disabled,
      editor,
      getMountedViewEditor,
      movePlacedDrag,
      pendingInteractionRef,
      root,
      rootRuntime,
      selectionBridge,
    ]
  );

  const onMouseUpCapture = useCallback<MouseEventHandler<HTMLElement>>(
    (event) => {
      const placedDrag = placedDragRef.current;

      if (placedDrag) {
        if (event.currentTarget.contains(event.target as Node)) {
          event.preventDefault();
          if (placedDrag.kind === 'word' || placedDrag.kind === 'block') {
            rootRuntime?.markNextClickSelected();
          }
          releasePlacedDrag(placedDrag, event.nativeEvent);
        }
        return;
      }
      const pendingInteraction = pendingInteractionRef.current;
      pendingInteractionRef.current = ignoreInteraction();
      stopDragAutoScroll(pendingDragAutoScrollRef);
      setNativeSelectionDragActive(rootRuntime, false);
      const { action: pendingAction } = pendingInteraction;
      const projectedDrag = pendingProjectedDrag;
      pendingProjectedDrag = null;
      projectedDrag?.releaseCleanup();
      const { currentTarget } = event;
      const pointerMoved = hasPointerMoved(pendingInteraction, event);

      if (
        pointerMoved &&
        ((projectedDrag && !projectedDrag.browserOwned) ||
          canApplyCoordinateDragSelection(pendingInteraction, root)) &&
        shouldIgnoreDragTarget(event)
      ) {
        event.preventDefault();
        projectedDrag?.finish();
        return;
      }

      const importExpandedDOMSelection = () => {
        // Mouseup capture runs before the browser collapses a plain click.
        // The scheduled import below observes the native result instead.
        if (!pointerMoved) return 'none' as const;

        const expandedDOMSelection =
          getExpandedDOMSelectionInTarget(currentTarget);

        if (!expandedDOMSelection) return 'none' as const;

        selectionBridge?.importDOMSelection();
        if (
          shouldReplayMouseUpDOMSelection({
            hasExpandedDOMRange: true,
            isFirefox: needsMouseUpDOMSelectionReplay(currentTarget),
            nativeSelectedTextClick: pendingInteraction.nativeSelectedTextClick,
            pointerMoved,
          })
        ) {
          const replaySnapshot = editor.read.runtime.snapshot();
          const replayInteractionEpoch = interactionEpochRef.current;

          const scheduled = scheduleInteractionFrame(
            'root-interaction-selection-replay',
            () => {
              const currentSnapshot = editor.read.runtime.snapshot();

              if (
                !shouldRestoreMouseUpDOMSelection({
                  currentSelection: currentSnapshot.selection,
                  replaySelection: replaySnapshot.selection,
                  sameDocument:
                    currentSnapshot.children === replaySnapshot.children,
                  sameInteraction:
                    interactionEpochRef.current === replayInteractionEpoch,
                })
              ) {
                return;
              }

              const claims = findMountedEditableDOMRuntime(
                expandedDOMSelection.anchor[0]
              )?.selectionClaims;

              if (claims && !claims.mayRedraw(expandedDOMSelection)) return;

              if (
                !hasExpandedDOMSelectionInTarget(currentTarget) &&
                !restoreDOMSelectionInTarget(
                  currentTarget,
                  expandedDOMSelection
                )
              ) {
                return;
              }

              selectionBridge?.importDOMSelection();
            },
            { target: currentTarget }
          );

          if (!scheduled) {
            return 'imported' as const;
          }

          return 'replay' as const;
        }

        return 'imported' as const;
      };

      if (projectedDrag) {
        const appliedProjectedDrag = applyProjectedDragSelectionFromEvent({
          event,
          getMountedViewEditor,
          projectedDrag,
          selectionBridge,
        });

        if (appliedProjectedDrag) {
          projectedDrag.browserOwned = false;
        }
        projectedDrag.finish();
        if (appliedProjectedDrag) {
          return;
        }
      }

      if (pendingAction.type === 'ignore') {
        const target = resolveRootInteractionTarget({
          currentTarget,
          target: event.target,
        });
        const nativeEditableTextTarget =
          target.kind === 'native-editable' &&
          !!target.target.closest(NATIVE_EDITABLE_TEXT_TARGET);

        if (!disabled && !readPliteViewSelection(editor)) {
          const expandedSelectionImport = importExpandedDOMSelection();

          if (
            nativeEditableTextTarget &&
            expandedSelectionImport !== 'replay'
          ) {
            if (expandedSelectionImport === 'none') {
              selectionBridge?.importDOMSelection();
            }
            scheduleInteractionFrame(
              'root-interaction-selection-import',
              () => {
                if (!readPliteViewSelection(editor)) {
                  selectionBridge?.importDOMSelection();
                }
              },
              { target: currentTarget }
            );
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
        importExpandedDOMSelection() !== 'none'
      ) {
        return;
      }

      const focusEditor = getMountedViewEditor(root) ?? editor;
      const eventRange = focusEditor.api.dom.resolveEventRange(
        event.nativeEvent
      );
      if (
        canApplyCoordinateDragSelection(pendingInteraction, root) &&
        eventRange &&
        pendingInteraction.startRange &&
        pointerMoved
      ) {
        const nextRange = createDragSelectionRange({
          endRange: eventRange,
          startRange: pendingInteraction.startRange,
        });
        if (
          isDragSelectionOppositePointerDirection({
            delta: event.clientY - pendingInteraction.clientY,
            nextRange,
            startRange: pendingInteraction.startRange,
          })
        ) {
          return;
        }

        applyInteractionAction({
          range: nextRange,
          type: 'set-selection',
        });
        return;
      }

      if (
        canApplyCoordinateDragSelection(pendingInteraction, root) &&
        pendingInteraction.startRange &&
        pointerMoved
      ) {
        return;
      }

      if (
        pendingAction.type === 'place-native-editable' &&
        pendingInteraction.startRange &&
        (!pointerMoved ||
          !isRootLocalRange(pendingInteraction.startRange, root))
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
      pendingInteractionRef,
      releasePlacedDrag,
      root,
      rootRuntime,
      scheduleInteractionFrame,
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
