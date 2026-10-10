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
import { readAuthoredViewFragmentVersion } from '../../core/authored-runtime';
import { getCharacterDistance, getWordDistance } from '../../utils/string';
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
import type { PliteViewBoundaryGraphNode } from '../view-boundary-graph-core';
import {
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
  createContentRootViewBoundaryGraph,
  findContentRootOwners,
  getContentRootViewBoundaryPoint,
  readContentRootViewNode,
  getOwnerForCurrentViewEditor,
  getOwnerForRoot,
  getRegisteredRootViewEditor,
  hasContentRootOwner,
  isKnownContentRootOwner,
  isSameContentRootOwner,
} from './content-root-owners';
import {
  clamp,
  getPathElement,
  isPointOnVisualBoundaryLine,
  resolveViewBoundaryVisualMovement,
  resolveVerticalNavigationPoint,
} from './content-root-vertical-geometry';
import { getMountedEditableDOMRuntime } from './editable-dom-runtime';
import {
  after as editorAfter,
  failInvariant,
  before as editorBefore,
  dispatchCommand,
  editorCommands,
  getEditorRuntimeOwner,
  toInternalRoot,
} from './runtime-editor-api';
import { writeRuntimeSelection } from './runtime-mutation-state';
import { readRuntimeSelection } from './runtime-selection-state';

export {
  type ContentRootOwner,
  createContentRootViewBoundaryGraph,
  findContentRootOwners,
} from './content-root-owners';

export const readContentRootAwareSelection = ({
  editor,
  getActiveContentRootOwner,
}: {
  editor: ReactRuntimeEditor;
  getActiveContentRootOwner?: (root: RootKey) => ContentRootOwner | null;
}) => {
  const selection = readRuntimeSelection(editor);

  if (selection) return selection;

  const ownerSelection = readRuntimeSelection(getEditorRuntimeOwner(editor));
  const root = SelectionApi.root(ownerSelection);

  return root && getActiveContentRootOwner?.(root) ? ownerSelection : selection;
};

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
  const rooted = rootPlitePoint(point, root);

  return {
    anchor: rooted,
    focus: rooted,
  };
};

const selectContentRoot = (
  editor: ReactRuntimeEditor,
  target: NonNullable<Parameters<typeof writeRuntimeSelection>[1]>
) => {
  if (editor.read.view.isReadOnly()) {
    writeRuntimeSelection(editor, target);
  } else {
    dispatchCommand(editor, editorCommands.select, { target });
  }
};

const toViewBoundaryPoint = ({
  owner,
  point,
  root,
}: {
  owner: ContentRootOwner | null | undefined;
  point: Point;
  root: RootKey;
}): PliteViewBoundaryPoint => ({
  ...(owner ? { owner } : {}),
  point: rootPlitePoint(point, root),
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
    ({ document } = domApi.getWindow());
  } catch {
    return;
  }

  const domSelection = document.getSelection();

  if (!domSelection) {
    return;
  }

  const clear = () => {
    const current = readPliteViewSelection(editor);
    if (!current || isPliteViewSelectionCollapsed(current)) return;
    domSelection.removeAllRanges();
  };

  clear();
  const domPhaseScheduler =
    getMountedEditableDOMRuntime(editor)?.domPhaseScheduler;

  if (!domPhaseScheduler) return;

  domPhaseScheduler.schedule(
    'selection-repair',
    'clear-projected-selection-microtask',
    clear,
    { timing: 'microtask' }
  );
  domPhaseScheduler.schedule(
    'selection-repair',
    'clear-projected-selection-frame',
    clear,
    { timing: 'animation-frame' }
  );
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

const getViewBoundaryPointEditor = ({
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
  preferredX,
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
  preferredX?: number;
}): ContentRootNavigationTarget | null => {
  const activeOwner = getActiveContentRootOwner?.(currentRoot);
  const ownerForCurrentRoot = isKnownContentRootOwner(owners, activeOwner)
    ? activeOwner
    : owners.find((owner) => owner.childRoot === currentRoot);

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
        readRootChildren(state, currentRoot),
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
            preferredX,
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
      owner,
    });
    const targetPoint =
      fallbackTarget && sourceEditor && targetEditor
        ? resolveVerticalNavigationPoint({
            currentRoot,
            direction,
            fallbackPoint: fallbackTarget.point,
            point,
            preferredX,
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
      getPliteRootBoundaryPoint(
        readRootChildren(state, currentRoot),
        direction === 'forward' ? 'end' : 'start'
      )
    );
    const exitPoint =
      rootEdge && samePliteRootPoint(point, rootEdge, currentRoot)
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

    if (entryPoint && samePliteRootPoint(point, entryPoint, currentRoot)) {
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
  currentOwner?: ContentRootOwner | null;
  currentRoot: RootKey;
  editor: ContentRootNavigationEditor;
  getContentRootOwnerViewEditor?: (
    owner: ContentRootOwner
  ) => ReactRuntimeEditor | null;
  getMountedViewEditor?: (root: RootKey) => ReactRuntimeEditor | null;
  owners: ContentRootOwner[];
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
  currentOwner?: ContentRootOwner | null;
  currentRoot: RootKey;
  getActiveContentRootOwner?: (root: RootKey) => ContentRootOwner | null;
  owners: readonly ContentRootOwner[];
  selection: Range;
}): PliteViewBoundaryPoint => {
  const point = selection.anchor;
  const root = getPlitePointRoot(point, currentRoot);
  const owner =
    isKnownContentRootOwner(owners, currentOwner) &&
    currentOwner.childRoot === root
      ? currentOwner
      : getOwnerForRoot({
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
    owner: ContentRootOwner
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
  preferredX,
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
  preferredX?: number;
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
          preferredX,
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
  preferredX,
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
  preferredX?: number;
  selection: Range | null;
}): ContentRootNavigationTarget | null => {
  const action = getContentRootNavigationAction({ event, isRTL });

  if (!action || !hasContentRootOwner(editor)) {
    return null;
  }

  if (!selection || !RangeApi.isCollapsed(selection)) {
    return null;
  }

  const point = selection.anchor;
  const currentRoot =
    point.root ?? toInternalRoot(editor.read((state) => state.view.root()));
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
        (start && samePliteRootPoint(point, start, currentRoot)) ||
        (end && samePliteRootPoint(point, end, currentRoot))
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
    preferredX,
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
    !hasContentRootOwner(editor)
  ) {
    return false;
  }

  const owners = findContentRootOwners(editor);
  const currentRoot =
    selection.focus.root ??
    toInternalRoot(editor.read((state) => state.view.root()));
  const graph = createContentRootViewBoundaryGraph(editor, owners);
  const anchor = getInitialProjectedSelectionAnchor({
    currentOwner: null,
    currentRoot,
    getActiveContentRootOwner,
    owners,
    selection,
  });
  const focusRoot = selection.focus.root ?? currentRoot;
  const projectedSelection = createPliteViewSelection(graph, {
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

  return projectedSelection.segments.parts.some(
    (segment) => segment.owner || segment.root !== currentRoot
  );
};

const moveMarkupSelection = ({
  action,
  editor,
  extend,
  graph,
  owners,
  preferredX,
  selection,
  viewSelection,
}: {
  action: ContentRootViewSelectionAction;
  editor: ReactRuntimeEditor;
  extend: boolean;
  graph: PliteViewBoundaryGraphModel;
  owners: readonly ContentRootOwner[];
  preferredX?: number;
  selection: Range | null;
  viewSelection: PliteViewSelection | null;
}): boolean => {
  const root = toInternalRoot(editor.read((state) => state.view.root()));
  const initial =
    viewSelection ??
    (selection
      ? createPliteViewSelection(graph, {
          anchor: {
            point: rootPlitePoint(selection.anchor, root),
            affinity:
              !RangeApi.isCollapsed(selection) &&
              !RangeApi.isBackward(selection)
                ? 'forward'
                : 'backward',
          },
          focus: {
            point: rootPlitePoint(selection.focus, root),
            affinity:
              !RangeApi.isCollapsed(selection) && RangeApi.isBackward(selection)
                ? 'forward'
                : 'backward',
          },
        })
      : null);
  if (!initial) return false;
  const forward = action.direction === 'forward';
  let target = initial.focus;
  if (
    !extend &&
    !isPliteViewSelectionCollapsed(initial) &&
    action.kind === 'move' &&
    (action.axis === 'horizontal' || action.axis === 'word')
  ) {
    target =
      forward !== initial.segments.backward ? initial.focus : initial.anchor;
  } else {
    const initialNode = PliteViewBoundaryGraph.resolvePointNode(graph, target);
    if (!initialNode) return false;
    const atNode = (
      current: PliteViewBoundaryGraphNode,
      offset: number
    ): PliteViewBoundaryPoint => ({
      ...(current.fragment ? { fragmentId: current.fragment.id } : {}),
      ...(current.owner ? { owner: current.owner } : {}),
      affinity: forward ? 'backward' : 'forward',
      point: rootPlitePoint({ path: current.path, offset }, current.root),
    });
    if (action.kind === 'document-boundary') {
      const edge = forward ? graph.nodes.at(-1) : graph.nodes[0];
      const boundary =
        edge &&
        getContentRootViewBoundaryPoint(
          editor,
          edge,
          forward ? 'end' : 'start'
        );
      if (!boundary) return false;
      target = boundary;
    } else if (action.axis === 'line' || action.axis === 'vertical') {
      const next = resolveViewBoundaryVisualMovement({
        axis: action.axis,
        direction: action.direction,
        editor,
        graph,
        owners,
        point: target,
        preferredX,
      });
      if (!next) return false;
      target = next;
    } else if (!initialNode.text) {
      const adjacent = forward
        ? PliteViewBoundaryGraph.nextNode(graph, initialNode)
        : PliteViewBoundaryGraph.previousNode(graph, initialNode);
      const boundary = getContentRootViewBoundaryPoint(
        editor,
        adjacent ?? initialNode,
        adjacent ? (forward ? 'start' : 'end') : forward ? 'end' : 'start'
      );
      if (!boundary) return false;
      target = boundary;
    } else {
      const entry = graph.textRunsByNode.get(initialNode.key);
      if (!entry || !initialNode.text) return false;
      const { run } = entry;
      const offset =
        entry.offset + target.point.offset - initialNode.text.start;
      const atBoundary = forward ? offset === run.value.length : offset === 0;
      if (atBoundary) {
        const edge = forward ? run.nodes.at(-1) : run.nodes[0];
        if (!edge?.text) return false;
        const adjacent = forward
          ? PliteViewBoundaryGraph.nextNode(graph, edge)
          : PliteViewBoundaryGraph.previousNode(graph, edge);
        const content =
          adjacent &&
          !adjacent.text &&
          readContentRootViewNode(editor, adjacent);
        const next =
          content &&
          NodeApi.isElement(content) &&
          editor.read.schema.isInline(content)
            ? forward
              ? PliteViewBoundaryGraph.nextNode(graph, adjacent)
              : PliteViewBoundaryGraph.previousNode(graph, adjacent)
            : (adjacent ?? edge);
        if (!next) return false;
        const boundary = next.text
          ? atNode(
              next,
              adjacent
                ? forward
                  ? next.text.start
                  : next.text.end
                : forward
                  ? next.text.end
                  : next.text.start
            )
          : getContentRootViewBoundaryPoint(
              editor,
              next,
              forward ? 'end' : 'start'
            );
        if (!boundary) return false;
        target = boundary;
      } else {
        const text = forward
          ? run.value.slice(offset)
          : run.value.slice(0, offset);
        const distance =
          action.axis === 'word'
            ? getWordDistance(text, !forward)
            : getCharacterDistance(text, !forward);
        const next = Math.max(
          0,
          Math.min(run.value.length, offset + (forward ? distance : -distance))
        );
        const ordered = forward ? run.nodes : [...run.nodes].reverse();
        for (const node of ordered) {
          const location = graph.textRunsByNode.get(node.key);
          if (!location || !node.text) continue;
          const localOffset = next - location.offset;
          if (
            localOffset >= 0 &&
            localOffset <= node.text.end - node.text.start
          ) {
            target = atNode(node, node.text.start + localOffset);
            break;
          }
        }
      }
    }
  }
  if (target.fragmentId) {
    const node = PliteViewBoundaryGraph.resolvePointNode(graph, target);
    const adjacent =
      node?.text &&
      (forward
        ? target.point.offset === node.text.end
        : target.point.offset === node.text.start)
        ? forward
          ? PliteViewBoundaryGraph.nextNode(graph, node)
          : PliteViewBoundaryGraph.previousNode(graph, node)
        : null;
    if (
      node &&
      adjacent?.text &&
      !adjacent.fragment &&
      graph.textRunsByNode.get(node.key)?.run ===
        graph.textRunsByNode.get(adjacent.key)?.run
    ) {
      target = {
        ...(adjacent.owner ? { owner: adjacent.owner } : {}),
        affinity: forward ? 'forward' : 'backward',
        point: rootPlitePoint(
          {
            path: adjacent.path,
            offset: forward ? adjacent.text.start : adjacent.text.end,
          },
          adjacent.root
        ),
      };
    }
  }
  const projected = createPliteViewSelection(graph, {
    anchor: extend ? initial.anchor : target,
    focus: target,
  });
  const targetNode = PliteViewBoundaryGraph.resolvePointNode(graph, target);
  const otherSide = PliteViewBoundaryGraph.resolvePointNode(graph, {
    ...target,
    affinity: target.affinity === 'backward' ? 'forward' : 'backward',
  });
  const docked = targetNode?.key !== otherSide?.key;
  const ordinary =
    projected.segments.parts.length === 1 &&
    projected.segments.parts.every(
      (part) => !part.fragment && !part.owner && part.root === root
    );
  if (extend && ordinary && !isPliteViewSelectionCollapsed(projected)) {
    writePliteViewSelection(editor, null);
    selectContentRoot(editor, {
      anchor: projected.anchor.point,
      focus: projected.focus.point,
    });
  } else if (!extend && !target.fragmentId) {
    writePliteViewSelection(editor, docked ? projected : null);
    selectContentRoot(
      editor,
      SelectionApi.text(
        { anchor: target.point, focus: target.point },
        docked ? { affinity: target.affinity } : undefined
      )
    );
  } else {
    writePliteViewSelection(editor, projected);
    collapseModelSelectionForProjectedSelection(editor, selection);
    collapseNativeSelectionForProjectedSelection(editor, selection);
  }
  return true;
};

const applyContentRootViewSelectionAction = ({
  editor,
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
  action: ContentRootViewSelectionAction | null;
  extend?: boolean;
  getActiveContentRootOwner?: (root: RootKey) => ContentRootOwner | null;
  getContentRootOwnerViewEditor?: (
    owner: ContentRootOwner
  ) => ReactRuntimeEditor | null;
  getMountedViewEditor?: (root: RootKey) => ReactRuntimeEditor | null;
  preventDefault?: () => void;
  preferredX?: number;
  selection: Range | null;
}): ContentRootNavigationResult => {
  if (!action) {
    return { handled: false };
  }

  const owners = findContentRootOwners(editor);
  const viewSelection = readPliteViewSelection(editor);
  if (readAuthoredViewFragmentVersion(editor)) {
    const graph = createContentRootViewBoundaryGraph(editor, owners);
    if (
      moveMarkupSelection({
        action,
        editor,
        extend,
        graph,
        owners,
        preferredX,
        selection,
        viewSelection,
      })
    ) {
      preventDefault?.();
      return { handled: true };
    }
  }
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

  const getCurrentRootOwner = (root: RootKey) =>
    root === currentRoot && isKnownContentRootOwner(owners, currentOwner)
      ? currentOwner
      : (getActiveContentRootOwner?.(root) ?? null);

  const graph = createContentRootViewBoundaryGraph(editor, owners);
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
          preferredX,
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
      const projectedSelection = createPliteViewSelection(graph, {
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
      const hasProjectedPart = projectedSelection.segments.parts.some(
        (segment) => segment.owner || segment.root !== currentRoot
      );

      if (hasProjectedPart) {
        writePliteViewSelection(editor, projectedSelection);
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
      selection: selection ?? failInvariant('Expected value to be defined'),
    });
  let projectedSelection = createPliteViewSelection(graph, {
    anchor,
    focus: toViewBoundaryPoint({
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
      target,
    });
    projectedSelection = createPliteViewSelection(graph, {
      anchor,
      focus: toViewBoundaryPoint({
        owner: target.owner,
        point: target.point,
        root: target.root,
      }),
    });
  }

  writePliteViewSelection(editor, projectedSelection);
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
  editor: ReactRuntimeEditor<any>;
  getActiveContentRootOwner?: (root: RootKey) => ContentRootOwner | null;
  getContentRootOwnerViewEditor?: (
    owner: ContentRootOwner
  ) => ReactRuntimeEditor | null;
  getMountedViewEditor?: (root: RootKey) => ReactRuntimeEditor | null;
  isRTL?: boolean;
  selection: Range | null;
}): ContentRootNavigationResult =>
  applyContentRootViewSelectionAction({
    action: getProjectedSelectionActionFromMoveCommand({
      command: { ...command, extend: true },
      isRTL,
    }),
    extend: Boolean(command.extend),
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
  preferredX,
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
  preferredX?: number;
  selection: Range | null;
}): ContentRootNavigationResult => {
  const plugin = getProjectedSelectionAction({ event, isRTL });
  const navigation =
    !plugin &&
    (event.key.startsWith('Arrow') ||
      event.key === 'Home' ||
      event.key === 'End')
      ? getContentRootNavigationAction({ event, isRTL })
      : null;
  return applyContentRootViewSelectionAction({
    action: plugin ?? (navigation?.kind === 'enter' ? null : navigation),
    extend: Boolean(plugin),
    editor,
    getActiveContentRootOwner,
    getContentRootOwnerViewEditor,
    getMountedViewEditor,
    preferredX,
    preventDefault: () => {
      event.preventDefault();
    },
    selection,
  });
};

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
  getActiveContentRootOwner?: (root: RootKey) => ContentRootOwner | null;
  getContentRootOwnerViewEditor?: (
    owner: ContentRootOwner
  ) => ReactRuntimeEditor | null;
  getMountedViewEditor?: (root: RootKey) => ReactRuntimeEditor | null;
  isRTL: boolean;
  preferredX?: number;
  selection: Range | null;
}): ContentRootNavigationResult => {
  const target = getContentRootNavigationTarget({
    editor,
    event,
    getActiveContentRootOwner,
    getContentRootOwnerViewEditor,
    getMountedViewEditor,
    isRTL,
    preferredX,
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
  writePliteViewSelection(editor, null);
  selectContentRoot(targetEditor, rootedRange(target.point, target.root));

  if (targetEditor !== editor) {
    focusEditor?.(targetEditor);
    const domPhaseScheduler =
      getMountedEditableDOMRuntime(targetEditor)?.domPhaseScheduler ??
      getMountedEditableDOMRuntime(editor)?.domPhaseScheduler;
    const { version } = editor.read.runtime.snapshot();
    const viewSelection = readPliteViewSelection(editor);

    domPhaseScheduler?.schedule(
      'dom-write',
      'focus-content-root-editor',
      () => {
        // A settled native event must not reclaim focus from a later selection.
        if (
          editor.read.runtime.snapshot().version === version &&
          readPliteViewSelection(editor) === viewSelection
        ) {
          focusEditor?.(targetEditor);
        }
      },
      { timing: 'animation-frame' }
    );
  }

  return {
    handled: true,
    target,
  };
};
