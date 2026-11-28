import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

import {
  type Descendant,
  NodeApi,
  type Path,
  PathApi,
  type Point,
  type Range,
  RangeApi,
  SelectionApi,
  type RootKey,
} from '../..';
import { asSelectionMotion } from '../../core/public-state';
import { setShownSelectionAsView } from '../../core/view-carets';
import { isDOMNode } from '../../dom';
import {
  isFocusRequestedElsewhere,
  watchFocusSuperseded,
} from '../../dom/plugin/dom-editor';
import { focusedElementOnPage } from '../../dom/plugin/dom-root-runtime';
import { containsShadowAware } from '../../dom/utils/dom';
import type { EditorSelectionTarget } from '../../interfaces/editor';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { readRootChildren } from '../root-key';
import {
  createPliteViewBoundaryRootMap,
  getPliteDescendantAtPath,
  getPlitePointRoot,
  getPliteRootBoundaryPoint,
  getPliteViewBoundaryPointRoot,
  resolvePliteViewBoundarySegmentEndpoint,
  rootPlitePoint,
  PliteViewBoundaryGraph,
  type PliteViewBoundaryGraphModel,
  type PliteViewBoundaryPoint,
  samePliteRootPoint,
} from '../view-boundary-graph';
import {
  collapsePliteViewSelection,
  createPliteViewSelection,
  isPliteViewSelectionCollapsed,
  readPliteViewSelection,
  type PliteViewSelection,
  writePliteViewSelection,
} from '../view-selection';
import {
  getDocumentBoundaryNavigationTarget,
  getExitBoundaryPoint,
  getOwnerAdjacentBoundary,
  getOwnerBoundaryPoint,
  getOwnerSelfBoundaryPoint,
  getRootBoundaryNavigationTarget,
} from './content-root-boundaries';
import {
  getPointAtCoordinates,
  hasUsableRect,
  resolveUsableRangeRect,
} from './content-root-coordinate-navigation';
import {
  type ContentRootNavigationAction,
  type ContentRootNavigationAxis,
  type ContentRootNavigationDirection,
  type ContentRootSelectionMoveCommand,
  type ContentRootViewSelectionAction,
  getContentRootNavigationAction,
  getProjectedSelectionAction,
  getProjectedSelectionActionFromMoveCommand,
} from './content-root-navigation-actions';
import {
  type ContentRootNavigationEditor,
  type PliteViewBoundaryOwner,
  createContentRootViewBoundaryGraph,
  findCrossingContentRootOwners,
  getOwnerForCurrentViewEditor,
  getOwnerForRoot,
  getRegisteredRootViewEditor,
  hasContentRootOwner,
  isKnownContentRootOwner,
  isSameContentRootOwner,
  readRootNodes,
} from './content-root-owners';
import {
  clamp,
  getPathElement,
  isPointOnVisualBoundaryLine,
  resolveVerticalNavigationPoint,
} from './content-root-vertical-geometry';
import { findMountedEditableDOMRuntime } from './editable-dom-runtime';
import { scheduleEditableDOMSelectionClear } from './input-state';
import { getLineBoundaryPoint } from './line-boundary';
import {
  after as editorAfter,
  failInvariant,
  before as editorBefore,
  dispatchCommand,
  editorCommands,
  getEditorRuntimeOwner,
  toInternalRoot,
} from './runtime-editor-api';
import { readRuntimeSelection } from './runtime-selection-state';
import { isSetRootOf } from './set-root-endpoints';
import { claimPageSelection } from './unread-press';

export {
  type PliteViewBoundaryOwner,
  createContentRootViewBoundaryGraph,
  findContentRootOwners,
} from './content-root-owners';

export const readContentRootAwareSelection = ({
  editor,
  getActiveContentRootOwner,
}: {
  editor: ReactRuntimeEditor;
  getActiveContentRootOwner?: (root: RootKey) => PliteViewBoundaryOwner | null;
}) => {
  const selection = readRuntimeSelection(editor);

  if (selection) return selection;

  const ownerSelection = readRuntimeSelection(getEditorRuntimeOwner(editor));
  const root = SelectionApi.root(ownerSelection);

  return root && getActiveContentRootOwner?.(root) ? ownerSelection : selection;
};

type ContentRootNavigationTarget = {
  owner?: PliteViewBoundaryOwner;
  point: Point;
  root: RootKey;
};

type ContentRootViewEditorLookup = {
  getActiveContentRootOwner?: (root: RootKey) => PliteViewBoundaryOwner | null;
  getContentRootOwnerViewEditor?: (
    owner: PliteViewBoundaryOwner
  ) => ReactRuntimeEditor | null;
  getMountedViewEditor?: (root: RootKey) => ReactRuntimeEditor | null;
};

export type ContentRootNavigationResult =
  | { handled: false }
  | {
      handled: true;
      overtaken?: boolean;
    };

const ANSWERED_KEYS = new WeakSet<Event>();

/**
 * Whether a nested Editable already answered this key with a selection across
 * content roots. The event bubbles on; answering again would re-place the
 * anchor over a newer placement and repair focus away from it.
 */
export const isContentRootKeyAnswered = (event: { nativeEvent: Event }) =>
  ANSWERED_KEYS.has(event.nativeEvent);

export const isSetRootOfOtherView = (
  editor: ReactRuntimeEditor,
  root: RootKey
) =>
  isSetRootOf(editor, root) &&
  root !== toInternalRoot(editor.read((state) => state.view.root()));

const isPointInPath = (point: Point, path: Path) =>
  PathApi.equals(point.path, path) || PathApi.isDescendant(point.path, path);

const rootedRange = (point: Point, root: RootKey): Range => {
  const rooted = rootPlitePoint(point, root);

  return {
    anchor: rooted,
    focus: rooted,
  };
};

const selectContentRoot = (
  editor: ReactRuntimeEditor,
  target: EditorSelectionTarget
) => {
  if (editor.read.view.isReadOnly()) {
    setShownSelectionAsView(editor, target);
  } else {
    dispatchCommand(editor, editorCommands.select, { target });
  }
};

const toViewBoundaryPoint = ({
  owner,
  point,
  root,
}: {
  owner: PliteViewBoundaryOwner | null | undefined;
  point: Point;
  root: RootKey;
}): PliteViewBoundaryPoint => ({
  ...(owner ? { owner } : {}),
  point: rootPlitePoint(point, root),
});

const clearNativeSelectionForProjectedSelection = (
  editor: ReactRuntimeEditor,
  selection: Range | null,
  element: HTMLElement | null,
  sourceElement?: HTMLElement | null,
  sourceEditor?: ReactRuntimeEditor | null
) => {
  if (!selection || !element) {
    return;
  }

  const targets: Array<{
    editable: HTMLElement;
    targetEditor: ReactRuntimeEditor;
  }> = [];

  if (sourceElement && sourceElement !== element) {
    targets.push({
      editable: sourceElement,
      targetEditor: sourceEditor ?? editor,
    });
  }
  targets.push({ editable: element, targetEditor: editor });

  for (const { editable, targetEditor } of targets) {
    const runtime = findMountedEditableDOMRuntime(editable);

    scheduleEditableDOMSelectionClear({
      domPhaseScheduler: runtime?.domPhaseScheduler,
      editable,
      editor: targetEditor,
      inputController: runtime?.inputController,
      label: 'clear-projected-selection',
      shouldRun: () => {
        if (!editable.isConnected) return false;
        const current = readPliteViewSelection(editor);

        return !!current && !isPliteViewSelectionCollapsed(current);
      },
    });
  }
};

const collapseModelSelectionForProjectedSelection = (
  editor: ReactRuntimeEditor,
  selection: Range | null
) => {
  if (!selection) {
    return;
  }

  const range = {
    anchor: selection.anchor,
    focus: selection.anchor,
  };

  if (RangeApi.equals(selection, range)) {
    return;
  }

  selectContentRoot(editor, range);
};

const isEmptyProjectedSelection = (
  editor: ReactRuntimeEditor,
  projectedSelection: PliteViewSelection
) => {
  if (isPliteViewSelectionCollapsed(projectedSelection)) return true;

  const roots = editor.read((state) =>
    createPliteViewBoundaryRootMap(state.value())
  );

  return projectedSelection.segments.parts.every((segment) => {
    const start =
      segment.start.kind === 'point'
        ? segment.start.point
        : resolvePliteViewBoundarySegmentEndpoint(
            roots,
            segment,
            segment.start
          );
    const end =
      segment.end.kind === 'point'
        ? segment.end.point
        : resolvePliteViewBoundarySegmentEndpoint(roots, segment, segment.end);

    return (
      !start || !end || RangeApi.isCollapsed({ anchor: start, focus: end })
    );
  });
};

const showProjectedSelection = (
  editor: ReactRuntimeEditor,
  projectedSelection: PliteViewSelection,
  selection: Range | null,
  element: HTMLElement | null,
  sourceElement?: HTMLElement | null,
  sourceEditor?: ReactRuntimeEditor | null
) => {
  const placesNothing = !selection || RangeApi.isCollapsed(selection);
  const shown =
    (placesNothing && readPliteViewSelection(editor) === projectedSelection) ||
    writePliteViewSelection(editor, projectedSelection, {
      place: () =>
        collapseModelSelectionForProjectedSelection(editor, selection),
    });

  clearNativeSelectionForProjectedSelection(
    editor,
    selection,
    element,
    sourceElement,
    sourceEditor
  );

  return shown;
};

const resolveExitBoundary = (
  editor: ContentRootNavigationEditor,
  owner: PliteViewBoundaryOwner,
  direction: ContentRootNavigationDirection
): ContentRootNavigationTarget | null => {
  let current: PliteViewBoundaryOwner | null = owner;

  while (current) {
    const exitPoint = getExitBoundaryPoint(editor, current, direction);

    if (exitPoint) {
      const parentOwner = current.parent ?? null;

      return {
        ...(parentOwner ? { owner: parentOwner } : {}),
        point: exitPoint,
        root: current.ownerRoot,
      };
    }

    current = current.parent ?? null;
  }

  return null;
};

const resolveKnownCurrentRootOwner = (
  owners: readonly PliteViewBoundaryOwner[],
  currentOwner: PliteViewBoundaryOwner | null | undefined,
  root: RootKey
): PliteViewBoundaryOwner | null =>
  isKnownContentRootOwner(owners, currentOwner) &&
  currentOwner.childRoot === root
    ? currentOwner
    : null;

const createCurrentRootOwnerLookup = ({
  currentOwner,
  currentRoot,
  getActiveContentRootOwner,
  owners,
}: {
  currentOwner: PliteViewBoundaryOwner | null | undefined;
  currentRoot: RootKey;
  getActiveContentRootOwner?: (root: RootKey) => PliteViewBoundaryOwner | null;
  owners: readonly PliteViewBoundaryOwner[];
}) => {
  const knownCurrentOwner = resolveKnownCurrentRootOwner(
    owners,
    currentOwner,
    currentRoot
  );

  return (root: RootKey): PliteViewBoundaryOwner | null =>
    root === currentRoot && knownCurrentOwner
      ? knownCurrentOwner
      : (getActiveContentRootOwner?.(root) ?? null);
};

const chainContentRootOwner = (
  owner: PliteViewBoundaryOwner,
  parent: PliteViewBoundaryOwner | null | undefined
): PliteViewBoundaryOwner => (parent ? { ...owner, parent } : owner);

const getRootViewEditor = ({
  editor,
  getMountedViewEditor,
  root,
}: {
  editor: ContentRootNavigationEditor;
  getMountedViewEditor?: (root: RootKey) => ReactRuntimeEditor | null;
  root: RootKey;
}): ReactRuntimeEditor | null =>
  getMountedViewEditor?.(root) ??
  getRegisteredRootViewEditor(editor as ReactRuntimeEditor, root) ??
  (toInternalRoot(editor.read((state) => state.view.root())) === root
    ? (editor as ReactRuntimeEditor)
    : null);

type ViewBoundaryPointEditorLookup = {
  editor: ContentRootNavigationEditor;
  getContentRootOwnerViewEditor?: (
    owner: PliteViewBoundaryOwner
  ) => ReactRuntimeEditor | null;
  getMountedViewEditor?: (root: RootKey) => ReactRuntimeEditor | null;
  owner: PliteViewBoundaryOwner | null | undefined;
  root: RootKey;
};

const findViewBoundaryPointEditor = ({
  editor,
  getContentRootOwnerViewEditor,
  getMountedViewEditor,
  owner,
  root,
}: ViewBoundaryPointEditorLookup): ReactRuntimeEditor | null =>
  (owner ? getContentRootOwnerViewEditor?.(owner) : null) ??
  getRootViewEditor({
    editor,
    getMountedViewEditor,
    root,
  });

const getViewBoundaryPointEditor = (
  input: ViewBoundaryPointEditorLookup
): ReactRuntimeEditor =>
  findViewBoundaryPointEditor(input) ?? (input.editor as ReactRuntimeEditor);

const getVerticalNavigationTarget = ({
  currentRoot,
  direction,
  editor,
  getActiveContentRootOwner,
  getContentRootOwnerViewEditor,
  getMountedViewEditor,
  owners,
  point,
  askExternalViews,
  preferredX,
}: {
  currentRoot: RootKey;
  direction: ContentRootNavigationDirection;
  editor: ContentRootNavigationEditor;
  owners: PliteViewBoundaryOwner[];
  point: Point;
  askExternalViews?: boolean;
  preferredX?: number;
} & ContentRootViewEditorLookup): ContentRootNavigationTarget | null => {
  const ownerForCurrentRoot = getOwnerForRoot({
    currentRoot,
    getActiveContentRootOwner,
    owners,
  });

  if (ownerForCurrentRoot) {
    const sourceEditor = getViewBoundaryPointEditor({
      editor,
      getContentRootOwnerViewEditor,
      getMountedViewEditor,
      owner: ownerForCurrentRoot,
      root: currentRoot,
    });
    const rootEdge = editor.read((state) =>
      getPliteRootBoundaryPoint(
        readRootNodes(editor, state, currentRoot),
        direction === 'forward' ? 'end' : 'start'
      )
    );
    const atModelBoundary =
      rootEdge && samePliteRootPoint(point, rootEdge, currentRoot);
    const sourceElement =
      sourceEditor?.api.dom?.resolveDOMNode?.(sourceEditor) ?? null;
    const atVisualBoundary =
      !!sourceEditor &&
      !!sourceElement &&
      isPointOnVisualBoundaryLine({
        container: sourceElement,
        direction,
        editor: sourceEditor,
        point,
        root: currentRoot,
      });
    const atTerminalBlock = isPointInRootTerminalBlock({
      direction,
      editor,
      point,
      root: currentRoot,
    });
    const exit =
      atModelBoundary || atVisualBoundary
        ? resolveExitBoundary(editor, ownerForCurrentRoot, direction)
        : null;

    if (exit) {
      const parentOwner = exit.owner ?? null;
      const targetEditor = getViewBoundaryPointEditor({
        editor,
        getContentRootOwnerViewEditor,
        getMountedViewEditor,
        owner: parentOwner,
        root: exit.root,
      });
      const targetPoint =
        sourceEditor && targetEditor
          ? resolveVerticalNavigationPoint({
              direction,
              fallbackPoint: exit.point,
              preferredX,
              askExternalViews,
              source: { editor: sourceEditor, point, root: currentRoot },
              targetEditor,
              targetRoot: exit.root,
            })
          : null;
      const resolvedTargetPoint =
        targetPoint ?? (atTerminalBlock ? exit.point : null);

      return resolvedTargetPoint
        ? {
            ...(parentOwner ? { owner: parentOwner } : {}),
            point: resolvedTargetPoint,
            root: exit.root,
          }
        : null;
    }
  }

  for (const owner of owners) {
    if (owner.ownerRoot !== currentRoot) {
      continue;
    }

    const chainedOwner = chainContentRootOwner(owner, ownerForCurrentRoot);
    const sourceEditor = getViewBoundaryPointEditor({
      editor,
      getContentRootOwnerViewEditor,
      getMountedViewEditor,
      owner: ownerForCurrentRoot,
      root: currentRoot,
    });
    const targetEditor = findViewBoundaryPointEditor({
      editor,
      getContentRootOwnerViewEditor,
      getMountedViewEditor,
      owner: chainedOwner,
      root: owner.childRoot,
    });
    const entryPoint = getOwnerBoundaryPoint(editor, owner, direction);
    const adjacentBoundary = getOwnerAdjacentBoundary(editor, owner, direction);
    const atModelBoundary =
      entryPoint && samePliteRootPoint(point, entryPoint, currentRoot);
    const adjacentElement =
      sourceEditor && adjacentBoundary
        ? getPathElement(sourceEditor, adjacentBoundary.path)
        : null;
    const atVisualBoundary =
      !!sourceEditor &&
      !!adjacentBoundary &&
      !!adjacentElement &&
      isPointInPath(point, adjacentBoundary.path) &&
      isPointOnVisualBoundaryLine({
        container: adjacentElement,
        direction,
        editor: sourceEditor,
        point,
        root: currentRoot,
      });

    if (!atModelBoundary && !atVisualBoundary) {
      continue;
    }

    const fallbackTarget = getRootBoundaryNavigationTarget({
      direction,
      editor,
      owner: chainedOwner,
    });
    const targetPoint =
      fallbackTarget && sourceEditor && targetEditor
        ? resolveVerticalNavigationPoint({
            direction,
            fallbackPoint: fallbackTarget.point,
            preferredX,
            askExternalViews,
            source: { editor: sourceEditor, point, root: currentRoot },
            targetEditor,
            targetRoot: owner.childRoot,
          })
        : null;

    if (targetPoint) {
      return {
        owner: chainedOwner,
        point: targetPoint,
        root: owner.childRoot,
      };
    }
  }

  return null;
};

const getHorizontalNavigationTarget = ({
  currentRoot,
  direction,
  editor,
  getActiveContentRootOwner,
  owners,
  point,
}: {
  currentRoot: RootKey;
  direction: ContentRootNavigationDirection;
  editor: ContentRootNavigationEditor;
  getActiveContentRootOwner?: (root: RootKey) => PliteViewBoundaryOwner | null;
  owners: PliteViewBoundaryOwner[];
  point: Point;
}): ContentRootNavigationTarget | null => {
  const ownerForCurrentRoot = getOwnerForRoot({
    currentRoot,
    getActiveContentRootOwner,
    owners,
  });

  if (ownerForCurrentRoot) {
    const rootEdge = editor.read((state) =>
      getPliteRootBoundaryPoint(
        readRootNodes(editor, state, currentRoot),
        direction === 'forward' ? 'end' : 'start'
      )
    );
    const exit =
      rootEdge && samePliteRootPoint(point, rootEdge, currentRoot)
        ? resolveExitBoundary(editor, ownerForCurrentRoot, direction)
        : null;

    if (exit) {
      return exit;
    }
  }

  for (const owner of owners) {
    if (owner.ownerRoot !== currentRoot) {
      continue;
    }

    const entryPoint = getOwnerBoundaryPoint(editor, owner, direction);

    if (entryPoint && samePliteRootPoint(point, entryPoint, currentRoot)) {
      const chainedOwner = chainContentRootOwner(owner, ownerForCurrentRoot);

      return getRootBoundaryNavigationTarget({
        direction,
        editor,
        owner: chainedOwner,
      });
    }
  }

  return null;
};

const getRootLocalHorizontalSelectionTarget = ({
  direction,
  point,
  root,
  sourceEditor,
  unit,
}: {
  direction: ContentRootNavigationDirection;
  point: Point;
  root: RootKey;
  sourceEditor: ReactRuntimeEditor;
  unit?: 'line' | 'word';
}): ContentRootNavigationTarget | null => {
  const rootedPoint = rootPlitePoint(point, root);
  const nextPoint =
    direction === 'forward'
      ? editorAfter(sourceEditor, rootedPoint, unit ? { unit } : undefined)
      : editorBefore(sourceEditor, rootedPoint, unit ? { unit } : undefined);

  if (!nextPoint || getPlitePointRoot(nextPoint, root) !== root) {
    return null;
  }

  return {
    point: rootPlitePoint(nextPoint, root),
    root,
  };
};

const getHorizontalSelectionUnit = (
  axis: ContentRootNavigationAxis
): 'word' | undefined => (axis === 'word' ? axis : undefined);

const advanceHorizontalBoundarySelectionTarget = ({
  action,
  editor,
  getContentRootOwnerViewEditor,
  getMountedViewEditor,
  target,
}: {
  action: Extract<ContentRootViewSelectionAction, { kind: 'move' }>;
  editor: ContentRootNavigationEditor;
  getContentRootOwnerViewEditor?: (
    owner: PliteViewBoundaryOwner
  ) => ReactRuntimeEditor | null;
  getMountedViewEditor?: (root: RootKey) => ReactRuntimeEditor | null;
  target: ContentRootNavigationTarget;
}): ContentRootNavigationTarget => {
  if (action.axis === 'vertical') {
    return target;
  }

  const sourceEditor = getViewBoundaryPointEditor({
    editor,
    getContentRootOwnerViewEditor,
    getMountedViewEditor,
    owner: target.owner,
    root: target.root,
  });

  if (!sourceEditor) {
    return target;
  }

  const rootLocalTarget = getRootLocalHorizontalSelectionTarget({
    direction: action.direction,
    point: target.point,
    root: target.root,
    sourceEditor,
    unit: getHorizontalSelectionUnit(action.axis),
  });

  return rootLocalTarget && rootLocalTarget.root === target.root
    ? {
        ...rootLocalTarget,
        ...(target.owner ? { owner: target.owner } : {}),
      }
    : target;
};

const advanceVerticalBoundarySelectionTarget = ({
  action,
  anchorSelection,
  currentOwner,
  currentRoot,
  editor,
  getContentRootOwnerViewEditor,
  getMountedViewEditor,
  owners,
  target,
}: {
  action: Extract<ContentRootViewSelectionAction, { kind: 'move' }>;
  anchorSelection: PliteViewSelection;
  currentOwner?: PliteViewBoundaryOwner | null;
  currentRoot: RootKey;
  editor: ContentRootNavigationEditor;
  getContentRootOwnerViewEditor?: (
    owner: PliteViewBoundaryOwner
  ) => ReactRuntimeEditor | null;
  getMountedViewEditor?: (root: RootKey) => ReactRuntimeEditor | null;
  owners: PliteViewBoundaryOwner[];
  target: ContentRootNavigationTarget;
}): ContentRootNavigationTarget => {
  if (action.axis !== 'vertical') {
    return target;
  }

  const currentRootOwner =
    resolveKnownCurrentRootOwner(owners, currentOwner, currentRoot) ??
    owners.find((owner) => owner.childRoot === currentRoot);
  const fallbackPoint = currentRootOwner
    ? (resolveExitBoundary(editor, currentRootOwner, action.direction)?.point ??
      null)
    : target.owner
      ? getRootBoundaryNavigationTarget({
          direction: action.direction,
          editor,
          owner: target.owner,
        })?.point
      : null;

  if (
    !fallbackPoint ||
    !samePliteRootPoint(target.point, fallbackPoint, target.root)
  ) {
    return target;
  }

  const hasVisiblePart = (
    predicate: (
      segment: PliteViewSelection['segments']['parts'][number]
    ) => boolean
  ) =>
    editor.read((state) => {
      const roots = createPliteViewBoundaryRootMap(state.value());

      return anchorSelection.segments.parts.some((segment) => {
        if (!predicate(segment)) {
          return false;
        }

        const anchor = resolvePliteViewBoundarySegmentEndpoint(
          roots,
          segment,
          segment.start
        );
        const focus = resolvePliteViewBoundarySegmentEndpoint(
          roots,
          segment,
          segment.end
        );

        return !!anchor && !!focus && !RangeApi.isCollapsed({ anchor, focus });
      });
    });
  const hasAnyVisiblePart = hasVisiblePart(() => true);
  const hasVisibleTargetPart = hasVisiblePart(
    (segment) =>
      segment.root === target.root &&
      isSameContentRootOwner(segment.owner, target.owner)
  );
  const shouldAdvance =
    !hasAnyVisiblePart || (!!currentRootOwner && !hasVisibleTargetPart);

  if (!shouldAdvance) {
    return target;
  }

  const sourceEditor = getViewBoundaryPointEditor({
    editor,
    getContentRootOwnerViewEditor,
    getMountedViewEditor,
    owner: target.owner,
    root: target.root,
  });

  if (!sourceEditor) {
    return target;
  }

  const lineTarget = getRootLocalHorizontalSelectionTarget({
    direction: action.direction,
    point: target.point,
    root: target.root,
    sourceEditor,
    unit: 'line',
  });

  return lineTarget && lineTarget.root === target.root
    ? {
        ...lineTarget,
        ...(target.owner ? { owner: target.owner } : {}),
      }
    : target;
};

const getInitialProjectedSelectionAnchor = ({
  currentOwner,
  currentRoot,
  getActiveContentRootOwner,
  owners,
  selection,
}: {
  currentOwner?: PliteViewBoundaryOwner | null;
  currentRoot: RootKey;
  getActiveContentRootOwner?: (root: RootKey) => PliteViewBoundaryOwner | null;
  owners: readonly PliteViewBoundaryOwner[];
  selection: Range;
}): PliteViewBoundaryPoint => {
  const point = selection.anchor;
  const root = getPlitePointRoot(point, currentRoot);
  const owner =
    resolveKnownCurrentRootOwner(owners, currentOwner, root) ??
    getOwnerForRoot({
      currentRoot: root,
      getActiveContentRootOwner,
      owners,
    });

  return toViewBoundaryPoint({
    owner,
    point,
    root,
  });
};

const getTextPointAtPreferredOffset = (
  node: Descendant,
  path: Path,
  preferredOffset: number
): Point | null => {
  if (NodeApi.isText(node)) {
    return {
      offset: Math.min(preferredOffset, node.text.length),
      path,
    };
  }

  for (const [index, child] of node.children.entries()) {
    const point = getTextPointAtPreferredOffset(
      child,
      path.concat(index),
      preferredOffset
    );

    if (point) {
      return point;
    }
  }

  return null;
};

const getRootLocalVerticalModelSelectionTarget = ({
  direction,
  point,
  root,
  sourceEditor,
}: {
  direction: ContentRootNavigationDirection;
  point: Point;
  root: RootKey;
  sourceEditor: ReactRuntimeEditor;
}): ContentRootNavigationTarget | null =>
  sourceEditor.read((state) => {
    const children =
      toInternalRoot(state.view.root()) === root
        ? state.nodes.children()
        : readRootChildren(state, root);
    const blockIndex = point.path[0];

    if (blockIndex == null) {
      return null;
    }

    const nextBlockIndex =
      direction === 'forward' ? blockIndex + 1 : blockIndex - 1;
    const nextBlock = children[nextBlockIndex];

    if (!nextBlock) {
      return null;
    }

    const nextPoint = getTextPointAtPreferredOffset(
      nextBlock,
      [nextBlockIndex],
      point.offset
    );

    return nextPoint
      ? {
          point: rootPlitePoint(nextPoint, root),
          root,
        }
      : null;
  });

const isPointInRootTerminalBlock = ({
  direction,
  editor,
  point,
  root,
}: {
  direction: ContentRootNavigationDirection;
  editor: ContentRootNavigationEditor;
  point: Point;
  root: RootKey;
}) =>
  editor.read((state) => {
    const children = readRootChildren(state, root);
    const blockIndex = point.path[0];

    if (typeof blockIndex !== 'number' || children.length === 0) {
      return false;
    }

    return direction === 'forward'
      ? blockIndex === children.length - 1
      : blockIndex === 0;
  });

const getRootLocalVerticalSelectionTarget = ({
  direction,
  point,
  preferredX,
  root,
  sourceEditor,
}: {
  direction: ContentRootNavigationDirection;
  point: Point;
  preferredX?: number;
  root: RootKey;
  sourceEditor: ReactRuntimeEditor;
}): ContentRootNavigationTarget | null => {
  const sourceRect = resolveUsableRangeRect(
    sourceEditor,
    rootedRange(point, root)
  );
  const sourceElement = sourceEditor.api.dom.resolveDOMNode(sourceEditor);

  if (!hasUsableRect(sourceRect) || !sourceElement) {
    return getRootLocalVerticalModelSelectionTarget({
      direction,
      point,
      root,
      sourceEditor,
    });
  }

  const sourceElementRect = sourceElement.getBoundingClientRect();
  const step = Math.min(Math.max(sourceRect.height, 8), 24);
  const rawY =
    direction === 'forward'
      ? sourceRect.bottom + step / 2
      : sourceRect.top - step / 2;
  const y = clamp(
    rawY,
    sourceElementRect.top + 1,
    sourceElementRect.bottom - 1
  );
  const x = clamp(
    preferredX ?? sourceRect.left,
    sourceElementRect.left + 1,
    sourceElementRect.right - 1
  );
  const nextPoint = getPointAtCoordinates(sourceEditor, x, y);

  if (
    !nextPoint ||
    getPlitePointRoot(nextPoint, root) !== root ||
    samePliteRootPoint(nextPoint, point, root) ||
    nextPoint.path[0] === point.path[0]
  ) {
    return getRootLocalVerticalModelSelectionTarget({
      direction,
      point,
      root,
      sourceEditor,
    });
  }

  return {
    point: rootPlitePoint(nextPoint, root),
    root,
  };
};

const getViewGraphTarget = ({
  candidate,
  getActiveContentRootOwner,
  graph,
  owners,
}: {
  candidate: ContentRootNavigationTarget | null;
  getActiveContentRootOwner?: (root: RootKey) => PliteViewBoundaryOwner | null;
  graph: PliteViewBoundaryGraphModel;
  owners: readonly PliteViewBoundaryOwner[];
}): ContentRootNavigationTarget | null => {
  const holds = (target: ContentRootNavigationTarget) =>
    !!PliteViewBoundaryGraph.resolvePointNode(
      graph,
      toViewBoundaryPoint({
        owner: target.owner,
        point: target.point,
        root: target.root,
      })
    );

  if (!candidate || holds(candidate)) return candidate;
  if (candidate.owner) return null;

  const owner = getOwnerForRoot({
    currentRoot: candidate.root,
    getActiveContentRootOwner,
    owners,
  });
  const owned = owner && { ...candidate, owner };

  return owned && holds(owned) ? owned : null;
};

const getProjectedGraphVerticalSelectionTarget = ({
  direction,
  editor,
  graph,
  viewSelection,
}: {
  direction: ContentRootNavigationDirection;
  editor: ContentRootNavigationEditor;
  graph: PliteViewBoundaryGraphModel;
  viewSelection: PliteViewSelection;
}): ContentRootNavigationTarget | null => {
  const focusNode = PliteViewBoundaryGraph.resolvePointNode(
    graph,
    viewSelection.focus
  );
  const targetNode =
    focusNode &&
    (direction === 'forward'
      ? PliteViewBoundaryGraph.nextNode(graph, focusNode)
      : PliteViewBoundaryGraph.previousNode(graph, focusNode));

  if (!targetNode) {
    return null;
  }

  const point = editor.read((state) => {
    const node = getPliteDescendantAtPath(
      readRootChildren(state, targetNode.root),
      targetNode.path
    );

    return node
      ? getTextPointAtPreferredOffset(
          node,
          [...targetNode.path],
          viewSelection.focus.point.offset
        )
      : null;
  });

  return point
    ? {
        ...(targetNode.owner ? { owner: targetNode.owner } : {}),
        point: rootPlitePoint(point, targetNode.root),
        root: targetNode.root,
      }
    : null;
};

const getProjectedGraphTerminalLineTarget = ({
  direction,
  editor,
  getContentRootOwnerViewEditor,
  getMountedViewEditor,
  viewSelection,
}: {
  direction: ContentRootNavigationDirection;
  editor: ContentRootNavigationEditor;
  getContentRootOwnerViewEditor?: (
    owner: PliteViewBoundaryOwner
  ) => ReactRuntimeEditor | null;
  getMountedViewEditor?: (root: RootKey) => ReactRuntimeEditor | null;
  viewSelection: PliteViewSelection;
}): ContentRootNavigationTarget | null => {
  const { focus } = viewSelection;
  const root = getPliteViewBoundaryPointRoot(focus);
  const sourceEditor = getViewBoundaryPointEditor({
    editor,
    getContentRootOwnerViewEditor,
    getMountedViewEditor,
    owner: focus.owner,
    root,
  });

  if (!sourceEditor) {
    return null;
  }

  const lineTarget = getRootLocalHorizontalSelectionTarget({
    direction,
    point: focus.point,
    root,
    sourceEditor,
    unit: 'line',
  });

  if (
    !lineTarget ||
    lineTarget.root !== root ||
    samePliteRootPoint(lineTarget.point, focus.point, root)
  ) {
    return null;
  }

  return {
    ...lineTarget,
    ...(focus.owner ? { owner: focus.owner } : {}),
  };
};

const getContentRootMovementTarget = ({
  action,
  allowRootLocalMovement,
  advanceBoundaryTarget,
  currentRoot,
  currentOwner,
  editor,
  getActiveContentRootOwner,
  getContentRootOwnerViewEditor,
  getMountedViewEditor,
  owners,
  point,
  askExternalViews,
  preferredX,
}: {
  action: Extract<ContentRootViewSelectionAction, { kind: 'move' }>;
  allowRootLocalMovement: boolean;
  advanceBoundaryTarget: boolean;
  currentOwner?: PliteViewBoundaryOwner | null;
  currentRoot: RootKey;
  editor: ContentRootNavigationEditor;
  owners: PliteViewBoundaryOwner[];
  point: Point;
  askExternalViews?: boolean;
  preferredX?: number;
} & ContentRootViewEditorLookup): ContentRootNavigationTarget | null => {
  const getCurrentRootOwner = createCurrentRootOwnerLookup({
    currentOwner,
    currentRoot,
    getActiveContentRootOwner,
    owners,
  });
  const boundaryTarget =
    action.axis === 'line'
      ? null
      : action.axis === 'vertical'
        ? getVerticalNavigationTarget({
            currentRoot,
            direction: action.direction,
            editor,
            getActiveContentRootOwner: getCurrentRootOwner,
            getContentRootOwnerViewEditor,
            getMountedViewEditor,
            owners,
            point,
            preferredX,
            askExternalViews,
          })
        : getHorizontalNavigationTarget({
            currentRoot,
            direction: action.direction,
            editor,
            getActiveContentRootOwner: getCurrentRootOwner,
            owners,
            point,
          });

  if (boundaryTarget) {
    return advanceBoundaryTarget
      ? advanceHorizontalBoundarySelectionTarget({
          action,
          editor,
          getContentRootOwnerViewEditor,
          getMountedViewEditor,
          target: boundaryTarget,
        })
      : boundaryTarget;
  }

  if (!allowRootLocalMovement) {
    return null;
  }

  const sourceEditor = getViewBoundaryPointEditor({
    editor,
    getContentRootOwnerViewEditor,
    getMountedViewEditor,
    owner: currentOwner,
    root: currentRoot,
  });

  if (!sourceEditor) {
    return null;
  }

  const rootLocalTarget =
    action.axis === 'vertical'
      ? getRootLocalVerticalSelectionTarget({
          direction: action.direction,
          point,
          preferredX,
          root: currentRoot,
          sourceEditor,
        })
      : action.axis === 'line'
        ? {
            point: rootPlitePoint(
              getLineBoundaryPoint(
                sourceEditor,
                rootPlitePoint(point, currentRoot),
                action.direction === 'backward'
              ),
              currentRoot
            ),
            root: currentRoot,
          }
        : getRootLocalHorizontalSelectionTarget({
            direction: action.direction,
            point,
            root: currentRoot,
            sourceEditor,
            unit: getHorizontalSelectionUnit(action.axis),
          });

  const knownCurrentOwner = resolveKnownCurrentRootOwner(
    owners,
    currentOwner,
    currentRoot
  );

  return rootLocalTarget &&
    rootLocalTarget.root === currentRoot &&
    knownCurrentOwner
    ? {
        ...rootLocalTarget,
        owner: knownCurrentOwner,
      }
    : rootLocalTarget;
};

type ContentRootActionTargetInput = ContentRootViewEditorLookup & {
  askExternalViews?: boolean;
  editor: ContentRootNavigationEditor;
  preferredX?: number;
  selection: Range | null;
};

const getContentRootActionTarget = ({
  action,
  editor,
  getActiveContentRootOwner,
  getContentRootOwnerViewEditor,
  getMountedViewEditor,
  askExternalViews,
  preferredX,
  selection,
}: ContentRootActionTargetInput & {
  action: ContentRootNavigationAction | null;
}): ContentRootNavigationTarget | null => {
  if (!action || !hasContentRootOwner(editor)) {
    return null;
  }

  if (!selection || !RangeApi.isCollapsed(selection)) {
    return null;
  }

  const point = selection.anchor;
  const currentRoot =
    point.root ?? toInternalRoot(editor.read((state) => state.view.root()));
  const owners = findCrossingContentRootOwners(editor);
  const currentViewOwner = getOwnerForCurrentViewEditor({
    editor,
    getContentRootOwnerViewEditor,
    owners,
  });
  const getCurrentRootOwner = createCurrentRootOwnerLookup({
    currentOwner: currentViewOwner,
    currentRoot,
    getActiveContentRootOwner,
    owners,
  });

  if (action.kind === 'enter') {
    const ownerForCurrentRoot = getOwnerForRoot({
      currentRoot,
      getActiveContentRootOwner: getCurrentRootOwner,
      owners,
    });

    for (const owner of owners) {
      if (owner.ownerRoot !== currentRoot) {
        continue;
      }

      const start = getOwnerSelfBoundaryPoint(editor, owner, 'start');
      const end = getOwnerSelfBoundaryPoint(editor, owner, 'end');

      if (
        (start && samePliteRootPoint(point, start, currentRoot)) ||
        (end && samePliteRootPoint(point, end, currentRoot))
      ) {
        const chainedOwner = chainContentRootOwner(owner, ownerForCurrentRoot);

        return getRootBoundaryNavigationTarget({
          direction: 'forward',
          editor,
          owner: chainedOwner,
        });
      }
    }

    return null;
  }

  if (action.kind === 'document-boundary') {
    return getDocumentBoundaryNavigationTarget({
      direction: action.direction,
      editor,
      getActiveContentRootOwner: getCurrentRootOwner,
      owners,
    });
  }

  const rootCrossingMove =
    action.kind === 'delete'
      ? ({
          axis: 'horizontal',
          direction: action.direction,
          kind: 'move',
        } as const)
      : action;

  return getContentRootMovementTarget({
    action: rootCrossingMove,
    allowRootLocalMovement: false,
    advanceBoundaryTarget: rootCrossingMove.axis === 'word',
    currentOwner: currentViewOwner,
    currentRoot,
    editor,
    getActiveContentRootOwner: getCurrentRootOwner,
    getContentRootOwnerViewEditor,
    getMountedViewEditor,
    owners,
    point,
    preferredX,
    askExternalViews,
  });
};

export const getContentRootVerticalMoveTarget = ({
  direction,
  ...input
}: ContentRootActionTargetInput & {
  direction: ContentRootNavigationDirection;
}) =>
  getContentRootActionTarget({
    ...input,
    action: { axis: 'vertical', direction, kind: 'move' },
  });

const createProjectedSelectionFromRange = ({
  currentOwner,
  currentRoot,
  getActiveContentRootOwner,
  graph,
  owners,
  selection,
}: {
  currentOwner: PliteViewBoundaryOwner | null;
  currentRoot: RootKey;
  getActiveContentRootOwner?: (root: RootKey) => PliteViewBoundaryOwner | null;
  graph: PliteViewBoundaryGraphModel;
  owners: readonly PliteViewBoundaryOwner[];
  selection: Range;
}) => {
  const anchor = getInitialProjectedSelectionAnchor({
    currentOwner,
    currentRoot,
    getActiveContentRootOwner,
    owners,
    selection,
  });
  const focusRoot = selection.focus.root ?? currentRoot;

  return createPliteViewSelection(graph, {
    anchor,
    focus: toViewBoundaryPoint({
      owner: getOwnerForRoot({
        currentRoot: focusRoot,
        getActiveContentRootOwner,
        owners,
      }),
      point: selection.focus,
      root: focusRoot,
    }),
  });
};

export const shouldModelOwnContentRootVerticalSelection = ({
  editor,
  event,
  getActiveContentRootOwner,
  selection,
}: {
  editor: ReactRuntimeEditor;
  event: ReactKeyboardEvent<HTMLDivElement>;
  getActiveContentRootOwner?: (root: RootKey) => PliteViewBoundaryOwner | null;
  selection: Range | null;
}) => {
  if (
    !selection ||
    RangeApi.isCollapsed(selection) ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    !event.shiftKey ||
    (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') ||
    !hasContentRootOwner(editor)
  ) {
    return false;
  }

  const currentRoot =
    selection.focus.root ??
    toInternalRoot(editor.read((state) => state.view.root()));

  if (isSetRootOfOtherView(editor, selection.anchor.root ?? currentRoot)) {
    return false;
  }

  const owners = findCrossingContentRootOwners(editor);
  const graph = createContentRootViewBoundaryGraph(
    editor,
    owners,
    getActiveContentRootOwner
  );
  const projectedSelection = createProjectedSelectionFromRange({
    currentOwner: null,
    currentRoot,
    getActiveContentRootOwner,
    graph,
    owners,
    selection,
  });

  return projectedSelection.segments.parts.some(
    (segment) => segment.owner || segment.root !== currentRoot
  );
};

const applyContentRootViewSelectionAction = ({
  editor,
  element,
  sourceElement,
  action,
  extend = true,
  getActiveContentRootOwner,
  getContentRootOwnerViewEditor,
  getMountedViewEditor,
  preventDefault,
  preferredX,
  selection,
}: {
  editor: ReactRuntimeEditor;
  element: HTMLElement | null;
  sourceElement?: HTMLElement | null;
  action: ContentRootViewSelectionAction | null;
  extend?: boolean;
  preventDefault?: () => void;
  preferredX?: number;
  selection: Range | null;
} & ContentRootViewEditorLookup): ContentRootNavigationResult => {
  if (!action) {
    return { handled: false };
  }

  const owners = findCrossingContentRootOwners(editor);
  const viewSelection = readPliteViewSelection(editor);
  if (!extend || !hasContentRootOwner(editor)) return { handled: false };
  const currentViewOwner = getOwnerForCurrentViewEditor({
    editor,
    getContentRootOwnerViewEditor,
    owners,
  });
  const currentOwner = viewSelection
    ? (viewSelection.focus.owner ?? null)
    : currentViewOwner;
  const point = viewSelection?.focus.point ?? selection?.focus;
  const currentRoot = viewSelection
    ? getPliteViewBoundaryPointRoot(viewSelection.focus)
    : (point?.root ??
      toInternalRoot(editor.read((state) => state.view.root())));
  const selectionAnchorRoot =
    selection && !viewSelection
      ? (selection.anchor.root ?? currentRoot)
      : currentRoot;
  const selectionFocusRoot =
    selection && !viewSelection
      ? (selection.focus.root ?? currentRoot)
      : currentRoot;

  if (!point || (!viewSelection && !selection)) {
    return { handled: false };
  }

  if (!viewSelection && selectionAnchorRoot !== selectionFocusRoot) {
    return { handled: false };
  }

  if (
    isSetRootOfOtherView(
      editor,
      viewSelection
        ? getPliteViewBoundaryPointRoot(viewSelection.anchor)
        : selectionAnchorRoot
    )
  ) {
    return { handled: false };
  }

  const getCurrentRootOwner = createCurrentRootOwnerLookup({
    currentOwner,
    currentRoot,
    getActiveContentRootOwner,
    owners,
  });
  const graph = createContentRootViewBoundaryGraph(
    editor,
    owners,
    getCurrentRootOwner
  );
  const inView = (candidate: ContentRootNavigationTarget | null) =>
    getViewGraphTarget({
      candidate,
      getActiveContentRootOwner: getCurrentRootOwner,
      graph,
      owners,
    });
  let target = inView(
    action.kind === 'document-boundary'
      ? getDocumentBoundaryNavigationTarget({
          direction: action.direction,
          editor,
          getActiveContentRootOwner: getCurrentRootOwner,
          owners,
        })
      : getContentRootMovementTarget({
          action,
          allowRootLocalMovement: Boolean(viewSelection),
          advanceBoundaryTarget: true,
          currentOwner,
          currentRoot,
          editor,
          getActiveContentRootOwner: getCurrentRootOwner,
          getContentRootOwnerViewEditor,
          getMountedViewEditor,
          owners,
          point,
          preferredX,
        })
  );

  if (
    !target &&
    viewSelection &&
    action.kind === 'move' &&
    action.axis === 'vertical'
  ) {
    target = getProjectedGraphVerticalSelectionTarget({
      direction: action.direction,
      editor,
      graph,
      viewSelection,
    });

    if (!target) {
      target = getProjectedGraphTerminalLineTarget({
        direction: action.direction,
        editor,
        getContentRootOwnerViewEditor,
        getMountedViewEditor,
        viewSelection,
      });
    }
  }

  const selectionSourceEditor = getViewBoundaryPointEditor({
    editor,
    getContentRootOwnerViewEditor,
    getMountedViewEditor,
    owner: getCurrentRootOwner(currentRoot),
    root: currentRoot,
  });

  if (!target) {
    if (
      !viewSelection &&
      selection &&
      !RangeApi.isCollapsed(selection) &&
      action.kind === 'move' &&
      action.axis === 'vertical'
    ) {
      const projectedSelection = createProjectedSelectionFromRange({
        currentOwner,
        currentRoot,
        getActiveContentRootOwner: getCurrentRootOwner,
        graph,
        owners,
        selection,
      });
      const hasProjectedPart = projectedSelection.segments.parts.some(
        (segment) => segment.owner || segment.root !== currentRoot
      );

      if (hasProjectedPart) {
        const shown = showProjectedSelection(
          editor,
          projectedSelection,
          selection,
          element,
          sourceElement,
          selectionSourceEditor
        );
        preventDefault?.();

        return { handled: true, overtaken: !shown };
      }
    }

    if (viewSelection) {
      const shown = showProjectedSelection(
        editor,
        viewSelection,
        selection,
        element,
        sourceElement,
        selectionSourceEditor
      );
      preventDefault?.();

      return { handled: true, overtaken: !shown };
    }

    return { handled: false };
  }

  const anchor =
    viewSelection?.anchor ??
    getInitialProjectedSelectionAnchor({
      currentOwner,
      currentRoot,
      getActiveContentRootOwner: getCurrentRootOwner,
      owners,
      selection: selection ?? failInvariant('Expected value to be defined'),
    });
  const anchorRoot = getPliteViewBoundaryPointRoot(anchor);

  // Motion inside a set root is root-local: the selection write settles it in
  // the member, which a projected selection across members would leave.
  if (anchorRoot === target.root && isSetRootOf(editor, anchorRoot)) {
    return { handled: false };
  }
  let projectedSelection = createPliteViewSelection(graph, {
    anchor,
    focus: toViewBoundaryPoint({
      owner: target.owner,
      point: target.point,
      root: target.root,
    }),
  });

  const advanced =
    action.kind === 'move' &&
    inView(
      advanceVerticalBoundarySelectionTarget({
        action,
        anchorSelection: projectedSelection,
        currentOwner,
        currentRoot,
        editor,
        getContentRootOwnerViewEditor,
        getMountedViewEditor,
        owners,
        target,
      })
    );

  if (advanced) {
    projectedSelection = createPliteViewSelection(graph, {
      anchor,
      focus: toViewBoundaryPoint({
        owner: advanced.owner,
        point: advanced.point,
        root: advanced.root,
      }),
    });
  }

  if (
    viewSelection &&
    !isPliteViewSelectionCollapsed(projectedSelection) &&
    isEmptyProjectedSelection(editor, projectedSelection)
  ) {
    projectedSelection = createPliteViewSelection(graph, {
      anchor,
      focus: anchor,
    });
  }

  const shown = showProjectedSelection(
    editor,
    projectedSelection,
    selection,
    element,
    sourceElement,
    selectionSourceEditor
  );

  preventDefault?.();

  return {
    handled: true,
    overtaken: !shown,
  };
};

export const applyContentRootSelectionMoveCommand = ({
  command,
  editor,
  element,
  getActiveContentRootOwner,
  getContentRootOwnerViewEditor,
  getMountedViewEditor,
  isRTL = false,
  selection,
}: {
  command: ContentRootSelectionMoveCommand;
  editor: ReactRuntimeEditor<any>;
  element: HTMLElement | null;
  isRTL?: boolean;
  selection: Range | null;
} & ContentRootViewEditorLookup): ContentRootNavigationResult =>
  applyContentRootViewSelectionAction({
    action: getProjectedSelectionActionFromMoveCommand({
      command: { ...command, extend: true },
      isRTL,
    }),
    extend: Boolean(command.extend),
    editor,
    element,
    getActiveContentRootOwner,
    getContentRootOwnerViewEditor,
    getMountedViewEditor,
    selection,
  });

export const applyContentRootViewSelection = ({
  editor,
  event,
  getActiveContentRootOwner,
  getContentRootOwnerViewEditor,
  getMountedViewEditor,
  isRTL,
  preferredX,
  selection,
}: {
  editor: ReactRuntimeEditor;
  event: ReactKeyboardEvent<HTMLDivElement>;
  isRTL: boolean;
  preferredX?: number;
  selection: Range | null;
} & ContentRootViewEditorLookup): ContentRootNavigationResult =>
  asSelectionMotion(editor, () => {
    const sourceElement = isDOMNode(event.target)
      ? (findMountedEditableDOMRuntime(event.target)?.rootRef.current ?? null)
      : null;
    const result = applyContentRootViewSelectionAction({
      action: getProjectedSelectionAction({ event, isRTL }),
      editor,
      element: event.currentTarget,
      sourceElement,
      getActiveContentRootOwner,
      getContentRootOwnerViewEditor,
      getMountedViewEditor,
      preferredX,
      preventDefault: () => {
        event.preventDefault();
      },
      selection,
    });

    if (result.handled) ANSWERED_KEYS.add(event.nativeEvent);

    return result;
  });

export const applyContentRootNavigation = ({
  editor,
  event,
  focusEditor,
  getActiveContentRootOwner,
  getContentRootOwnerViewEditor,
  getMountedViewEditor,
  isRTL,
  preferredX,
  selection,
}: {
  editor: ReactRuntimeEditor;
  event: ReactKeyboardEvent<HTMLDivElement>;
  focusEditor?: (editor: ReactRuntimeEditor) => void;
  isRTL: boolean;
  preferredX?: number;
  selection: Range | null;
} & ContentRootViewEditorLookup): ContentRootNavigationResult =>
  asSelectionMotion(editor, () => {
    const action = getContentRootNavigationAction({ event, isRTL });

    // While a projected selection shows, a delete removes that selection
    // instead of moving the model caret into the neighboring content root.
    if (action?.kind === 'delete' && readProjectedSelection(editor)) {
      return { handled: false };
    }

    const target = getContentRootActionTarget({
      action,
      editor,
      getActiveContentRootOwner,
      getContentRootOwnerViewEditor,
      getMountedViewEditor,
      preferredX,
      selection,
    });

    if (!target) {
      return { handled: false };
    }

    return selectContentRootTarget({
      editor,
      event,
      focusEditor,
      getContentRootOwnerViewEditor,
      getMountedViewEditor,
      target,
    });
  });

/**
 * A plain Left or Right arrow over a projected selection collapses it to the
 * edge in its direction. It must run before the other Left and Right
 * handlers, because while the selection crosses roots the model caret they
 * read is only its anchor.
 */
export const collapseProjectedSelection = ({
  editor,
  event,
  focusEditor,
  getContentRootOwnerViewEditor,
  getMountedViewEditor,
  isRTL,
}: {
  editor: ReactRuntimeEditor;
  event: ReactKeyboardEvent<HTMLDivElement>;
  focusEditor?: (editor: ReactRuntimeEditor) => void;
  isRTL: boolean;
} & ContentRootViewEditorLookup): ContentRootNavigationResult => {
  const action = getContentRootNavigationAction({ event, isRTL });
  const projected = readProjectedSelection(editor);

  if (!projected || action?.kind !== 'move' || action.axis !== 'horizontal') {
    return { handled: false };
  }

  const edge = collapsePliteViewSelection(
    projected,
    action.direction === 'backward' ? 'start' : 'end'
  );

  return selectContentRootTarget({
    editor,
    event,
    focusEditor,
    getContentRootOwnerViewEditor,
    getMountedViewEditor,
    target: {
      ...(edge.owner ? { owner: edge.owner } : {}),
      point: edge.point,
      root: getPliteViewBoundaryPointRoot(edge),
    },
  });
};

const readProjectedSelection = (editor: ReactRuntimeEditor) => {
  const shown = readPliteViewSelection(editor);

  return shown && !isPliteViewSelectionCollapsed(shown) ? shown : null;
};

const selectContentRootTarget = ({
  editor,
  event,
  focusEditor,
  getContentRootOwnerViewEditor,
  getMountedViewEditor,
  target,
}: {
  editor: ReactRuntimeEditor;
  event: ReactKeyboardEvent<HTMLDivElement>;
  focusEditor?: (editor: ReactRuntimeEditor) => void;
  target: ContentRootNavigationTarget;
} & ContentRootViewEditorLookup): ContentRootNavigationResult => {
  const targetEditor = getViewBoundaryPointEditor({
    editor,
    getContentRootOwnerViewEditor,
    getMountedViewEditor,
    owner: target.owner,
    root: target.root,
  });

  event.preventDefault();
  writePliteViewSelection(editor, null, {
    place: () => {
      selectContentRoot(targetEditor, rootedRange(target.point, target.root));
    },
  });

  if (targetEditor !== editor) {
    focusEditor?.(targetEditor);
    const sourceElement = event.currentTarget ?? null;
    const focused = sourceElement
      ? focusedElementOnPage(sourceElement.getRootNode())
      : null;
    const targetRuntime = focused
      ? findMountedEditableDOMRuntime(focused)
      : null;
    const targetElement =
      targetRuntime?.editor === targetEditor
        ? targetRuntime.rootRef.current
        : null;
    const domPhaseScheduler =
      targetRuntime?.domPhaseScheduler ??
      (sourceElement
        ? findMountedEditableDOMRuntime(sourceElement)?.domPhaseScheduler
        : undefined);
    const { version } = editor.read.runtime.snapshot();
    const viewSelection = readPliteViewSelection(editor);
    const focusScope = targetElement ?? sourceElement;
    const superseded = watchFocusSuperseded(targetEditor, focusScope);
    const movedToExternalControl = () => {
      if (!focusScope) return false;
      if (isFocusRequestedElsewhere(targetEditor, focusScope)) return true;

      const active = focusedElementOnPage(focusScope.getRootNode());

      return (
        !!active &&
        active !== targetElement &&
        active !== focusScope.ownerDocument.body &&
        active !== focusScope.ownerDocument.documentElement &&
        !(targetElement && containsShadowAware(targetElement, active)) &&
        !(sourceElement && containsShadowAware(sourceElement, active))
      );
    };
    const nothingSelectedSince = () =>
      !superseded() &&
      !movedToExternalControl() &&
      editor.read.runtime.snapshot().version === version &&
      readPliteViewSelection(editor) === viewSelection &&
      claimPageSelection();

    domPhaseScheduler?.schedule(
      'dom-write',
      'focus-content-root-editor',
      () => {
        if (nothingSelectedSince()) focusEditor?.(targetEditor);
      },
      { timing: 'animation-frame' }
    );
  }

  return { handled: true };
};
