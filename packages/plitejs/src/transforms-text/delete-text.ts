import { createAnchor } from '../core/anchor';
import { jsonEqual } from '../core/change/json';
import { getEditorSchema } from '../core/editor-runtime';
import { joinKeepsPrefixOccupant } from '../core/prefix-occupant-join';
import {
  getActiveUpdateRoot,
  getChildList,
  getCurrentSelection,
  getEditorUpdateRoot,
  profileCoreDuration,
  runEditorTransaction,
  withEditorUpdateRoot,
  withEditorUpdateRootChildren,
} from '../core/public-state';
import { isWritablePoint } from '../core/writable-text';
import {
  type Element as EditorElement,
  type Location,
  LocationApi,
  NodeApi,
  type Path,
  PathApi,
  type Point,
  PointApi,
  type Range,
  RangeApi,
  SelectionApi,
  TextApi,
} from '../interfaces';
import type { AnyEditor as Editor } from '../interfaces/editor';
import {
  above as editorAbove,
  after as editorAfter,
  before as editorBefore,
  getChildren as editorGetChildren,
  hasPath as editorHasPath,
  isBlock as editorIsBlock,
  leaf as editorLeaf,
  parent as editorParent,
  point as editorPoint,
  positions as editorPositions,
  previous as editorPrevious,
  unhangRange as editorUnhangRange,
} from '../interfaces/editor';
import type { TextMutationMethods } from '../interfaces/transforms/text';
import { getDefined } from '../internal/get-defined';
import {
  getConsistentRangeTextMarks,
  withoutUnheldDefaultsBeside,
} from '../internal/range-text-marks';
import { getLocationRoot, stripLocationRoots } from '../internal/root-location';
import { mergeNodes, removeNodes } from '../transforms-node';
import {
  getEmptyEditableInlinePathAtPoint,
  getPreviousEmptyBlockPathAtBlockStart,
} from './delete-text-collapsed-path-targets';
import {
  type GridRemovalPlan,
  planGridRemoval,
  planGridSteps,
  readGridCell,
  removeGridSteps,
  shareGridCellOrNone,
} from './delete-text-grid';
import {
  moveExpandedInlineEdgeDeletePointOutsideInline,
  moveLeadingSpacerPointIntoFollowingInline,
  movePointToFollowingInline,
  moveTrailingTextPointIntoFollowingInline,
} from './delete-text-inline-points';
import {
  type DeleteOptions,
  type DeletePathTarget,
  type DeleteRangePlan,
  getCurrentNode,
  getHighestNonEditable,
  getLivePoint,
  getTransactionRoot,
  isTextNode,
  matchPointRootVisibility,
  pathContainsPoint,
  shouldKeepSplitTextAfterInteriorElementRemoval,
  shouldPreserveEmptyStartBlockForHangingRange,
  type TransactionWriter,
} from './delete-text-plan';
import { deletePathTarget, removeDeleteContents } from './delete-text-removal';
import {
  getTopLevelCleanupRange,
  getTouchedTopLevelRange,
  maybeMergeAdjacentTextAt,
  mergeAdjacentTextRuns,
  removeEmptyEndChain,
  removeEmptyStructuralArtifacts,
  restorePreservedEmptyStartBlock,
} from './delete-text-structural-cleanup';
import {
  deleteWholeTopLevelBlockRange,
  getWholeTopLevelBlockRange,
  type WholeTopLevelBlockRange,
} from './delete-text-whole-blocks';

const isInlineVoid = (editor: Editor, node: unknown) => {
  const schema = getEditorSchema(editor);

  return (
    NodeApi.isElement(node) && schema.isInline(node) && schema.isVoid(node)
  );
};

const canMergeBlocksAtPoint = (
  editor: Editor,
  point: Point,
  voids: boolean
) => {
  const matchBlock = (node: import('../interfaces').Node) =>
    NodeApi.isElement(node) && editorIsBlock(editor, node);
  const current = editorAbove(editor, {
    at: point,
    match: matchBlock,
    mode: 'lowest',
    voids,
  });
  const previous = editorPrevious(editor, {
    at: point,
    match: matchBlock,
    mode: 'lowest',
    voids,
  });

  if (!current || !previous) return false;

  const [currentNode, currentPath] = current;
  const [previousNode, previousPath] = previous;

  if (!NodeApi.isElement(currentNode) || !NodeApi.isElement(previousNode)) {
    return false;
  }

  const schema = getEditorSchema(editor);

  if (!PathApi.isSibling(currentPath, previousPath)) {
    const [destinationParent] = editorParent(editor, previousPath);
    const acceptsCurrent = NodeApi.isElement(destinationParent)
      ? schema.canContain(destinationParent, currentNode)
      : schema.canContainAtRoot(
          currentNode,
          getActiveUpdateRoot(editor) ?? 'main'
        );

    if (!acceptsCurrent) return false;
  }

  return currentNode.children.every((child) =>
    schema.canContain(previousNode, child)
  );
};

const shouldRemoveEmptyForwardStartBlock = (
  editor: Editor,
  plan: DeleteRangePlan
) => {
  if (
    plan.reverse ||
    !plan.isCollapsed ||
    !plan.isAcrossBlocks ||
    !plan.effectiveStartBlockPath ||
    !plan.effectiveEndBlockPath ||
    plan.effectiveStartBlockPath.length !== 1 ||
    !editorHasPath(editor, plan.effectiveStartBlockPath)
  ) {
    return false;
  }

  const startBlock = getCurrentNode(editor, plan.effectiveStartBlockPath);
  const joinedPath = PathApi.next(plan.effectiveStartBlockPath);

  return (
    NodeApi.isElement(startBlock) &&
    editorIsBlock(editor, startBlock) &&
    NodeApi.string(startBlock) === '' &&
    PointApi.equals(
      plan.start,
      editorPoint(editor, plan.effectiveStartBlockPath, { edge: 'end' })
    ) &&
    !joinKeepsPrefixOccupant(
      editor,
      [startBlock, plan.effectiveStartBlockPath],
      [getCurrentNode(editor, joinedPath), joinedPath]
    )
  );
};

const shouldClearDeletedMarksAtMarkedSuffix = (
  editor: Editor,
  deletedMarks: Record<string, unknown>
) => {
  const selection = getCurrentSelection(editor);

  if (
    !selection ||
    !RangeApi.isRange(selection) ||
    !RangeApi.isCollapsed(selection)
  ) {
    return false;
  }

  const { anchor } = selection;

  if (anchor.offset !== 0 || !NodeApi.has(editor, anchor.path)) {
    return false;
  }

  const node = NodeApi.get(editor, anchor.path);
  const keys = new Set([...Object.keys(node), ...Object.keys(deletedMarks)]);

  keys.delete('text');

  return (
    TextApi.isText(node) &&
    node.text.length > 0 &&
    [...keys].every((key) => jsonEqual(node[key], deletedMarks[key]))
  );
};

const getClosestIsolatingAncestor = (
  editor: Editor,
  at: Point,
  voids: boolean
) =>
  editorAbove(editor, {
    at,
    match: (node) =>
      NodeApi.isElement(node) && getEditorSchema(editor).isIsolating(node),
    mode: 'lowest',
    voids,
  });

const crossesIsolatingBoundary = (
  editor: Editor,
  from: Point,
  to: Point,
  voids: boolean
) => {
  const fromIsolating = getClosestIsolatingAncestor(editor, from, voids);
  const toIsolating = getClosestIsolatingAncestor(editor, to, voids);

  return (
    (fromIsolating && !pathContainsPoint(fromIsolating[1], to)) ||
    (toIsolating && !pathContainsPoint(toIsolating[1], from))
  );
};

const resolveMergePoint = (
  editor: Editor,
  plan: DeleteRangePlan,
  startPoint: Point | null | undefined,
  endPoint: Point | null | undefined
) => {
  const liveEndPoint = getLivePoint(editor, endPoint);

  if (liveEndPoint) {
    return liveEndPoint;
  }

  const liveStartPoint = getLivePoint(editor, startPoint);

  if (!liveStartPoint) {
    return null;
  }

  return (
    editorAfter(editor, liveStartPoint, {
      distance: 1,
      unit: 'offset',
      voids: plan.voids,
    }) ?? null
  );
};

const resolveDeleteTarget = (
  editor: Editor,
  options: DeleteOptions = {},
  resolvedAt?: Location | import('../interfaces').NodeSelection | null
): DeletePathTarget | DeleteRangePlan | null => {
  const {
    reverse = false,
    unit = 'character',
    distance = 1,
    preserveInlineEdge = false,
    voids = false,
  } = options;
  let { at = resolvedAt ?? getCurrentSelection(editor), hanging = false } =
    options;

  if (!at) {
    return null;
  }
  if (SelectionApi.isNode(at)) return null;
  const initialAt = at;

  let isCollapsed = false;

  if (LocationApi.isRange(at) && RangeApi.isCollapsed(at)) {
    isCollapsed = true;
    at = at.anchor;
  }

  if (LocationApi.isPoint(at)) {
    isCollapsed = true;
    const nonEditable = voids ? undefined : getHighestNonEditable(editor, at);

    if (nonEditable) {
      at = nonEditable[1];
    } else {
      const emptyInlinePath =
        reverse && unit === 'character' && distance === 1
          ? getEmptyEditableInlinePathAtPoint(editor, at)
          : null;

      if (emptyInlinePath) {
        return {
          kind: 'path',
          path: emptyInlinePath,
          fallbackPoint:
            editorBefore(editor, emptyInlinePath, { voids: true }) ??
            editorAfter(editor, emptyInlinePath, { voids: true }),
          initialAt,
        };
      }

      const previousEmptyBlockPath =
        reverse && unit === 'character' && distance === 1
          ? getPreviousEmptyBlockPathAtBlockStart(editor, at, voids)
          : null;

      if (previousEmptyBlockPath) {
        return {
          kind: 'path',
          path: previousEmptyBlockPath,
          fallbackPoint: at,
          initialAt,
        };
      }

      const target = getCollapsedDeleteTarget(editor, at, {
        reverse,
        distance,
        unit,
        voids,
      });
      const targetNonEditable = voids
        ? undefined
        : getHighestNonEditable(editor, target);

      if (targetNonEditable && !pathContainsPoint(targetNonEditable[1], at)) {
        return {
          kind: 'path',
          path: targetNonEditable[1],
          fallbackPoint: at,
          initialAt,
        };
      }

      at = { anchor: at, focus: target };
      hanging = true;
    }
  }

  if (LocationApi.isPath(at)) {
    const selection = getCurrentSelection(editor);
    const selectionInside =
      selection &&
      RangeApi.isRange(selection) &&
      (pathContainsPoint(at, selection.anchor) ||
        pathContainsPoint(at, selection.focus));
    const fallbackPoint = selectionInside
      ? (editorBefore(editor, at, { voids: true }) ??
        editorAfter(editor, at, { voids: true }))
      : undefined;

    return {
      kind: 'path',
      path: at,
      fallbackPoint,
      initialAt,
    };
  }

  if (!RangeApi.isRange(at) || RangeApi.isCollapsed(at)) {
    return null;
  }

  if (!hanging) {
    const [, end] = RangeApi.edges(at);
    const endOfDocument = editorPoint(editor, [], { edge: 'end' });
    const endHolder = voids ? undefined : getHighestNonEditable(editor, end);
    const endsInsideInlineVoid =
      !!endHolder && isInlineVoid(editor, endHolder[0]);

    if (!PointApi.equals(end, endOfDocument) && !endsInsideInlineVoid) {
      at = editorUnhangRange(editor, at, { voids });
    }
  }

  let [start, end] = RangeApi.edges(at);
  const highestBlockInCell = (point: Point) => {
    const cell = readGridCell(editor, point.path);

    return editorAbove(editor, {
      at: point,
      match: (node, path) =>
        NodeApi.isElement(node) &&
        editorIsBlock(editor, node) &&
        (!cell || PathApi.isAncestor(cell, path)),
      mode: 'highest',
      voids,
    });
  };
  const lowestBlock = (point: Point) =>
    editorAbove(editor, {
      at: point,
      match: (node) => NodeApi.isElement(node) && editorIsBlock(editor, node),
      mode: 'lowest',
      voids,
    });
  const startBlock = highestBlockInCell(start);
  const endBlock = highestBlockInCell(end);
  const startMergeBlock = lowestBlock(start);
  const endMergeBlock = lowestBlock(end);
  const prefersLowestMergeBlocks =
    startMergeBlock &&
    endMergeBlock &&
    startMergeBlock[1].length === endMergeBlock[1].length &&
    !PathApi.equals(startMergeBlock[1], endMergeBlock[1]);
  const effectiveStartBlock = prefersLowestMergeBlocks
    ? startMergeBlock
    : startBlock;
  const effectiveEndBlock = prefersLowestMergeBlocks ? endMergeBlock : endBlock;
  const isAcrossBlocks =
    !!effectiveStartBlock &&
    !!effectiveEndBlock &&
    !PathApi.equals(effectiveStartBlock[1], effectiveEndBlock[1]);
  const isSingleText = PathApi.equals(start.path, end.path);
  const startNonEditable = voids
    ? undefined
    : getHighestNonEditable(editor, start);
  const endNonEditable = voids ? undefined : getHighestNonEditable(editor, end);
  let editableEdges = true;

  if (startNonEditable) {
    const before = editorBefore(editor, start);

    if (
      before &&
      startBlock &&
      PathApi.isAncestor(startBlock[1], before.path) &&
      shareGridCellOrNone(editor, start.path, before.path)
    ) {
      start = before;
      editableEdges &&= isInlineVoid(editor, startNonEditable[0]);
    } else {
      editableEdges = false;
    }
  }

  if (endNonEditable) {
    const after = editorAfter(editor, end);

    if (
      after &&
      endBlock &&
      PathApi.isAncestor(endBlock[1], after.path) &&
      shareGridCellOrNone(editor, end.path, after.path)
    ) {
      end = after;
      editableEdges &&= isInlineVoid(editor, endNonEditable[0]);
    } else {
      editableEdges = false;
    }
  }

  const preserveEndBlock =
    !hanging &&
    !isCollapsed &&
    !!effectiveEndBlock &&
    PointApi.equals(
      end,
      editorPoint(editor, effectiveEndBlock[1], { edge: 'start' })
    );
  const originalHangingBlockRange =
    !!initialAt &&
    LocationApi.isRange(initialAt) &&
    !RangeApi.isCollapsed(initialAt) &&
    (() => {
      const [, originalEnd] = RangeApi.edges(initialAt);
      const originalEndBlock = highestBlockInCell(originalEnd);

      return (
        !!originalEndBlock &&
        !!effectiveStartBlock &&
        !PathApi.equals(effectiveStartBlock[1], originalEndBlock[1]) &&
        PointApi.equals(
          originalEnd,
          editorPoint(editor, originalEndBlock[1], { edge: 'start' })
        )
      );
    })();
  const preserveEmptyStartBlockPath =
    shouldPreserveEmptyStartBlockForHangingRange(
      editor,
      start,
      isSingleText,
      isAcrossBlocks,
      preserveEndBlock,
      originalHangingBlockRange,
      effectiveStartBlock
    );
  const preservedEmptyStartBlock =
    preserveEmptyStartBlockPath &&
    effectiveStartBlock &&
    NodeApi.isElement(effectiveStartBlock[0])
      ? ({
          ...effectiveStartBlock[0],
          children: [{ text: '' }],
        } as EditorElement)
      : null;

  return {
    kind: 'range',
    initialAt,
    reverse,
    unit,
    distance,
    voids,
    isCollapsed,
    start,
    end,
    effectiveRange: { anchor: start, focus: end },
    editableEdges,
    isSingleText,
    isAcrossBlocks,
    startNonEditable,
    endNonEditable,
    preserveEndBlock,
    preserveInlineEdge,
    preserveEmptyStartBlockPath,
    preservedEmptyStartBlock,
    startJoinBlockPath:
      !isCollapsed && isAcrossBlocks ? (lowestBlock(start)?.[1] ?? null) : null,
    topLevelCountBefore: getChildList(editor).length,
    effectiveStartBlockPath: effectiveStartBlock?.[1] ?? null,
    effectiveEndBlockPath: effectiveEndBlock?.[1] ?? null,
    removedInteriorElementSiblingStructure:
      shouldKeepSplitTextAfterInteriorElementRemoval(
        editor,
        start,
        end,
        isAcrossBlocks
      ),
  };
};

const reconcileDeleteStructure = (
  editor: Editor,
  plan: DeleteRangePlan,
  removal: ReturnType<typeof removeDeleteContents>
) => {
  const cleanupRange = () => getTopLevelCleanupRange(editor, plan);
  const touchedRange = getTouchedTopLevelRange(plan);
  let keptIncompatibleBlockBoundary = false;

  if (!plan.isSingleText && plan.isAcrossBlocks) {
    const candidateMergePoint = plan.editableEdges
      ? resolveMergePoint(
          editor,
          plan,
          removal.startAnchor.resolve(),
          removal.endAnchor.resolve()
        )
      : null;
    const mergePoint =
      candidateMergePoint &&
      canMergeBlocksAtPoint(editor, candidateMergePoint, plan.voids)
        ? candidateMergePoint
        : null;

    keptIncompatibleBlockBoundary =
      candidateMergePoint != null && mergePoint == null;

    if (plan.preserveEmptyStartBlockPath) {
      removeEmptyStructuralArtifacts(
        editor,
        plan.preserveEmptyStartBlockPath,
        null,
        cleanupRange()
      );
      mergeAdjacentTextRuns(editor, touchedRange);
    } else if (plan.preserveEndBlock && mergePoint) {
      mergeBlocksAtPoint(editor, mergePoint, plan.voids);
      removeEmptyStructuralArtifacts(
        editor,
        plan.preserveEmptyStartBlockPath,
        null,
        cleanupRange()
      );
      mergeAdjacentTextRuns(editor, touchedRange);
    } else if (plan.voids && mergePoint && plan.effectiveEndBlockPath) {
      mergeNodes(editor, {
        at: plan.effectiveEndBlockPath,
      });
      removeEmptyStructuralArtifacts(
        editor,
        plan.preserveEmptyStartBlockPath,
        null,
        cleanupRange()
      );
      mergeAdjacentTextRuns(editor, touchedRange);
    } else if (shouldRemoveEmptyForwardStartBlock(editor, plan)) {
      removeNodes(editor, {
        at: getDefined(plan.effectiveStartBlockPath),
        voids: plan.voids,
      });
      removeEmptyStructuralArtifacts(
        editor,
        plan.preserveEmptyStartBlockPath,
        null,
        cleanupRange()
      );
      mergeAdjacentTextRuns(editor, touchedRange);
    } else if (mergePoint) {
      mergeBlocksAtPoint(editor, mergePoint, plan.voids);
      removeEmptyStructuralArtifacts(
        editor,
        plan.preserveEmptyStartBlockPath,
        null,
        cleanupRange()
      );
      mergeAdjacentTextRuns(editor, touchedRange);
    } else {
      removeEmptyStructuralArtifacts(
        editor,
        plan.preserveEmptyStartBlockPath,
        null,
        cleanupRange()
      );

      if (!plan.startNonEditable && !plan.endNonEditable) {
        mergeAdjacentTextRuns(editor, touchedRange);
      }
    }
  } else if (!plan.isSingleText) {
    removeEmptyEndChain(editor, removal.endChain);

    if (!plan.removedInteriorElementSiblingStructure) {
      mergeAdjacentTextRuns(editor, touchedRange);
    }
  }

  restorePreservedEmptyStartBlock(
    editor,
    plan.preserveEmptyStartBlockPath,
    plan.preservedEmptyStartBlock
  );

  if (plan.initialAt == null) {
    maybeMergeAdjacentTextAt(editor, removal.endAnchor.resolve()?.path);
  }

  return keptIncompatibleBlockBoundary;
};

const resolveDeletePoint = (
  editor: Editor,
  plan: DeleteRangePlan,
  removal: ReturnType<typeof removeDeleteContents>,
  keptIncompatibleBlockBoundary: boolean
) => {
  const startPoint = removal.startAnchor.release();
  const endPoint = removal.endAnchor.release();
  const startBlockDropped = removal.startBlockAnchor?.release() === null;
  const reverseMergePoint =
    plan.reverse &&
    plan.isCollapsed &&
    plan.isAcrossBlocks &&
    startPoint &&
    endPoint &&
    !PathApi.equals(startPoint.path.slice(0, -1), endPoint.path.slice(0, -1))
      ? keptIncompatibleBlockBoundary
        ? startPoint
        : endPoint
      : (startPoint ?? endPoint);
  const collapseTarget = startBlockDropped
    ? (endPoint ?? startPoint)
    : !plan.isCollapsed && editorHasPath(editor, plan.start.path)
      ? { path: [...plan.start.path], offset: plan.start.offset }
      : reverseMergePoint;
  let point = normalizeFinalDeletePoint(editor, collapseTarget, {
    reverse: plan.reverse,
    allowForwardBoundaryJump:
      (plan.initialAt != null && LocationApi.isPoint(plan.initialAt)) ||
      (plan.initialAt != null &&
        LocationApi.isRange(plan.initialAt) &&
        RangeApi.isCollapsed(plan.initialAt)),
  });

  if (!plan.reverse && !plan.isCollapsed) {
    point = moveLeadingSpacerPointIntoFollowingInline(editor, point);
  }

  if (!plan.reverse && plan.isCollapsed) {
    point = moveTrailingTextPointIntoFollowingInline(editor, point);
  }

  if (!plan.reverse && !plan.isCollapsed && plan.isAcrossBlocks) {
    point = movePointToFollowingInline(editor, point);
  }

  point = moveExpandedInlineEdgeDeletePointOutsideInline(editor, plan, point);

  if (
    plan.reverse &&
    plan.unit === 'character' &&
    point &&
    point.path.length >= 2
  ) {
    const parentPath = point.path.slice(0, -1) as Path;

    if (editorHasPath(editor, parentPath)) {
      const parent = getCurrentNode(editor, parentPath);

      if (
        NodeApi.isElement(parent) &&
        getEditorSchema(editor).isInline(parent) &&
        PointApi.equals(
          point,
          editorPoint(editor, parentPath, { edge: 'start' })
        )
      ) {
        const previousSiblingPath =
          parentPath.at(-1) === 0 ? null : PathApi.previous(parentPath);

        if (previousSiblingPath && editorHasPath(editor, previousSiblingPath)) {
          const previousSibling = getCurrentNode(editor, previousSiblingPath);

          if (isTextNode(previousSibling) && previousSibling.text === '') {
            const nextSiblingPath =
              parentPath.at(-1) == null ? null : PathApi.next(parentPath);

            if (nextSiblingPath && editorHasPath(editor, nextSiblingPath)) {
              const nextSibling = getCurrentNode(editor, nextSiblingPath);

              if (isTextNode(nextSibling) && nextSibling.text === '') {
                point = { path: [...point.path], offset: point.offset };
              } else {
                point = { path: previousSiblingPath, offset: 0 };
              }
            } else {
              point = { path: previousSiblingPath, offset: 0 };
            }
          }
        }
      }
    }
  }

  return point;
};

const resolveDeleteSelection = (
  editor: Editor,
  plan: DeleteRangePlan,
  removal: ReturnType<typeof removeDeleteContents>,
  tx: TransactionWriter,
  keptIncompatibleBlockBoundary: boolean
) => {
  const point = resolveDeletePoint(
    editor,
    plan,
    removal,
    keptIncompatibleBlockBoundary
  );

  if ((!plan.initialAt || !LocationApi.isPath(plan.initialAt)) && point) {
    tx.setSelection(
      SelectionApi.text({
        anchor: point,
        focus: point,
      })
    );
  }

  const finalSelection = getCurrentSelection(editor);

  if (
    finalSelection &&
    RangeApi.isRange(finalSelection) &&
    RangeApi.isCollapsed(finalSelection)
  ) {
    let normalizedSelectionPoint = normalizeFinalDeletePoint(
      editor,
      finalSelection.anchor,
      {
        reverse: plan.reverse,
        allowForwardBoundaryJump:
          (plan.initialAt != null && LocationApi.isPoint(plan.initialAt)) ||
          (plan.initialAt != null &&
            LocationApi.isRange(plan.initialAt) &&
            RangeApi.isCollapsed(plan.initialAt)),
      }
    );

    if (!plan.reverse && !plan.isCollapsed) {
      normalizedSelectionPoint = moveLeadingSpacerPointIntoFollowingInline(
        editor,
        normalizedSelectionPoint
      );
    }

    if (!plan.reverse && plan.isCollapsed) {
      normalizedSelectionPoint = moveTrailingTextPointIntoFollowingInline(
        editor,
        normalizedSelectionPoint
      );
    }

    if (!plan.reverse && !plan.isCollapsed && plan.isAcrossBlocks) {
      normalizedSelectionPoint = movePointToFollowingInline(
        editor,
        normalizedSelectionPoint
      );
    }

    normalizedSelectionPoint = moveExpandedInlineEdgeDeletePointOutsideInline(
      editor,
      plan,
      normalizedSelectionPoint
    );

    if (
      normalizedSelectionPoint &&
      !PointApi.equals(normalizedSelectionPoint, finalSelection.anchor)
    ) {
      tx.setSelection(
        SelectionApi.text({
          anchor: normalizedSelectionPoint,
          focus: normalizedSelectionPoint,
        })
      );
    }
  }
};

const normalizeFinalDeletePoint = (
  editor: Editor,
  point: import('../interfaces').Point | null | undefined,
  options: { reverse: boolean; allowForwardBoundaryJump: boolean }
) => {
  if (!point) {
    return point;
  }

  if (!editorHasPath(editor, point.path)) {
    return editorGetChildren(editor).length > 0
      ? editorPoint(editor, [], { edge: 'start' })
      : point;
  }

  if (point.offset === 0 && point.path.length > 0) {
    const previousSiblingPath =
      point.path.at(-1) === 0 ? null : PathApi.previous(point.path);

    if (previousSiblingPath && editorHasPath(editor, previousSiblingPath)) {
      const previousSibling = getCurrentNode(editor, previousSiblingPath);

      if (
        NodeApi.isElement(previousSibling) &&
        getEditorSchema(editor).isInline(previousSibling) &&
        !getEditorSchema(editor).isVoid(previousSibling) &&
        NodeApi.string(previousSibling) === ''
      ) {
        return editorPoint(editor, previousSiblingPath, { edge: 'start' });
      }
    }

    const nextSiblingPath =
      point.path.at(-1) == null ? null : PathApi.next(point.path);

    if (nextSiblingPath && editorHasPath(editor, nextSiblingPath)) {
      const nextSibling = getCurrentNode(editor, nextSiblingPath);

      if (
        NodeApi.isElement(nextSibling) &&
        getEditorSchema(editor).isInline(nextSibling) &&
        !getEditorSchema(editor).isVoid(nextSibling) &&
        NodeApi.string(nextSibling) === ''
      ) {
        return editorPoint(editor, nextSiblingPath, { edge: 'start' });
      }
    }
  }

  if (!options.reverse) {
    if (
      !options.allowForwardBoundaryJump &&
      point.path.length >= 2 &&
      editorHasPath(editor, point.path) &&
      isTextNode(getCurrentNode(editor, point.path))
    ) {
      const currentTextNode = getCurrentNode(editor, point.path);
      const parentPath = point.path.slice(0, -1) as Path;

      if (editorHasPath(editor, parentPath)) {
        const parent = getCurrentNode(editor, parentPath);

        if (
          NodeApi.isElement(parent) &&
          getEditorSchema(editor).isInline(parent) &&
          isTextNode(currentTextNode) &&
          point.offset === currentTextNode.text.length
        ) {
          const spacerPath =
            parentPath.at(-1) == null ? null : PathApi.next(parentPath);

          if (spacerPath && editorHasPath(editor, spacerPath)) {
            const spacer = getCurrentNode(editor, spacerPath);

            if (isTextNode(spacer) && spacer.text === '') {
              const nextSiblingPath =
                spacerPath.at(-1) == null ? null : PathApi.next(spacerPath);

              if (nextSiblingPath && editorHasPath(editor, nextSiblingPath)) {
                const nextSibling = getCurrentNode(editor, nextSiblingPath);

                if (
                  NodeApi.isElement(nextSibling) &&
                  getEditorSchema(editor).isInline(nextSibling)
                ) {
                  return editorPoint(editor, nextSiblingPath, {
                    edge: 'start',
                  });
                }
              }
            }
          }
        }
      }
    }

    if (
      point.path.length > 0 &&
      editorHasPath(editor, point.path) &&
      isTextNode(getCurrentNode(editor, point.path))
    ) {
      const parentPath = point.path.slice(0, -1) as Path;

      if (editorHasPath(editor, parentPath)) {
        const parent = getCurrentNode(editor, parentPath);

        if (
          NodeApi.isElement(parent) &&
          getEditorSchema(editor).isInline(parent) &&
          getEditorSchema(editor).isVoid(parent) &&
          PointApi.equals(
            point,
            editorPoint(editor, parentPath, { edge: 'start' })
          )
        ) {
          const previousSiblingPath =
            parentPath.at(-1) === 0 ? null : PathApi.previous(parentPath);

          if (
            previousSiblingPath &&
            editorHasPath(editor, previousSiblingPath)
          ) {
            return editorPoint(editor, previousSiblingPath, {
              edge: 'end',
            });
          }
        }
      }
    }

    if (!options.allowForwardBoundaryJump) {
      return point;
    }

    if (point.path.length > 0) {
      const currentNode = getCurrentNode(editor, point.path);
      const nextSiblingPath =
        point.path.at(-1) == null ? null : PathApi.next(point.path);

      if (
        isTextNode(currentNode) &&
        point.offset === currentNode.text.length &&
        nextSiblingPath &&
        editorHasPath(editor, nextSiblingPath)
      ) {
        const nextSibling = getCurrentNode(editor, nextSiblingPath);

        if (
          NodeApi.isElement(nextSibling) &&
          (!getEditorSchema(editor).isInline(nextSibling) ||
            getEditorSchema(editor).isVoid(nextSibling))
        ) {
          return editorPoint(editor, nextSiblingPath, { edge: 'start' });
        }
      }

      if (point.path.length >= 2) {
        const parentPath = point.path.slice(0, -1) as Path;

        if (editorHasPath(editor, parentPath)) {
          const parent = getCurrentNode(editor, parentPath);

          if (
            NodeApi.isElement(parent) &&
            parentPath.length > 1 &&
            PointApi.equals(
              point,
              editorPoint(editor, parentPath, { edge: 'end' })
            )
          ) {
            if (
              getEditorSchema(editor).isInline(parent) &&
              !getEditorSchema(editor).isVoid(parent) &&
              NodeApi.string(parent) === ''
            ) {
              return point;
            }

            const afterParentPath =
              parentPath.at(-1) == null ? null : PathApi.next(parentPath);

            if (afterParentPath && editorHasPath(editor, afterParentPath)) {
              return editorPoint(editor, afterParentPath, {
                edge: 'start',
              });
            }
          }
        }
      }
    }

    return point;
  }

  if (point.offset !== 0 || point.path.length < 2) {
    if (point.offset !== 0 || point.path.length === 0) {
      return point;
    }

    const currentNode = editorHasPath(editor, point.path)
      ? getCurrentNode(editor, point.path)
      : null;

    if (currentNode && isTextNode(currentNode) && currentNode.text === '') {
      return point;
    }

    const nextSiblingPath =
      point.path.at(-1) == null ? null : PathApi.next(point.path);

    if (!nextSiblingPath || !editorHasPath(editor, nextSiblingPath)) {
      return point;
    }

    const nextSibling = getCurrentNode(editor, nextSiblingPath);

    return NodeApi.isElement(nextSibling) &&
      getEditorSchema(editor).isInline(nextSibling) &&
      nextSibling.children.length > 0
      ? editorPoint(editor, nextSiblingPath, { edge: 'start' })
      : point;
  }

  const parentPath = point.path.slice(0, -1) as Path;

  if (!editorHasPath(editor, parentPath) || parentPath.at(-1) === 0) {
    return point;
  }

  const parent = getCurrentNode(editor, parentPath);

  if (!NodeApi.isElement(parent) || !getEditorSchema(editor).isInline(parent)) {
    return point;
  }

  if (
    !getEditorSchema(editor).isVoid(parent) &&
    NodeApi.string(parent) === ''
  ) {
    return point;
  }

  if (point.offset === 0 && isTextNode(getCurrentNode(editor, point.path))) {
    const previousSiblingPath =
      parentPath.at(-1) === 0 ? null : PathApi.previous(parentPath);

    if (previousSiblingPath && editorHasPath(editor, previousSiblingPath)) {
      const previousSibling = getCurrentNode(editor, previousSiblingPath);

      if (isTextNode(previousSibling) && previousSibling.text === '') {
        const nextSiblingPath =
          parentPath.at(-1) == null ? null : PathApi.next(parentPath);

        if (nextSiblingPath && editorHasPath(editor, nextSiblingPath)) {
          const nextSibling = getCurrentNode(editor, nextSiblingPath);

          if (isTextNode(nextSibling) && nextSibling.text === '') {
            return point;
          }
        }

        return { path: previousSiblingPath, offset: 0 };
      }
    }
  }

  if (
    isTextNode(getCurrentNode(editor, point.path)) &&
    PointApi.equals(point, editorPoint(editor, point.path, { edge: 'end' }))
  ) {
    const nextSiblingPath =
      parentPath.at(-1) == null ? null : PathApi.next(parentPath);

    if (nextSiblingPath && editorHasPath(editor, nextSiblingPath)) {
      const nextSibling = getCurrentNode(editor, nextSiblingPath);

      if (isTextNode(nextSibling) && nextSibling.text.length > 0) {
        return editorPoint(editor, nextSiblingPath, { edge: 'start' });
      }
    }
  }

  const previousSiblingPath = PathApi.previous(parentPath);

  if (!editorHasPath(editor, previousSiblingPath)) {
    return point;
  }

  const previousSibling = getCurrentNode(editor, previousSiblingPath);

  return isTextNode(previousSibling) && previousSibling.text === ''
    ? { path: previousSiblingPath, offset: 0 }
    : point;
};

const getCollapsedDeleteTarget = (
  editor: Editor,
  at: import('../interfaces').Point,
  options: {
    reverse: boolean;
    distance: number;
    unit: NonNullable<
      TextMutationMethods['delete'] extends (
        editor: Editor,
        options?: infer T
      ) => unknown
        ? T extends { unit?: infer U }
          ? U
          : never
        : never
    >;
    voids: boolean;
  }
) => {
  const { reverse, distance, unit, voids } = options;
  const pointTarget = matchPointRootVisibility(
    reverse
      ? (editorBefore(editor, at, { distance, unit, voids }) ??
          editorPoint(editor, [], { edge: 'start' }))
      : (editorAfter(editor, at, { distance, unit, voids }) ??
          editorPoint(editor, [], { edge: 'end' })),
    at
  );

  if (unit !== 'character' || distance !== 1) {
    return pointTarget;
  }

  const [leaf] = editorLeaf(editor, at);
  const atBoundary = reverse ? at.offset === 0 : at.offset === leaf.text.length;

  if (!atBoundary) {
    return pointTarget;
  }

  const offsetTarget = reverse
    ? editorBefore(editor, at, { distance, unit: 'offset', voids })
    : editorAfter(editor, at, { distance, unit: 'offset', voids });

  if (!offsetTarget) {
    return pointTarget;
  }

  const normalizedOffsetTarget = matchPointRootVisibility(offsetTarget, at);

  if (crossesIsolatingBoundary(editor, at, pointTarget, voids)) {
    return at;
  }

  if (!voids) {
    // Deletion must see adjacent atoms that caret navigation skips.
    const positions = editorPositions(editor, {
      at: { anchor: at, focus: pointTarget },
      reverse,
      unit: 'offset',
    });
    positions.next();
    const adjacent = positions.next().value;

    if (adjacent && getHighestNonEditable(editor, adjacent)) {
      return matchPointRootVisibility(adjacent, at);
    }
  }

  const currentBlock = editorAbove(editor, {
    at,
    match: (node) => NodeApi.isElement(node) && editorIsBlock(editor, node),
    mode: 'lowest',
    voids,
  });
  const targetBlock = editorAbove(editor, {
    at: pointTarget,
    match: (node) => NodeApi.isElement(node) && editorIsBlock(editor, node),
    mode: 'lowest',
    voids,
  });
  const sameBlockTextBoundaryTarget =
    currentBlock &&
    targetBlock &&
    PathApi.equals(currentBlock[1], targetBlock[1]) &&
    !PathApi.equals(at.path, pointTarget.path) &&
    editorHasPath(editor, pointTarget.path)
      ? getCurrentNode(editor, pointTarget.path)
      : null;

  if (
    isTextNode(sameBlockTextBoundaryTarget) &&
    sameBlockTextBoundaryTarget.text.length > 0
  ) {
    if (
      reverse &&
      pointTarget.offset === sameBlockTextBoundaryTarget.text.length
    ) {
      const target = editorBefore(editor, pointTarget, {
        distance: 1,
        unit: 'character',
        voids,
      });

      return target ? matchPointRootVisibility(target, at) : pointTarget;
    }

    if (!reverse && pointTarget.offset === 0) {
      const target = editorAfter(editor, pointTarget, {
        distance: 1,
        unit: 'character',
        voids,
      });

      return target ? matchPointRootVisibility(target, at) : pointTarget;
    }
  }

  if (
    currentBlock &&
    targetBlock &&
    ((reverse &&
      PointApi.equals(
        at,
        editorPoint(editor, currentBlock[1], { edge: 'start' })
      )) ||
      (!reverse &&
        PointApi.equals(
          at,
          editorPoint(editor, currentBlock[1], { edge: 'end' })
        ))) &&
    !PathApi.equals(currentBlock[1], targetBlock[1])
  ) {
    return normalizedOffsetTarget;
  }

  return pointTarget;
};

const mergeBlocksAtPoint = (
  editor: Editor,
  point: import('../interfaces').Point,
  voids: boolean
) => {
  mergeNodes(editor, {
    at: point,
    hanging: true,
    voids,
  });
};

const removePlainRange = (editor: Editor, range: Range, voids: boolean) => {
  const target = resolveDeleteTarget(editor, {
    at: range,
    hanging: true,
    voids,
  });

  if (target?.kind !== 'range') return null;

  const removal = removeDeleteContents(editor, target);
  const keptIncompatibleBlockBoundary = reconcileDeleteStructure(
    editor,
    target,
    removal
  );

  return (
    resolveDeletePoint(
      editor,
      target,
      removal,
      keptIncompatibleBlockBoundary
    ) ?? null
  );
};

export type PreparedRemoval = Readonly<{ options: DeleteOptions }> &
  (
    | Readonly<{ kind: 'ordinary'; target: DeletePathTarget | DeleteRangePlan }>
    | Readonly<{
        kind: 'grid';
        plan: GridRemovalPlan;
        target: DeleteRangePlan;
        wholeBlocks: WholeTopLevelBlockRange | null;
      }>
  );

export type RemovalOutcome =
  | Readonly<{ kind: 'ordinary' }>
  | Readonly<{ keepsGrid: boolean; kind: 'grid'; landing: Point | null }>;

type RemovalSite = Readonly<{
  at: Location;
  root: string | undefined;
  writesSelection: boolean;
}>;

const inRoot = <T>(editor: Editor, root: string | undefined, run: () => T) =>
  root
    ? withEditorUpdateRoot(editor, root, () =>
        withEditorUpdateRootChildren(editor, root, run)
      )
    : run();

const inRemovalRoot = <T>(
  editor: Editor,
  at: DeleteOptions['at'],
  run: (tx: TransactionWriter, site: RemovalSite) => T
): T | null =>
  inRoot(
    editor,
    getTransactionRoot(editor, at),
    () =>
      runEditorTransaction(editor, (tx) => {
        const resolved = tx.resolveTarget({ at });

        if (!resolved || !LocationApi.isLocation(resolved)) return null;

        const selection = getCurrentSelection(editor);
        const root = getLocationRoot(resolved);
        const site: RemovalSite = {
          at: root ? stripLocationRoots(resolved) : resolved,
          root,
          writesSelection:
            at === undefined ||
            (selection !== null &&
              RangeApi.isRange(selection) &&
              LocationApi.isRange(resolved) &&
              RangeApi.equals(selection, resolved)),
        };

        return inRoot(editor, root, () => run(tx, site));
      }) ?? null
  );

const spansTexts = (
  target: DeletePathTarget | DeleteRangePlan
): target is DeleteRangePlan =>
  target.kind === 'range' && !target.isCollapsed && !target.isSingleText;

const prepareAt = (
  editor: Editor,
  options: DeleteOptions,
  at: Location,
  writes: boolean
): PreparedRemoval | null => {
  const target = profileCoreDuration('delete-resolve-target', () =>
    resolveDeleteTarget(editor, options, at)
  );

  if (!target) return null;
  if (!spansTexts(target)) return { kind: 'ordinary', options, target };

  const plan = profileCoreDuration('delete-grid-plan', () =>
    planGridRemoval(editor, target.effectiveRange)
  );

  if (!plan) return { kind: 'ordinary', options, target };

  const shortcut = plan.keepsGrid
    ? null
    : profileCoreDuration('delete-whole-range-plan', () =>
        getWholeTopLevelBlockRange(editor, target)
      );
  const wholeBlocks =
    writes && shortcut && !isWritablePoint(editor, shortcut.landing)
      ? null
      : shortcut;

  if (writes && !wholeBlocks && !plan.landing) return null;

  return { kind: 'grid', options, plan, target, wholeBlocks };
};

const applyAt = (
  editor: Editor,
  tx: TransactionWriter,
  site: RemovalSite,
  prepared: PreparedRemoval
): RemovalOutcome => {
  const { target } = prepared;
  const writesSelection =
    site.writesSelection || target.kind === 'path' || !target.isSingleText;

  if (target.kind === 'path') {
    deletePathTarget(editor, target, tx, writesSelection);

    return { kind: 'ordinary' };
  }

  const deletedMarks = profileCoreDuration('delete-range-text-marks', () =>
    getConsistentRangeTextMarks(editor, target.effectiveRange)
  );
  const setDeletedMarks = () => {
    const caret = getCurrentSelection(editor);

    if (!writesSelection || !deletedMarks || !caret) return;

    tx.setMarks(
      shouldClearDeletedMarksAtMarkedSuffix(editor, deletedMarks)
        ? {}
        : RangeApi.isRange(caret)
          ? withoutUnheldDefaultsBeside(
              editor,
              deletedMarks,
              caret.focus.path,
              caret.focus.root ?? getEditorUpdateRoot(editor)
            )
          : deletedMarks
    );
  };
  const withRoot = (point: Point) =>
    site.root ? { ...point, root: site.root } : point;
  const wholeBlocks =
    prepared.kind === 'grid'
      ? prepared.wholeBlocks
      : profileCoreDuration('delete-whole-range-plan', () =>
          getWholeTopLevelBlockRange(editor, target)
        );

  if (wholeBlocks) {
    const caret = deleteWholeTopLevelBlockRange(editor, wholeBlocks);

    setDeletedMarks();

    return prepared.kind === 'grid'
      ? { keepsGrid: false, kind: 'grid', landing: withRoot(caret) }
      : { kind: 'ordinary' };
  }
  if (prepared.kind === 'grid') {
    const { plan } = prepared;
    const nearest = plan.landing
      ? null
      : createAnchor(editor, target.start, {
          association: 'backward',
          deletion: 'nearest',
        });
    const landing = removeGridSteps(editor, plan, (range) =>
      removePlainRange(editor, range, target.voids)
    );
    const caret = landing ?? nearest?.release();

    if (writesSelection && caret) {
      tx.setSelection(SelectionApi.text({ anchor: caret, focus: caret }));
    }
    setDeletedMarks();

    return {
      keepsGrid: plan.keepsGrid,
      kind: 'grid',
      landing: landing && withRoot(landing),
    };
  }

  const removal = removeDeleteContents(editor, target);
  const keptIncompatibleBlockBoundary = reconcileDeleteStructure(
    editor,
    target,
    removal
  );

  if (writesSelection) {
    resolveDeleteSelection(
      editor,
      target,
      removal,
      tx,
      keptIncompatibleBlockBoundary
    );
  } else {
    removal.startAnchor.release();
    removal.endAnchor.release();
    removal.startBlockAnchor?.release();
  }
  setDeletedMarks();

  return { kind: 'ordinary' };
};

export const prepareRemoval = (
  editor: Editor,
  options: DeleteOptions & Readonly<{ writes: boolean }>
): PreparedRemoval | null =>
  inRemovalRoot(editor, options.at, (_tx, site) =>
    prepareAt(editor, options, site.at, options.writes)
  );

export const applyRemoval = (editor: Editor, prepared: PreparedRemoval) =>
  inRemovalRoot(editor, prepared.options.at, (tx, site) =>
    applyAt(editor, tx, site, prepared)
  );

export const removeText = (
  editor: Editor,
  options: DeleteOptions & Readonly<{ writes?: boolean }>
): RemovalOutcome | null =>
  inRemovalRoot(editor, options.at, (tx, site) => {
    const prepared = prepareAt(editor, options, site.at, !!options.writes);

    return prepared && applyAt(editor, tx, site, prepared);
  });

export const resolveDeletedRange = (
  editor: Editor,
  range: Range
): Range | null => {
  const target = resolveDeleteTarget(editor, {}, range);

  if (target?.kind !== 'range') return range;
  if (
    spansTexts(target) &&
    planGridSteps(editor, target.effectiveRange)?.keepsGrid
  ) {
    return null;
  }

  return [target.startNonEditable, target.endNonEditable].every(
    (holder) => !holder || isInlineVoid(editor, holder[0])
  )
    ? target.effectiveRange
    : null;
};

export const deleteText: TextMutationMethods['delete'] = (
  editor,
  options = {}
) => {
  removeText(editor, options);
};
