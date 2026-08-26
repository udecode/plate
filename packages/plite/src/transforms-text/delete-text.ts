import { getEditorSchema } from '../core/editor-runtime';
import {
  getCurrentSelection,
  profileCoreDuration,
  runEditorTransaction,
  withEditorUpdateRoot,
  withEditorUpdateRootChildren,
} from '../core/public-state';
import {
  type Location,
  LocationApi,
  NodeApi,
  type Path,
  PathApi,
  type Point,
  PointApi,
  RangeApi,
  SelectionApi,
  TextApi,
  type Element as PliteElement,
} from '../interfaces';
import {
  above as editorAbove,
  after as editorAfter,
  before as editorBefore,
  getChildren as editorGetChildren,
  hasPath as editorHasPath,
  isBlock as editorIsBlock,
  leaf as editorLeaf,
  point as editorPoint,
  unhangRange as editorUnhangRange,
} from '../interfaces/editor';
import type { AnyEditor as Editor } from '../interfaces/editor';
import type { TextMutationMethods } from '../interfaces/transforms/text';
import { getDefined } from '../internal/get-defined';
import { getConsistentRangeTextMarks } from '../internal/range-text-marks';
import { getLocationRoot, stripLocationRoots } from '../internal/root-location';
import { mergeNodes, removeNodes } from '../transforms-node';
import {
  getEmptyEditableInlinePathAtPoint,
  getPreviousEmptyBlockPathAtBlockStart,
} from './delete-text-collapsed-path-targets';
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
  maybeMergeAdjacentTextAt,
  mergeAdjacentTextRuns,
  removeEmptyStructuralArtifacts,
  restorePreservedEmptyStartBlock,
} from './delete-text-structural-cleanup';
import {
  deleteWholeTopLevelBlockRange,
  getWholeTopLevelBlockRange,
} from './delete-text-whole-blocks';

const shouldMergeAcrossBlocks = (plan: DeleteRangePlan) =>
  plan.startNonEditable == null && plan.endNonEditable == null;

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
    plan.effectiveEndBlockPath.length !== 1 ||
    !editorHasPath(editor, plan.effectiveStartBlockPath)
  ) {
    return false;
  }

  const startBlock = getCurrentNode(editor, plan.effectiveStartBlockPath);

  return (
    NodeApi.isElement(startBlock) &&
    editorIsBlock(editor, startBlock) &&
    NodeApi.string(startBlock) === '' &&
    PointApi.equals(
      plan.start,
      editorPoint(editor, plan.effectiveStartBlockPath, { edge: 'end' })
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
    [...keys].every((key) =>
      getEditorSchema(editor).isTextPropertyEqualAt(
        key,
        node[key],
        deletedMarks[key],
        anchor.path,
        anchor.root ?? 'main'
      )
    )
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

    if (!PointApi.equals(end, endOfDocument)) {
      at = editorUnhangRange(editor, at, { voids });
    }
  }

  let [start, end] = RangeApi.edges(at);
  const startBlock = editorAbove(editor, {
    at: start,
    match: (node) => NodeApi.isElement(node) && editorIsBlock(editor, node),
    mode: 'highest',
    voids,
  });
  const endBlock = editorAbove(editor, {
    at: end,
    match: (node) => NodeApi.isElement(node) && editorIsBlock(editor, node),
    mode: 'highest',
    voids,
  });
  const startMergeBlock = editorAbove(editor, {
    at: start,
    match: (node) => NodeApi.isElement(node) && editorIsBlock(editor, node),
    mode: 'lowest',
    voids,
  });
  const endMergeBlock = editorAbove(editor, {
    at: end,
    match: (node) => NodeApi.isElement(node) && editorIsBlock(editor, node),
    mode: 'lowest',
    voids,
  });
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

  if (startNonEditable) {
    const before = editorBefore(editor, start);

    if (
      before &&
      startBlock &&
      PathApi.isAncestor(startBlock[1], before.path)
    ) {
      start = before;
    }
  }

  if (endNonEditable) {
    const after = editorAfter(editor, end);

    if (after && endBlock && PathApi.isAncestor(endBlock[1], after.path)) {
      end = after;
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
      const originalEndBlock = editorAbove(editor, {
        at: originalEnd,
        match: (node) => NodeApi.isElement(node) && editorIsBlock(editor, node),
        mode: 'highest',
        voids,
      });

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
        } as PliteElement)
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
    isSingleText,
    isAcrossBlocks,
    startNonEditable,
    endNonEditable,
    preserveEndBlock,
    preserveInlineEdge,
    preserveEmptyStartBlockPath,
    preservedEmptyStartBlock,
    startMergeBlockPath: startMergeBlock?.[1] ?? null,
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
  const topLevelCleanupRange = getTopLevelCleanupRange(plan);

  if (!plan.isSingleText && plan.isAcrossBlocks) {
    const mergePoint = shouldMergeAcrossBlocks(plan)
      ? resolveMergePoint(
          editor,
          plan,
          removal.startAnchor.resolve(),
          removal.endAnchor.resolve()
        )
      : null;

    if (plan.preserveEmptyStartBlockPath) {
      removeEmptyStructuralArtifacts(
        editor,
        plan.preserveEmptyStartBlockPath,
        null,
        topLevelCleanupRange
      );
      mergeAdjacentTextRuns(editor);
    } else if (plan.preserveEndBlock && mergePoint) {
      mergeBlocksAtPoint(editor, mergePoint, plan.voids);
      removeEmptyStructuralArtifacts(
        editor,
        plan.preserveEmptyStartBlockPath,
        null,
        topLevelCleanupRange
      );
      mergeAdjacentTextRuns(editor);
    } else if (plan.voids && mergePoint && plan.effectiveEndBlockPath) {
      mergeNodes(editor, {
        at: plan.effectiveEndBlockPath,
      });
      removeEmptyStructuralArtifacts(
        editor,
        plan.preserveEmptyStartBlockPath,
        null,
        topLevelCleanupRange
      );
      mergeAdjacentTextRuns(editor);
    } else if (shouldRemoveEmptyForwardStartBlock(editor, plan)) {
      removeNodes(editor, {
        at: getDefined(plan.effectiveStartBlockPath),
        voids: plan.voids,
      });
      removeEmptyStructuralArtifacts(
        editor,
        plan.preserveEmptyStartBlockPath,
        null,
        topLevelCleanupRange
      );
      mergeAdjacentTextRuns(editor);
    } else if (mergePoint) {
      mergeBlocksAtPoint(editor, mergePoint, plan.voids);
      removeEmptyStructuralArtifacts(
        editor,
        plan.preserveEmptyStartBlockPath,
        null,
        topLevelCleanupRange
      );
      mergeAdjacentTextRuns(editor);
    } else {
      removeEmptyStructuralArtifacts(
        editor,
        plan.preserveEmptyStartBlockPath,
        null,
        topLevelCleanupRange
      );

      if (!plan.startNonEditable && !plan.endNonEditable) {
        mergeAdjacentTextRuns(editor);
      }
    }
  } else if (!plan.isSingleText) {
    removeEmptyStructuralArtifacts(
      editor,
      plan.startMergeBlockPath,
      plan.effectiveStartBlockPath,
      topLevelCleanupRange
    );

    if (!plan.removedInteriorElementSiblingStructure) {
      mergeAdjacentTextRuns(editor);
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
};

const resolveDeleteSelection = (
  editor: Editor,
  plan: DeleteRangePlan,
  removal: ReturnType<typeof removeDeleteContents>,
  tx: TransactionWriter
) => {
  const startPoint = removal.startAnchor.release();
  const endPoint = removal.endAnchor.release();
  const reverseMergePoint =
    plan.reverse &&
    plan.isCollapsed &&
    plan.isAcrossBlocks &&
    startPoint &&
    endPoint &&
    !PathApi.equals(startPoint.path.slice(0, -1), endPoint.path.slice(0, -1))
      ? endPoint
      : (startPoint ?? endPoint);
  const collapseTarget =
    !plan.isCollapsed && editorHasPath(editor, plan.start.path)
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

export const deleteText: TextMutationMethods['delete'] = (
  editor,
  options = {}
) => {
  const transactionRoot = getTransactionRoot(editor, options.at);
  const run = () => {
    runEditorTransaction(editor, (tx) => {
      const at = tx.resolveTarget({ at: options.at });

      if (!at) {
        return;
      }
      if (!LocationApi.isLocation(at)) return;

      const selection = getCurrentSelection(editor);
      const shouldWriteSelection =
        options.at === undefined ||
        (selection !== null &&
          RangeApi.isRange(selection) &&
          LocationApi.isRange(at) &&
          RangeApi.equals(selection, at));

      const deleteAt = (targetAt: Location) => {
        const target = profileCoreDuration('delete-resolve-target', () =>
          resolveDeleteTarget(editor, options, targetAt)
        );

        if (!target) {
          return;
        }

        const shouldWriteTargetSelection =
          shouldWriteSelection ||
          target.kind === 'path' ||
          !target.isSingleText;

        if (target.kind === 'path') {
          deletePathTarget(editor, target, tx, shouldWriteTargetSelection);
          return;
        }

        const deletedMarks = profileCoreDuration(
          'delete-range-text-marks',
          () => getConsistentRangeTextMarks(editor, target.effectiveRange)
        );
        const setDeletedMarks = () => {
          if (
            !shouldWriteTargetSelection ||
            !deletedMarks ||
            !getCurrentSelection(editor)
          ) {
            return;
          }

          tx.setMarks(
            shouldClearDeletedMarksAtMarkedSuffix(editor, deletedMarks)
              ? {}
              : deletedMarks
          );
        };
        const wholeTopLevelBlockRange = profileCoreDuration(
          'delete-whole-range-plan',
          () => getWholeTopLevelBlockRange(editor, target)
        );

        if (
          wholeTopLevelBlockRange &&
          deleteWholeTopLevelBlockRange(editor, wholeTopLevelBlockRange)
        ) {
          setDeletedMarks();
          return;
        }

        const removal = removeDeleteContents(editor, target);

        reconcileDeleteStructure(editor, target, removal);
        if (shouldWriteTargetSelection) {
          resolveDeleteSelection(editor, target, removal, tx);
        } else {
          removal.startAnchor.release();
          removal.endAnchor.release();
        }
        setDeletedMarks();
      };

      const root = getLocationRoot(at);

      if (root) {
        withEditorUpdateRoot(editor, root, () => {
          withEditorUpdateRootChildren(editor, root, () =>
            deleteAt(stripLocationRoots(at))
          );
        });
      } else {
        deleteAt(at);
      }
    });
  };

  if (transactionRoot) {
    withEditorUpdateRoot(editor, transactionRoot, () => {
      withEditorUpdateRootChildren(editor, transactionRoot, run);
    });
  } else {
    run();
  }
};
