import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import {
  type Descendant,
  NodeApi,
  type Path,
  PathApi,
  type Point,
  type Range,
  RangeApi,
  type RootKey,
} from '@platejs/slate';
import { scheduleSlateReactFocus } from '../hooks/focus-scheduler';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { MAIN_ROOT_KEY } from '../root-key';
import {
  createSlateViewBoundaryRootMap,
  getSlateDescendantAtPath,
  getSlatePointRoot,
  getSlateRootBoundaryPoint,
  getSlateViewBoundaryPointRoot,
  resolveSlateViewBoundarySegmentEndpoint,
  rootSlatePoint,
  SlateViewBoundaryGraph,
  type SlateViewBoundaryGraphModel,
  type SlateViewBoundaryPoint,
  sameSlateRootPoint,
} from '../view-boundary-graph';
import {
  createSlateViewSelection,
  readSlateViewSelection,
  type SlateViewSelection,
  writeSlateViewSelection,
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
  type ContentRootOwner,
  createContentRootProjectionGraph,
  findContentRootOwners,
  getOwnerForCurrentViewEditor,
  getOwnerForRoot,
  getRegisteredRootViewEditor,
  hasContentRootElementSpec,
  isKnownContentRootOwner,
  isSameContentRootOwner,
} from './content-root-owners';
import {
  clamp,
  getPathElement,
  isPointOnVisualBoundaryLine,
  resolveVerticalNavigationPoint,
} from './content-root-vertical-geometry';
import { Editor } from './runtime-editor-api';

export {
  type ContentRootOwner,
  createContentRootProjectionGraph,
  findContentRootOwners,
} from './content-root-owners';

type ContentRootNavigationTarget = {
  owner?: ContentRootOwner;
  point: Point;
  root: RootKey;
};

export type ContentRootNavigationResult = {
  handled: boolean;
  target?: ContentRootNavigationTarget;
};

const isPointInPath = (point: Point, path: Path) =>
  PathApi.equals(point.path, path) || PathApi.isDescendant(point.path, path);

const rootedRange = (point: Point, root: RootKey): Range => {
  const rooted = rootSlatePoint(point, root);

  return {
    anchor: rooted,
    focus: rooted,
  };
};

const toProjectedPoint = ({
  owner,
  point,
  root,
}: {
  owner: ContentRootOwner | null | undefined;
  point: Point;
  root: RootKey;
}): SlateViewBoundaryPoint => ({
  ...(owner ? { owner } : {}),
  point: rootSlatePoint(point, root),
});

const collapseNativeSelectionForProjectedSelection = (
  editor: ReactRuntimeEditor,
  selection: Range | null
) => {
  if (!selection) {
    return;
  }

  const domApi = editor.api.dom;

  if (!domApi) {
    return;
  }

  let document: Document;

  try {
    document = domApi.getWindow().document;
  } catch {
    return;
  }

  const domSelection = document.getSelection();

  if (!domSelection) {
    return;
  }

  const clear = () => {
    domSelection.removeAllRanges();
  };

  clear();
  document.defaultView?.queueMicrotask(clear);
  document.defaultView?.requestAnimationFrame(clear);
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

  editor.update((tx) => {
    tx.selection.set(range);
  });
};

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
  (editor.read((state) => state.view.root()) === root
    ? (editor as ReactRuntimeEditor)
    : null);

const getProjectedPointViewEditor = ({
  editor,
  getContentRootOwnerViewEditor,
  getMountedViewEditor,
  owner,
  root,
}: {
  editor: ContentRootNavigationEditor;
  getContentRootOwnerViewEditor?: (
    owner: ContentRootOwner
  ) => ReactRuntimeEditor | null;
  getMountedViewEditor?: (root: RootKey) => ReactRuntimeEditor | null;
  owner: ContentRootOwner | null | undefined;
  root: RootKey;
}): ReactRuntimeEditor | null =>
  (owner ? getContentRootOwnerViewEditor?.(owner) : null) ??
  getRootViewEditor({
    editor,
    getMountedViewEditor,
    root,
  }) ??
  (editor as ReactRuntimeEditor);

const getVerticalNavigationTarget = ({
  currentRoot,
  direction,
  editor,
  getActiveContentRootOwner,
  getContentRootOwnerViewEditor,
  getMountedViewEditor,
  owners,
  point,
}: {
  currentRoot: RootKey;
  direction: ContentRootNavigationDirection;
  editor: ContentRootNavigationEditor;
  getActiveContentRootOwner?: (root: RootKey) => ContentRootOwner | null;
  getContentRootOwnerViewEditor?: (
    owner: ContentRootOwner
  ) => ReactRuntimeEditor | null;
  getMountedViewEditor?: (root: RootKey) => ReactRuntimeEditor | null;
  owners: ContentRootOwner[];
  point: Point;
}): ContentRootNavigationTarget | null => {
  const activeOwner = getActiveContentRootOwner?.(currentRoot);
  const ownerForCurrentRoot = isKnownContentRootOwner(owners, activeOwner)
    ? activeOwner
    : owners.find((owner) => owner.childRoot === currentRoot);

  if (ownerForCurrentRoot) {
    const sourceEditor = getProjectedPointViewEditor({
      editor,
      getContentRootOwnerViewEditor,
      getMountedViewEditor,
      owner: ownerForCurrentRoot,
      root: currentRoot,
    });
    const rootEdge = editor.read((state) =>
      getSlateRootBoundaryPoint(
        state.value.root(
          currentRoot === MAIN_ROOT_KEY ? undefined : currentRoot
        ),
        direction === 'forward' ? 'end' : 'start'
      )
    );
    const atModelBoundary =
      rootEdge && sameSlateRootPoint(point, rootEdge, currentRoot);
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
    const exitPoint =
      atModelBoundary || atVisualBoundary
        ? getExitBoundaryPoint(editor, ownerForCurrentRoot, direction)
        : null;

    if (!exitPoint) {
      return null;
    }

    const targetEditor = getRootViewEditor({
      editor,
      getMountedViewEditor,
      root: ownerForCurrentRoot.ownerRoot,
    });
    const targetPoint =
      sourceEditor && targetEditor
        ? resolveVerticalNavigationPoint({
            currentRoot,
            direction,
            fallbackPoint: exitPoint,
            point,
            sourceEditor,
            targetEditor,
            targetRoot: ownerForCurrentRoot.ownerRoot,
          })
        : null;
    const resolvedTargetPoint =
      targetPoint ?? (atTerminalBlock ? exitPoint : null);

    return resolvedTargetPoint
      ? {
          point: resolvedTargetPoint,
          root: ownerForCurrentRoot.ownerRoot,
        }
      : null;
  }

  for (const owner of owners) {
    if (owner.ownerRoot !== currentRoot) {
      continue;
    }

    const sourceEditor = getRootViewEditor({
      editor,
      getMountedViewEditor,
      root: currentRoot,
    });
    const targetEditor =
      getContentRootOwnerViewEditor?.(owner) ??
      getRootViewEditor({
        editor,
        getMountedViewEditor,
        root: owner.childRoot,
      });
    const entryPoint = getOwnerBoundaryPoint(editor, owner, direction);
    const adjacentBoundary = getOwnerAdjacentBoundary(editor, owner, direction);
    const atModelBoundary =
      entryPoint && sameSlateRootPoint(point, entryPoint, currentRoot);
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
      owner,
    });
    const targetPoint =
      fallbackTarget && sourceEditor && targetEditor
        ? resolveVerticalNavigationPoint({
            currentRoot,
            direction,
            fallbackPoint: fallbackTarget.point,
            point,
            sourceEditor,
            targetEditor,
            targetRoot: owner.childRoot,
          })
        : null;

    if (targetPoint) {
      return {
        owner,
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
  getActiveContentRootOwner?: (root: RootKey) => ContentRootOwner | null;
  owners: ContentRootOwner[];
  point: Point;
}): ContentRootNavigationTarget | null => {
  const activeOwner = getActiveContentRootOwner?.(currentRoot);
  const ownerForCurrentRoot = isKnownContentRootOwner(owners, activeOwner)
    ? activeOwner
    : owners.find((owner) => owner.childRoot === currentRoot);

  if (ownerForCurrentRoot) {
    const rootEdge = editor.read((state) =>
      getSlateRootBoundaryPoint(
        state.value.root(
          currentRoot === MAIN_ROOT_KEY ? undefined : currentRoot
        ),
        direction === 'forward' ? 'end' : 'start'
      )
    );
    const exitPoint =
      rootEdge && sameSlateRootPoint(point, rootEdge, currentRoot)
        ? getExitBoundaryPoint(editor, ownerForCurrentRoot, direction)
        : null;

    return exitPoint
      ? {
          point: exitPoint,
          root: ownerForCurrentRoot.ownerRoot,
        }
      : null;
  }

  for (const owner of owners) {
    if (owner.ownerRoot !== currentRoot) {
      continue;
    }

    const entryPoint = getOwnerBoundaryPoint(editor, owner, direction);

    if (entryPoint && sameSlateRootPoint(point, entryPoint, currentRoot)) {
      return getRootBoundaryNavigationTarget({
        direction,
        editor,
        owner,
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
  const rootedPoint = rootSlatePoint(point, root);
  const nextPoint = sourceEditor.read((state) =>
    direction === 'forward'
      ? Editor.after(sourceEditor, rootedPoint, unit ? { unit } : undefined)
      : Editor.before(sourceEditor, rootedPoint, unit ? { unit } : undefined)
  );

  if (!nextPoint || getSlatePointRoot(nextPoint, root) !== root) {
    return null;
  }

  return {
    point: rootSlatePoint(nextPoint, root),
    root,
  };
};

const getHorizontalSelectionUnit = (
  axis: ContentRootNavigationAxis
): 'line' | 'word' | undefined =>
  axis === 'line' || axis === 'word' ? axis : undefined;

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
    owner: ContentRootOwner
  ) => ReactRuntimeEditor | null;
  getMountedViewEditor?: (root: RootKey) => ReactRuntimeEditor | null;
  target: ContentRootNavigationTarget;
}): ContentRootNavigationTarget => {
  if (action.axis === 'vertical') {
    return target;
  }

  const sourceEditor = getProjectedPointViewEditor({
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
  selection,
  target,
}: {
  action: Extract<ContentRootViewSelectionAction, { kind: 'move' }>;
  anchorSelection: SlateViewSelection;
  currentOwner?: ContentRootOwner | null;
  currentRoot: RootKey;
  editor: ContentRootNavigationEditor;
  getContentRootOwnerViewEditor?: (
    owner: ContentRootOwner
  ) => ReactRuntimeEditor | null;
  getMountedViewEditor?: (root: RootKey) => ReactRuntimeEditor | null;
  owners: ContentRootOwner[];
  selection: Range | null;
  target: ContentRootNavigationTarget;
}): ContentRootNavigationTarget => {
  if (action.axis !== 'vertical') {
    return target;
  }

  const currentRootOwner = isKnownContentRootOwner(owners, currentOwner)
    ? currentOwner
    : owners.find((owner) => owner.childRoot === currentRoot);
  const fallbackPoint = currentRootOwner
    ? getExitBoundaryPoint(editor, currentRootOwner, action.direction)
    : target.owner
      ? getRootBoundaryNavigationTarget({
          direction: action.direction,
          editor,
          owner: target.owner,
        })?.point
      : null;

  if (
    !fallbackPoint ||
    !sameSlateRootPoint(target.point, fallbackPoint, target.root)
  ) {
    return target;
  }

  const hasVisiblePart = (
    predicate: (
      segment: SlateViewSelection['segments']['parts'][number]
    ) => boolean
  ) =>
    editor.read((state) => {
      const roots = createSlateViewBoundaryRootMap(state.value.get());

      return anchorSelection.segments.parts.some((segment) => {
        if (!predicate(segment)) {
          return false;
        }

        const anchor = resolveSlateViewBoundarySegmentEndpoint(
          roots,
          segment,
          segment.start
        );
        const focus = resolveSlateViewBoundarySegmentEndpoint(
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

  const sourceEditor = getProjectedPointViewEditor({
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
  currentOwner?: ContentRootOwner | null;
  currentRoot: RootKey;
  getActiveContentRootOwner?: (root: RootKey) => ContentRootOwner | null;
  owners: readonly ContentRootOwner[];
  selection: Range;
}): SlateViewBoundaryPoint => {
  const point = selection.anchor;
  const root = getSlatePointRoot(point, currentRoot);
  const owner =
    isKnownContentRootOwner(owners, currentOwner) &&
    currentOwner.childRoot === root
      ? currentOwner
      : getOwnerForRoot({
          currentRoot: root,
          getActiveContentRootOwner,
          owners,
        });

  return toProjectedPoint({
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
    const children = (
      state.view.root() === root
        ? state.nodes.children()
        : state.value.root(root === MAIN_ROOT_KEY ? undefined : root)
    ) as readonly Descendant[];
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
          point: rootSlatePoint(nextPoint, root),
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
    const children = state.value.root(
      root === MAIN_ROOT_KEY ? undefined : root
    );
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
  root,
  sourceEditor,
}: {
  direction: ContentRootNavigationDirection;
  point: Point;
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
    sourceRect.left,
    sourceElementRect.left + 1,
    sourceElementRect.right - 1
  );
  const nextPoint = getPointAtCoordinates(sourceEditor, x, y);

  if (
    !nextPoint ||
    getSlatePointRoot(nextPoint, root) !== root ||
    sameSlateRootPoint(nextPoint, point, root) ||
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
    point: rootSlatePoint(nextPoint, root),
    root,
  };
};

const getProjectedGraphVerticalSelectionTarget = ({
  direction,
  editor,
  graph,
  viewSelection,
}: {
  direction: ContentRootNavigationDirection;
  editor: ContentRootNavigationEditor;
  graph: SlateViewBoundaryGraphModel;
  viewSelection: SlateViewSelection;
}): ContentRootNavigationTarget | null => {
  const focusNode = SlateViewBoundaryGraph.resolvePointNode(
    graph,
    viewSelection.focus
  );
  const targetNode =
    focusNode &&
    (direction === 'forward'
      ? SlateViewBoundaryGraph.nextNode(graph, focusNode)
      : SlateViewBoundaryGraph.previousNode(graph, focusNode));

  if (!targetNode) {
    return null;
  }

  const point = editor.read((state) => {
    const node = getSlateDescendantAtPath(
      state.value.root(
        targetNode.root === MAIN_ROOT_KEY ? undefined : targetNode.root
      ),
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
        point: rootSlatePoint(point, targetNode.root),
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
    owner: ContentRootOwner
  ) => ReactRuntimeEditor | null;
  getMountedViewEditor?: (root: RootKey) => ReactRuntimeEditor | null;
  viewSelection: SlateViewSelection;
}): ContentRootNavigationTarget | null => {
  const focus = viewSelection.focus;
  const root = getSlateViewBoundaryPointRoot(focus);
  const sourceEditor = getProjectedPointViewEditor({
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
    sameSlateRootPoint(lineTarget.point, focus.point, root)
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
}: {
  action: Extract<ContentRootViewSelectionAction, { kind: 'move' }>;
  allowRootLocalMovement: boolean;
  advanceBoundaryTarget: boolean;
  currentOwner?: ContentRootOwner | null;
  currentRoot: RootKey;
  editor: ContentRootNavigationEditor;
  getActiveContentRootOwner?: (root: RootKey) => ContentRootOwner | null;
  getContentRootOwnerViewEditor?: (
    owner: ContentRootOwner
  ) => ReactRuntimeEditor | null;
  getMountedViewEditor?: (root: RootKey) => ReactRuntimeEditor | null;
  owners: ContentRootOwner[];
  point: Point;
}): ContentRootNavigationTarget | null => {
  const getCurrentRootOwner = (root: RootKey) =>
    root === currentRoot && isKnownContentRootOwner(owners, currentOwner)
      ? currentOwner
      : (getActiveContentRootOwner?.(root) ?? null);
  const boundaryTarget =
    action.kind === 'move' && action.axis === 'vertical'
      ? getVerticalNavigationTarget({
          currentRoot,
          direction: action.direction,
          editor,
          getActiveContentRootOwner: getCurrentRootOwner,
          getContentRootOwnerViewEditor,
          getMountedViewEditor,
          owners,
          point,
        })
      : action.kind === 'move'
        ? getHorizontalNavigationTarget({
            currentRoot,
            direction: action.direction,
            editor,
            getActiveContentRootOwner: getCurrentRootOwner,
            owners,
            point,
          })
        : null;

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

  const sourceEditor = getProjectedPointViewEditor({
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
          root: currentRoot,
          sourceEditor,
        })
      : getRootLocalHorizontalSelectionTarget({
          direction: action.direction,
          point,
          root: currentRoot,
          sourceEditor,
          unit: getHorizontalSelectionUnit(action.axis),
        });

  return rootLocalTarget &&
    rootLocalTarget.root === currentRoot &&
    isKnownContentRootOwner(owners, currentOwner)
    ? {
        ...rootLocalTarget,
        owner: currentOwner,
      }
    : rootLocalTarget;
};

export const getContentRootNavigationTarget = ({
  editor,
  event,
  getActiveContentRootOwner,
  getContentRootOwnerViewEditor,
  getMountedViewEditor,
  isRTL,
  selection,
}: {
  editor: ContentRootNavigationEditor;
  event: ReactKeyboardEvent<HTMLDivElement>;
  getActiveContentRootOwner?: (root: RootKey) => ContentRootOwner | null;
  getContentRootOwnerViewEditor?: (
    owner: ContentRootOwner
  ) => ReactRuntimeEditor | null;
  getMountedViewEditor?: (root: RootKey) => ReactRuntimeEditor | null;
  isRTL: boolean;
  selection: Range | null;
}): ContentRootNavigationTarget | null => {
  const action = getContentRootNavigationAction({ event, isRTL });

  if (!action || !hasContentRootElementSpec(editor)) {
    return null;
  }

  if (!selection || !RangeApi.isCollapsed(selection)) {
    return null;
  }

  const point = selection.anchor;
  const currentRoot = point.root ?? editor.read((state) => state.view.root());
  const owners = findContentRootOwners(editor);
  const currentViewOwner = getOwnerForCurrentViewEditor({
    editor,
    getContentRootOwnerViewEditor,
    owners,
  });
  const getCurrentRootOwner = (root: RootKey) =>
    root === currentRoot && isKnownContentRootOwner(owners, currentViewOwner)
      ? currentViewOwner
      : (getActiveContentRootOwner?.(root) ?? null);

  if (action.kind === 'enter') {
    for (const owner of owners) {
      if (owner.ownerRoot !== currentRoot) {
        continue;
      }

      const start = getOwnerSelfBoundaryPoint(editor, owner, 'start');
      const end = getOwnerSelfBoundaryPoint(editor, owner, 'end');

      if (
        (start && sameSlateRootPoint(point, start, currentRoot)) ||
        (end && sameSlateRootPoint(point, end, currentRoot))
      ) {
        return getRootBoundaryNavigationTarget({
          direction: 'forward',
          editor,
          owner,
        });
      }
    }

    return null;
  }

  if (action.kind === 'document-boundary') {
    return getDocumentBoundaryNavigationTarget({
      currentRoot,
      direction: action.direction,
      editor,
      getActiveContentRootOwner: getCurrentRootOwner,
      owners,
    });
  }

  return getContentRootMovementTarget({
    action,
    allowRootLocalMovement: false,
    advanceBoundaryTarget: action.axis === 'word',
    currentOwner: currentViewOwner,
    currentRoot,
    editor,
    getActiveContentRootOwner: getCurrentRootOwner,
    getContentRootOwnerViewEditor,
    getMountedViewEditor,
    owners,
    point,
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
  getActiveContentRootOwner?: (root: RootKey) => ContentRootOwner | null;
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
    !hasContentRootElementSpec(editor)
  ) {
    return false;
  }

  const owners = findContentRootOwners(editor);
  const currentRoot =
    selection.focus.root ?? editor.read((state) => state.view.root());
  const graph = createContentRootProjectionGraph(editor, owners);
  const anchor = getInitialProjectedSelectionAnchor({
    currentOwner: null,
    currentRoot,
    getActiveContentRootOwner,
    owners,
    selection,
  });
  const focusRoot = selection.focus.root ?? currentRoot;
  const projectedSelection = createSlateViewSelection(graph, {
    anchor,
    focus: toProjectedPoint({
      owner: getOwnerForRoot({
        currentRoot: focusRoot,
        getActiveContentRootOwner,
        owners,
      }),
      point: selection.focus,
      root: focusRoot,
    }),
  });

  return projectedSelection.segments.parts.some(
    (segment) => segment.owner || segment.root !== currentRoot
  );
};

const applyContentRootViewSelectionAction = ({
  editor,
  action,
  getActiveContentRootOwner,
  getContentRootOwnerViewEditor,
  getMountedViewEditor,
  preventDefault,
  selection,
}: {
  editor: ReactRuntimeEditor;
  action: ContentRootViewSelectionAction | null;
  getActiveContentRootOwner?: (root: RootKey) => ContentRootOwner | null;
  getContentRootOwnerViewEditor?: (
    owner: ContentRootOwner
  ) => ReactRuntimeEditor | null;
  getMountedViewEditor?: (root: RootKey) => ReactRuntimeEditor | null;
  preventDefault?: () => void;
  selection: Range | null;
}): ContentRootNavigationResult => {
  if (!action || !hasContentRootElementSpec(editor)) {
    return { handled: false };
  }

  const owners = findContentRootOwners(editor);
  const viewSelection = readSlateViewSelection(editor);
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
    ? getSlateViewBoundaryPointRoot(viewSelection.focus)
    : (point?.root ?? editor.read((state) => state.view.root()));
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

  const getCurrentRootOwner = (root: RootKey) =>
    root === currentRoot && isKnownContentRootOwner(owners, currentOwner)
      ? currentOwner
      : (getActiveContentRootOwner?.(root) ?? null);

  const graph = createContentRootProjectionGraph(editor, owners);
  let target =
    action.kind === 'document-boundary'
      ? getDocumentBoundaryNavigationTarget({
          currentRoot,
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
          getActiveContentRootOwner,
          getContentRootOwnerViewEditor,
          getMountedViewEditor,
          owners,
          point,
        });

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

  if (!target) {
    if (
      !viewSelection &&
      selection &&
      !RangeApi.isCollapsed(selection) &&
      action.kind === 'move' &&
      action.axis === 'vertical'
    ) {
      const anchor = getInitialProjectedSelectionAnchor({
        currentOwner,
        currentRoot,
        getActiveContentRootOwner,
        owners,
        selection,
      });
      const focusRoot = selection.focus.root ?? currentRoot;
      const projectedSelection = createSlateViewSelection(graph, {
        anchor,
        focus: toProjectedPoint({
          owner: getOwnerForRoot({
            currentRoot: focusRoot,
            getActiveContentRootOwner,
            owners,
          }),
          point: selection.focus,
          root: focusRoot,
        }),
      });
      const hasProjectedPart = projectedSelection.segments.parts.some(
        (segment) => segment.owner || segment.root !== currentRoot
      );

      if (hasProjectedPart) {
        writeSlateViewSelection(editor, projectedSelection);
        collapseModelSelectionForProjectedSelection(editor, selection);
        collapseNativeSelectionForProjectedSelection(editor, selection);
        preventDefault?.();

        return { handled: true };
      }
    }

    if (viewSelection) {
      collapseModelSelectionForProjectedSelection(editor, selection);
      collapseNativeSelectionForProjectedSelection(editor, selection);
      preventDefault?.();

      return { handled: true };
    }

    return { handled: false };
  }

  const anchor =
    viewSelection?.anchor ??
    getInitialProjectedSelectionAnchor({
      currentOwner,
      currentRoot,
      getActiveContentRootOwner,
      owners,
      selection: selection!,
    });
  let projectedSelection = createSlateViewSelection(graph, {
    anchor,
    focus: toProjectedPoint({
      owner: target.owner,
      point: target.point,
      root: target.root,
    }),
  });

  if (action.kind === 'move') {
    target = advanceVerticalBoundarySelectionTarget({
      action,
      anchorSelection: projectedSelection,
      currentOwner,
      currentRoot,
      editor,
      getContentRootOwnerViewEditor,
      getMountedViewEditor,
      owners,
      selection,
      target,
    });
    projectedSelection = createSlateViewSelection(graph, {
      anchor,
      focus: toProjectedPoint({
        owner: target.owner,
        point: target.point,
        root: target.root,
      }),
    });
  }

  writeSlateViewSelection(editor, projectedSelection);
  collapseModelSelectionForProjectedSelection(editor, selection);
  collapseNativeSelectionForProjectedSelection(editor, selection);

  preventDefault?.();

  return {
    handled: true,
    target,
  };
};

export const applyContentRootSelectionMoveCommand = ({
  command,
  editor,
  getActiveContentRootOwner,
  getContentRootOwnerViewEditor,
  getMountedViewEditor,
  isRTL = false,
  selection,
}: {
  command: ContentRootSelectionMoveCommand;
  editor: ReactRuntimeEditor;
  getActiveContentRootOwner?: (root: RootKey) => ContentRootOwner | null;
  getContentRootOwnerViewEditor?: (
    owner: ContentRootOwner
  ) => ReactRuntimeEditor | null;
  getMountedViewEditor?: (root: RootKey) => ReactRuntimeEditor | null;
  isRTL?: boolean;
  selection: Range | null;
}): ContentRootNavigationResult =>
  applyContentRootViewSelectionAction({
    action: getProjectedSelectionActionFromMoveCommand({ command, isRTL }),
    editor,
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
  selection,
}: {
  editor: ReactRuntimeEditor;
  event: ReactKeyboardEvent<HTMLDivElement>;
  getActiveContentRootOwner?: (root: RootKey) => ContentRootOwner | null;
  getContentRootOwnerViewEditor?: (
    owner: ContentRootOwner
  ) => ReactRuntimeEditor | null;
  getMountedViewEditor?: (root: RootKey) => ReactRuntimeEditor | null;
  isRTL: boolean;
  selection: Range | null;
}): ContentRootNavigationResult =>
  applyContentRootViewSelectionAction({
    action: getProjectedSelectionAction({ event, isRTL }),
    editor,
    getActiveContentRootOwner,
    getContentRootOwnerViewEditor,
    getMountedViewEditor,
    preventDefault: () => event.preventDefault(),
    selection,
  });

export const applyContentRootNavigation = ({
  editor,
  event,
  focusEditor,
  getActiveContentRootOwner,
  getContentRootOwnerViewEditor,
  getMountedViewEditor,
  isRTL,
  selection,
}: {
  editor: ReactRuntimeEditor;
  event: ReactKeyboardEvent<HTMLDivElement>;
  focusEditor?: (editor: ReactRuntimeEditor) => void;
  getActiveContentRootOwner?: (root: RootKey) => ContentRootOwner | null;
  getContentRootOwnerViewEditor?: (
    owner: ContentRootOwner
  ) => ReactRuntimeEditor | null;
  getMountedViewEditor?: (root: RootKey) => ReactRuntimeEditor | null;
  isRTL: boolean;
  selection: Range | null;
}): ContentRootNavigationResult => {
  const target = getContentRootNavigationTarget({
    editor,
    event,
    getActiveContentRootOwner,
    getContentRootOwnerViewEditor,
    getMountedViewEditor,
    isRTL,
    selection,
  });

  if (!target) {
    return { handled: false };
  }

  const targetEditor =
    (target.owner ? getContentRootOwnerViewEditor?.(target.owner) : null) ??
    getMountedViewEditor?.(target.root) ??
    getRegisteredRootViewEditor(editor, target.root) ??
    editor;

  event.preventDefault();
  writeSlateViewSelection(editor, null);
  targetEditor.update((tx) => {
    tx.selection.set(rootedRange(target.point, target.root));
  });

  if (targetEditor !== editor) {
    focusEditor?.(targetEditor);
    scheduleSlateReactFocus(() => {
      focusEditor?.(targetEditor);
    });
  }

  return {
    handled: true,
    target,
  };
};
