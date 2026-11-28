import { createAnchor } from '../core/anchor';
import { jsonEqual } from '../core/change/json';
import { refuseTextWriteInStruck } from '../core/content-landing';
import { getEditorSchema } from '../core/editor-runtime';
import { holdsOneText } from '../core/editor-schema';
import { joinKeepsPrefixOccupant } from '../core/prefix-occupant-join';
import {
  applyBuiltDocumentChange,
  getActiveUpdateRoot,
  getChildList,
  getCurrentSelection,
  getCurrentSelectionRoot,
  getEditorUpdateRoot,
  getSetSite,
  profileCoreDuration,
  runEditorTransaction,
  withEditorUpdateRoot,
  withEditorUpdateRootChildren,
} from '../core/public-state';
import { crossesMembers, refuseCrossing } from '../core/set-root';
import {
  canReplaceChildrenWithText,
  isEditablePath,
  isNonEditable,
  isWritablePoint,
} from '../core/writable-text';
import { contentAfter } from '../editor/after';
import { contentBefore } from '../editor/before';
import {
  hasEdgeInReadOnlyInline,
  refusesReadOnlyWrite,
} from '../editor/element-read-only';
import { nodes as getNodes } from '../editor/nodes';
import { readTextEdge } from '../editor/point';
import { structuralPrevious } from '../editor/previous';
import { isSkippedElement } from '../editor/reach';
import {
  type Element as EditorElement,
  type Location,
  LocationApi,
  type Node,
  NodeApi,
  type NodeEntry,
  type NodeSelection,
  type Path,
  PathApi,
  type Point,
  PointApi,
  type Range,
  RangeApi,
  SelectionApi,
  type Span,
  TextApi,
} from '../interfaces';
import type { AnyEditor as Editor } from '../interfaces/editor';
import {
  above as editorAbove,
  after as editorAfter,
  before as editorBefore,
  first as editorFirst,
  getChildren as editorGetChildren,
  hasPath as editorHasPath,
  isBlock as editorIsBlock,
  last as editorLast,
  leaf as editorLeaf,
  parent as editorParent,
  point as editorPoint,
  positions as editorPositions,
  shouldMergeNodesRemovePrevNode as editorShouldMergeNodesRemovePrevNode,
  string as editorString,
} from '../interfaces/editor';
import type { TextMutationMethods } from '../interfaces/transforms/text';
import { getDefined } from '../internal/get-defined';
import {
  getConsistentRangeTextMarks,
  withoutUnheldDefaultsBeside,
} from '../internal/range-text-marks';
import { getLocationRoot, stripLocationRoots } from '../internal/root-location';
import {
  mergeNodes,
  removeNodes,
  splitNodesKeepingType,
} from '../transforms-node';
import {
  getEmptyBlockBesideGrid,
  getGridBesideBlockEdge,
  getEmptyEditableInlinePathAtPoint,
  getPreviousEmptyBlockPathAtBlockStart,
} from './delete-text-collapsed-path-targets';
import {
  type GridRemovalPlan,
  planGridRemoval,
  planGridSteps,
  readGridCell,
  readGridRole,
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
  const previous = structuralPrevious(editor, {
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

const readForwardDeletedEmptyBlock = (
  editor: Editor,
  plan: DeleteRangePlan
): Path | null => {
  if (
    plan.reverse ||
    !plan.isCollapsed ||
    !plan.isAcrossBlocks ||
    !plan.effectiveStartBlockPath ||
    !plan.effectiveEndBlockPath ||
    plan.effectiveStartBlockPath.length !== 1 ||
    !editorHasPath(editor, plan.effectiveStartBlockPath)
  ) {
    return null;
  }

  const startBlock = getCurrentNode(editor, plan.effectiveStartBlockPath);
  const joinedPath = PathApi.next(plan.effectiveStartBlockPath);

  if (
    !NodeApi.isElement(startBlock) ||
    !editorIsBlock(editor, startBlock) ||
    !PointApi.equals(
      plan.start,
      matchPointRootVisibility(
        editorPoint(editor, plan.effectiveStartBlockPath, { edge: 'end' }),
        plan.start
      )
    ) ||
    joinKeepsPrefixOccupant(
      editor,
      [startBlock, plan.effectiveStartBlockPath],
      [getCurrentNode(editor, joinedPath), joinedPath]
    )
  ) {
    return null;
  }

  const { isVoid } = getEditorSchema(editor);
  let removed: Path | null = null;

  for (let depth = plan.start.path.length - 1; depth >= 1; depth -= 1) {
    const path = plan.start.path.slice(0, depth);
    const node = getCurrentNode(editor, path);

    if (!NodeApi.isElement(node) || !editorIsBlock(editor, node)) continue;
    if (
      isVoid(node) ||
      NodeApi.string(node) !== '' ||
      (removed
        ? node.children.length !== 1
        : Array.from(NodeApi.elements(node)).some(([element]) =>
            isVoid(element)
          ))
    ) {
      break;
    }

    removed = path;
  }

  return removed;
};

const getSelectionInUpdateRoot = (editor: Editor) => {
  const selection = getCurrentSelection(editor);

  if (!selection) return null;

  return (SelectionApi.root(selection) ?? getCurrentSelectionRoot(editor)) ===
    getEditorUpdateRoot(editor)
    ? selection
    : null;
};

const shouldClearDeletedMarksAtMarkedSuffix = (
  editor: Editor,
  deletedMarks: Record<string, unknown>
) => {
  const selection = getSelectionInUpdateRoot(editor);

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

const clampToIsolationScope = (
  editor: Editor,
  at: Point,
  target: Point,
  reverse: boolean,
  voids: boolean
): Point => {
  if (PathApi.equals(at.path, target.path)) return target;

  const scope = getClosestIsolatingAncestor(editor, at, voids);

  return scope && !pathContainsPoint(scope[1], target)
    ? editorPoint(editor, scope[1], { edge: reverse ? 'start' : 'end' })
    : target;
};

const isReadOnlyGridPart = (
  editor: Editor,
  node: EditorElement,
  path: Path,
  voids: boolean
) => {
  const role = readGridRole(editor, node);

  return (
    (role === 'cell' || role === 'row') &&
    isEditablePath(editor, PathApi.parent(path), { voids })
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

const unhangDeleteRange = (
  editor: Editor,
  range: Range,
  voids: boolean
): Range => {
  const [start, end] = RangeApi.edges(range);

  if (start.offset !== 0 || end.offset !== 0 || PathApi.hasPrevious(end.path)) {
    return range;
  }

  const endOfDocument = matchPointRootVisibility(
    editorPoint(editor, [], { edge: 'end' }),
    end
  );
  const endHolder = voids ? undefined : getHighestNonEditable(editor, end);
  const schema = getEditorSchema(editor);
  const endsInsideVoid = !!endHolder && schema.isVoid(endHolder[0]);

  if (PointApi.equals(end, endOfDocument) || endsInsideVoid) {
    return range;
  }

  const endBlock = editorAbove(editor, {
    at: end,
    match: (node) => NodeApi.isElement(node) && editorIsBlock(editor, node),
    voids: true,
  });
  const blockPath = endBlock ? endBlock[1] : [];
  let skip = true;

  for (const [node, path] of getNodes(editor, {
    at: { anchor: start, focus: end },
    match: NodeApi.isText,
    pass: ([candidate]) =>
      !voids &&
      NodeApi.isElement(candidate) &&
      !schema.isVoid(candidate) &&
      schema.isReadOnly(candidate),
    reverse: true,
    voids: true,
  })) {
    if (skip) {
      skip = false;
      continue;
    }

    if (node.text !== '' || PathApi.isBefore(path, blockPath)) {
      const focus = matchPointRootVisibility(
        { offset: node.text.length, path },
        start
      );
      const unhungHasNoText =
        PointApi.equals(start, focus) ||
        editorString(editor, { anchor: start, focus }) === '';

      if (unhungHasNoText) {
        const startBlock = editorAbove(editor, {
          at: start,
          match: (candidate) =>
            NodeApi.isElement(candidate) && editorIsBlock(editor, candidate),
          voids,
        });
        const atStartBlockStart =
          !!startBlock &&
          PointApi.equals(
            start,
            matchPointRootVisibility(
              editorPoint(editor, startBlock[1], { edge: 'start' }),
              start
            )
          );

        if (!atStartBlockStart) {
          return range;
        }
      }

      return { anchor: start, focus: { offset: node.text.length, path } };
    }
  }

  return range;
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
      const role = readGridRole(editor, nonEditable[0]);

      if (role === 'cell' || role === 'row') return null;

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
          fallbackAssociation: 'forward',
          fallbackPoint:
            contentBefore(editor, emptyInlinePath, { voids: true }) ??
            contentAfter(editor, emptyInlinePath, { voids: true }),
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
          fallbackAssociation: 'backward',
          fallbackPoint: at,
          initialAt,
        };
      }

      const collapsedTarget = getCollapsedDeleteTarget(editor, at, {
        reverse,
        distance,
        unit,
        voids,
      });

      if (collapsedTarget.kind === 'path') {
        return {
          kind: 'path',
          path: collapsedTarget.path,
          fallbackAssociation: reverse ? 'backward' : 'forward',
          fallbackPoint: at,
          initialAt,
        };
      }

      const target = collapsedTarget.point;
      const besideGrid =
        distance > 0 && PointApi.equals(target, at)
          ? getGridBesideBlockEdge(editor, at, reverse, voids)
          : null;
      const emptyBlockBesideGrid =
        besideGrid && getEmptyBlockBesideGrid(editor, besideGrid);

      if (emptyBlockBesideGrid) {
        return {
          kind: 'path',
          path: emptyBlockBesideGrid.path,
          fallbackAssociation: 'backward',
          fallbackPoint: emptyBlockBesideGrid.landing,
          initialAt,
        };
      }

      const targetNonEditable = voids
        ? undefined
        : getHighestNonEditable(editor, target);

      if (targetNonEditable && !pathContainsPoint(targetNonEditable[1], at)) {
        return {
          kind: 'path',
          path: targetNonEditable[1],
          fallbackAssociation: reverse ? 'backward' : 'forward',
          fallbackPoint: at,
          initialAt,
        };
      }

      at = { anchor: at, focus: target };
      hanging = true;
    }
  }

  if (LocationApi.isPath(at)) {
    const selection = getSelectionInUpdateRoot(editor);
    const selectionInside =
      selection &&
      RangeApi.isRange(selection) &&
      (pathContainsPoint(at, selection.anchor) ||
        pathContainsPoint(at, selection.focus));
    const fallbackPoint = selectionInside
      ? (contentBefore(editor, at, { voids: true }) ??
        contentAfter(editor, at, { voids: true }))
      : undefined;

    return {
      kind: 'path',
      path: at,
      fallbackAssociation: 'forward',
      fallbackPoint,
      initialAt,
    };
  }

  if (!RangeApi.isRange(at) || RangeApi.isCollapsed(at)) {
    return null;
  }

  if (!hanging) {
    at = unhangDeleteRange(editor, at, voids);
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
      shareGridCellOrNone(editor, start.path, before.path) &&
      !getHighestNonEditable(editor, before)
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
      shareGridCellOrNone(editor, end.path, after.path) &&
      !getHighestNonEditable(editor, after)
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
      matchPointRootVisibility(
        editorPoint(editor, effectiveEndBlock[1], { edge: 'start' }),
        end
      )
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
          matchPointRootVisibility(originalEnd, end),
          matchPointRootVisibility(
            editorPoint(editor, originalEndBlock[1], { edge: 'start' }),
            end
          )
        )
      );
    })();
  const originalEndAtEffectiveEndStart =
    !!initialAt &&
    LocationApi.isRange(initialAt) &&
    !RangeApi.isCollapsed(initialAt) &&
    !!effectiveEndBlock &&
    (() => {
      const [, originalEnd] = RangeApi.edges(initialAt);

      return PointApi.equals(
        matchPointRootVisibility(originalEnd, end),
        matchPointRootVisibility(
          editorPoint(editor, effectiveEndBlock[1], { edge: 'start' }),
          end
        )
      );
    })();
  const startLineBlock = lowestBlock(start);
  const preserveEmptyStartBlockPath =
    shouldPreserveEmptyStartBlockForHangingRange(
      editor,
      start,
      isSingleText,
      isAcrossBlocks,
      preserveEndBlock,
      originalHangingBlockRange,
      startLineBlock
    );
  const preservedEmptyStartBlock =
    preserveEmptyStartBlockPath &&
    startLineBlock &&
    canReplaceChildrenWithText(getEditorSchema(editor), startLineBlock[0])
      ? ({
          ...startLineBlock[0],
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
    originalEndAtEffectiveEndStart,
    startNonEditable,
    endNonEditable,
    preserveEndBlock,
    preserveInlineEdge,
    preserveEmptyStartBlockPath,
    preservedEmptyStartBlock,
    startJoinBlockPath:
      isAcrossBlocks && (!isCollapsed || !reverse)
        ? (lowestBlock(start)?.[1] ?? null)
        : null,
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
  const cleanupRange = (excludePreservedEnd = false) =>
    getTopLevelCleanupRange(editor, plan, excludePreservedEnd);
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
    const emptyForwardStartBlock = readForwardDeletedEmptyBlock(editor, plan);

    if (plan.preserveEmptyStartBlockPath) {
      const preservesNestedLaterLine =
        plan.originalEndAtEffectiveEndStart &&
        plan.effectiveStartBlockPath != null &&
        plan.preserveEmptyStartBlockPath
          .slice(plan.effectiveStartBlockPath.length)
          .some((index) => index > 0);

      removeEmptyStructuralArtifacts(
        editor,
        plan.preserveEmptyStartBlockPath,
        null,
        cleanupRange(preservesNestedLaterLine)
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
        at: mergePoint,
        voids: plan.voids,
      });
      removeEmptyStructuralArtifacts(
        editor,
        plan.preserveEmptyStartBlockPath,
        null,
        cleanupRange()
      );
      mergeAdjacentTextRuns(editor, touchedRange);
    } else if (emptyForwardStartBlock) {
      removeNodes(editor, {
        at: emptyForwardStartBlock,
        voids: plan.voids,
      });
      if (emptyForwardStartBlock.length === 1) {
        removeEmptyStructuralArtifacts(
          editor,
          plan.preserveEmptyStartBlockPath,
          null,
          cleanupRange()
        );
      }
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

  maybeMergeAdjacentTextAt(editor, removal.endAnchor.resolve()?.path);

  return keptIncompatibleBlockBoundary;
};

const releaseCollapsePoint = (
  editor: Editor,
  plan: DeleteRangePlan,
  removal: ReturnType<typeof removeDeleteContents>,
  keptIncompatibleBlockBoundary: boolean
) => {
  const startPoint = removal.startAnchor.release();
  const endPoint = removal.endAnchor.release();
  const startBlockDropped = removal.startBlockAnchor?.release() === null;
  // A forward join merges away the empty text after a trailing inline void,
  // so the start anchor falls back into the void.
  const forwardStartInInlineVoid =
    !plan.reverse &&
    plan.isCollapsed &&
    plan.isAcrossBlocks &&
    startPoint != null &&
    isInlineVoid(
      editor,
      getCurrentNode(editor, PathApi.parent(startPoint.path))
    );
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
      : forwardStartInInlineVoid
        ? (endPoint ?? startPoint)
        : (startPoint ?? endPoint);

  return startBlockDropped
    ? (endPoint ?? startPoint)
    : !plan.isCollapsed && editorHasPath(editor, plan.start.path)
      ? { path: [...plan.start.path], offset: plan.start.offset }
      : reverseMergePoint;
};

const readFinalPointOptions = (
  plan: DeleteRangePlan,
  removedContent: boolean
) => ({
  reverse: plan.reverse,
  allowForwardBoundaryJump:
    (plan.initialAt != null && LocationApi.isPoint(plan.initialAt)) ||
    (plan.initialAt != null &&
      LocationApi.isRange(plan.initialAt) &&
      RangeApi.isCollapsed(plan.initialAt)),
  removedContent,
});

const resolveDeletePoint = (
  editor: Editor,
  plan: DeleteRangePlan,
  collapseTarget: Point | null,
  removedContent: boolean
) => {
  let point = normalizeFinalDeletePoint(
    editor,
    collapseTarget,
    readFinalPointOptions(plan, removedContent)
  );

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
  collapseTarget: Point | null,
  tx: TransactionWriter,
  removedContent: boolean
) => {
  const point = resolveDeletePoint(
    editor,
    plan,
    collapseTarget,
    removedContent
  );

  if ((!plan.initialAt || !LocationApi.isPath(plan.initialAt)) && point) {
    tx.setSelection(
      SelectionApi.text({
        anchor: point,
        focus: point,
      })
    );
  }

  const finalSelection = getSelectionInUpdateRoot(editor);

  if (
    finalSelection &&
    RangeApi.isRange(finalSelection) &&
    RangeApi.isCollapsed(finalSelection)
  ) {
    let normalizedSelectionPoint = normalizeFinalDeletePoint(
      editor,
      finalSelection.anchor,
      readFinalPointOptions(plan, removedContent)
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
  options: {
    reverse: boolean;
    allowForwardBoundaryJump: boolean;
    removedContent: boolean;
  }
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

        if (isInlineVoid(editor, nextSibling)) {
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
              (options.removedContent &&
                !getEditorSchema(editor).isInline(parent)) ||
              (!getEditorSchema(editor).isVoid(parent) &&
                NodeApi.string(parent) === '')
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

const besideAtom = (editor: Editor, atom: Path, reverse: boolean) =>
  editorPoint(editor, reverse ? PathApi.previous(atom) : PathApi.next(atom), {
    edge: reverse ? 'end' : 'start',
  });

const blockOf = (editor: Editor, point: Point) =>
  editorAbove(editor, {
    at: point,
    match: (node) => NodeApi.isElement(node) && editorIsBlock(editor, node),
    mode: 'lowest',
    voids: true,
  })?.[1];

const reachAtomPastSpace = (
  editor: Editor,
  from: Point,
  reach: Point,
  limit: Point,
  reverse: boolean
) => {
  if (editorString(editor, { anchor: from, focus: reach }).trim() !== '') {
    return reach;
  }

  for (const point of editorPositions(editor, {
    at: { anchor: from, focus: limit },
    reverse,
    unit: 'offset',
  })) {
    const atom = getHighestNonEditable(editor, point);

    if (atom) {
      return getEditorSchema(editor).isInline(atom[0]) ? point : reach;
    }
    if (editorString(editor, { anchor: from, focus: point }).trim() !== '') {
      return reach;
    }
  }

  return reach;
};

type CollapsedTarget =
  | Readonly<{ kind: 'path'; path: Path }>
  | Readonly<{ kind: 'point'; point: Point }>;

const containsIsolatingDescendant = (
  editor: Editor,
  node: EditorElement,
  path: Path,
  voids: boolean
): boolean => {
  const schema = getEditorSchema(editor);

  for (let index = 0; index < node.children.length; index += 1) {
    const child = node.children[index];

    if (!NodeApi.isElement(child)) continue;

    const childPath = [...path, index];

    if (
      schema.isIsolating(child) ||
      isReadOnlyGridPart(editor, child, childPath, voids) ||
      containsIsolatingDescendant(editor, child, childPath, voids)
    ) {
      return true;
    }
  }

  return false;
};

const scanCollapseTarget = (
  editor: Editor,
  from: Point,
  reach: Point,
  options: {
    reverse: boolean;
    stopAtInlineAtom: boolean;
    takeWhitespaceBeforeInlineAtom: boolean;
    voids: boolean;
  }
): CollapsedTarget | null => {
  const { reverse, stopAtInlineAtom, takeWhitespaceBeforeInlineAtom, voids } =
    options;
  const normalizedReach = matchPointRootVisibility(reach, from);

  if (
    PathApi.equals(from.path, normalizedReach.path) &&
    !PointApi.equals(from, normalizedReach)
  ) {
    const [leaf] = editorLeaf(editor, from);

    if (
      reverse
        ? normalizedReach.offset > 0
        : normalizedReach.offset < leaf.text.length
    ) {
      return null;
    }
  }

  const schema = getEditorSchema(editor);
  const scopePath = getClosestIsolatingAncestor(editor, from, voids)?.[1] ?? [];
  const scopeTextEdge = matchPointRootVisibility(
    editorPoint(editor, scopePath, { edge: reverse ? 'start' : 'end' }),
    from
  );
  const atScopeTextEdge = PointApi.equals(normalizedReach, scopeTextEdge);

  if (PathApi.equals(from.path, normalizedReach.path) && !atScopeTextEdge) {
    return null;
  }

  const limitPath = atScopeTextEdge
    ? ((reverse
        ? editorFirst(editor, scopePath)
        : editorLast(editor, scopePath))?.[1] ?? normalizedReach.path)
    : normalizedReach.path;
  const fromBlock = blockOf(editor, from);
  const rootChildren = getChildList(editor);

  let sawContent = false;
  let sawOtherBlock = false;
  let lastTextPoint: Point = from;
  let firstSkipped: {
    nearBefore: Point;
    path: Path;
    sawContentBefore: boolean;
    sawOtherBlockBefore: boolean;
  } | null = null;

  const stopAtSkipped = (): CollapsedTarget | null => {
    if (!firstSkipped) return null;

    return !firstSkipped.sawContentBefore && !firstSkipped.sawOtherBlockBefore
      ? { kind: 'path', path: firstSkipped.path }
      : { kind: 'point', point: firstSkipped.nearBefore };
  };

  const isBeforeFrom = (path: Path) =>
    !PathApi.isAncestor(path, from.path) &&
    !PathApi.equals(path, from.path) &&
    (reverse
      ? PathApi.isAfter(path, from.path)
      : PathApi.isBefore(path, from.path));

  const isAfterLimit = (path: Path) =>
    !PathApi.isAncestor(path, limitPath) &&
    !PathApi.equals(path, limitPath) &&
    (reverse
      ? PathApi.isBefore(path, limitPath)
      : PathApi.isAfter(path, limitPath));

  const visitChildren = (
    length: number,
    getChild: (index: number) => Node | undefined,
    parentPath: Path
  ): CollapsedTarget | 'stop' | null => {
    const onOriginSpine =
      parentPath.length === 0 || PathApi.isAncestor(parentPath, from.path);
    const startIndex = onOriginSpine
      ? getDefined(from.path[parentPath.length])
      : reverse
        ? length - 1
        : 0;
    const step = reverse ? -1 : 1;

    for (
      let index = startIndex;
      reverse ? index >= 0 : index < length;
      index += step
    ) {
      const result = visit(getDefined(getChild(index)), [...parentPath, index]);

      if (result) return result;
    }

    return null;
  };

  const visit = (node: Node, path: Path): CollapsedTarget | 'stop' | null => {
    if (path.length === 0) {
      return visitChildren(
        rootChildren.length,
        (index) => rootChildren.at(index),
        path
      );
    }
    if (isBeforeFrom(path)) return null;
    if (isAfterLimit(path)) return 'stop';

    if (PathApi.isAncestor(path, from.path)) {
      return NodeApi.isElement(node)
        ? visitChildren(
            node.children.length,
            (index) => node.children[index],
            path
          )
        : null;
    }

    if (PathApi.equals(path, from.path)) {
      if (TextApi.isText(node)) {
        const endOffset = PathApi.equals(path, normalizedReach.path)
          ? normalizedReach.offset
          : reverse
            ? 0
            : node.text.length;

        if (endOffset !== from.offset) {
          sawContent = true;
          lastTextPoint = matchPointRootVisibility(
            { offset: endOffset, path },
            from
          );
        }
      }

      return null;
    }

    if (
      NodeApi.isElement(node) &&
      (isReadOnlyGridPart(editor, node, path, voids) ||
        (schema.isIsolating(node) &&
          (voids || isEditablePath(editor, path, { voids }))))
    ) {
      return stopAtSkipped() ?? { kind: 'point', point: lastTextPoint };
    }

    if (!voids && NodeApi.isElement(node) && isNonEditable(schema, node)) {
      const skippedTarget = stopAtSkipped();

      if (skippedTarget) return skippedTarget;

      if (schema.isInline(node)) {
        if (!stopAtInlineAtom) {
          sawContent = true;
          return null;
        }
        if (sawOtherBlock) {
          return { kind: 'point', point: lastTextPoint };
        }

        const between = editorString(editor, {
          anchor: from,
          focus: lastTextPoint,
        });

        if (between === '') {
          const edge = readTextEdge(editor, path, reverse ? 'end' : 'start');

          return edge
            ? { kind: 'point', point: matchPointRootVisibility(edge, from) }
            : { kind: 'path', path };
        }

        if (takeWhitespaceBeforeInlineAtom && between.trim() === '') {
          return {
            kind: 'point',
            point: matchPointRootVisibility(
              besideAtom(editor, path, reverse),
              from
            ),
          };
        }

        return { kind: 'point', point: lastTextPoint };
      }

      return !sawContent && !sawOtherBlock
        ? { kind: 'path', path }
        : { kind: 'point', point: lastTextPoint };
    }

    if (
      !voids &&
      NodeApi.isElement(node) &&
      isSkippedElement(editor, node, path, 'content', from)
    ) {
      if (containsIsolatingDescendant(editor, node, path, voids)) {
        return stopAtSkipped() ?? { kind: 'point', point: lastTextPoint };
      }
      if (!firstSkipped) {
        firstSkipped = {
          nearBefore: lastTextPoint,
          path,
          sawContentBefore: sawContent,
          sawOtherBlockBefore: sawOtherBlock,
        };
      }

      return null;
    }

    if (TextApi.isText(node)) {
      firstSkipped = null;

      const textBlock = blockOf(editor, { offset: 0, path });

      if (!fromBlock || !textBlock || !PathApi.equals(fromBlock, textBlock)) {
        sawOtherBlock = true;
      }

      if (PathApi.equals(path, normalizedReach.path)) {
        const startOffset = reverse ? node.text.length : 0;

        if (normalizedReach.offset !== startOffset) sawContent = true;

        lastTextPoint = normalizedReach;
      } else {
        if (node.text.length > 0) sawContent = true;

        lastTextPoint = matchPointRootVisibility(
          editorPoint(editor, path, { edge: reverse ? 'start' : 'end' }),
          from
        );
      }

      return null;
    }

    return NodeApi.isElement(node)
      ? visitChildren(
          node.children.length,
          (index) => node.children[index],
          path
        )
      : null;
  };

  const result = visit(editor, []);

  if (result && result !== 'stop') return result;

  return stopAtSkipped();
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
): CollapsedTarget => {
  const { reverse, distance, unit, voids } = options;
  const pointResult = (point: Point): CollapsedTarget => ({
    kind: 'point',
    point: matchPointRootVisibility(point, at),
  });

  if (distance <= 0) {
    return pointResult(at);
  }

  const clamp = (from: Point, target: Point) =>
    matchPointRootVisibility(
      clampToIsolationScope(editor, from, target, reverse, voids),
      at
    );
  const reachFrom = (from: Point, steps: number) =>
    clamp(
      from,
      reverse
        ? (contentBefore(editor, from, { distance: steps, unit, voids }) ??
            editorPoint(editor, [], { edge: 'start' }))
        : (contentAfter(editor, from, { distance: steps, unit, voids }) ??
            editorPoint(editor, [], { edge: 'end' }))
    );

  if (unit === 'word' && !voids) {
    let from = at;

    for (let step = 0; step < distance; step += 1) {
      const block = blockOf(editor, from);
      const reach = block
        ? reachAtomPastSpace(
            editor,
            from,
            reachFrom(from, 1),
            clamp(
              from,
              editorPoint(editor, block, { edge: reverse ? 'start' : 'end' })
            ),
            reverse
          )
        : reachFrom(from, 1);
      const scanned = scanCollapseTarget(editor, from, reach, {
        reverse,
        stopAtInlineAtom: true,
        takeWhitespaceBeforeInlineAtom: true,
        voids,
      });

      if (scanned?.kind === 'path') {
        return step === 0 ? scanned : pointResult(from);
      }

      const stop = scanned ? scanned.point : reach;
      const atom = getHighestNonEditable(editor, stop);

      if (!atom) {
        if (PointApi.equals(stop, from)) break;

        from = stop;
      } else if (distance > 1 && getEditorSchema(editor).isInline(atom[0])) {
        from = besideAtom(editor, atom[1], reverse);
      } else {
        return pointResult(step === 0 ? stop : from);
      }
    }

    return pointResult(from);
  }

  let pointTarget = reachFrom(at, distance);
  const scanned = scanCollapseTarget(editor, at, pointTarget, {
    reverse,
    stopAtInlineAtom: unit === 'character' && distance === 1,
    takeWhitespaceBeforeInlineAtom: false,
    voids,
  });

  if (scanned?.kind === 'path') {
    return scanned;
  }
  if (scanned) {
    pointTarget = matchPointRootVisibility(scanned.point, at);
  }

  if (unit !== 'character' || distance !== 1) {
    return pointResult(pointTarget);
  }

  const [leaf] = editorLeaf(editor, at);
  const atBoundary = reverse ? at.offset === 0 : at.offset === leaf.text.length;

  if (!atBoundary) {
    return pointResult(pointTarget);
  }

  const offsetTarget = reverse
    ? contentBefore(editor, at, { distance, unit: 'offset', voids })
    : contentAfter(editor, at, { distance, unit: 'offset', voids });

  if (!offsetTarget) {
    return pointResult(pointTarget);
  }

  const normalizedOffsetTarget = matchPointRootVisibility(offsetTarget, at);

  if (PointApi.equals(pointTarget, at)) {
    return pointResult(at);
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
      const target = contentBefore(editor, pointTarget, {
        distance: 1,
        unit: 'character',
        voids,
      });

      return pointResult(target ?? pointTarget);
    }

    if (!reverse && pointTarget.offset === 0) {
      const target = contentAfter(editor, pointTarget, {
        distance: 1,
        unit: 'character',
        voids,
      });

      return pointResult(target ?? pointTarget);
    }
  }

  if (
    currentBlock &&
    targetBlock &&
    ((reverse &&
      PointApi.equals(
        at,
        matchPointRootVisibility(
          editorPoint(editor, currentBlock[1], { edge: 'start' }),
          at
        )
      )) ||
      (!reverse &&
        PointApi.equals(
          at,
          matchPointRootVisibility(
            editorPoint(editor, currentBlock[1], { edge: 'end' }),
            at
          )
        ))) &&
    !PathApi.equals(currentBlock[1], targetBlock[1])
  ) {
    return pointResult(normalizedOffsetTarget);
  }

  return pointResult(pointTarget);
};

const oneTextLineEndAt = (
  editor: Editor,
  point: Point,
  voids: boolean
): { block: Path; offset: number } | null => {
  const block = editorAbove(editor, {
    at: point,
    match: (node): node is EditorElement =>
      NodeApi.isElement(node) && editorIsBlock(editor, node),
    mode: 'lowest',
    voids,
  });
  const [text] = block?.[0].children ?? [];

  if (
    !block ||
    block[0].children.length !== 1 ||
    !TextApi.isText(text) ||
    typeof block[0].type !== 'string' ||
    !holdsOneText(getEditorSchema(editor), block[0].type)
  ) {
    return null;
  }

  const offset = text.text.indexOf('\n', point.offset);

  return offset === -1 ? null : { block: block[1], offset };
};

const splitOffLinesAfter = (
  editor: Editor,
  { block, offset }: { block: Path; offset: number }
) => {
  splitNodesKeepingType(editor, {
    always: true,
    at: { offset, path: [...block, 0] },
    match: (_node, path) => PathApi.equals(path, block),
  });
  applyBuiltDocumentChange(editor, (builder, root) =>
    builder.removeText(root, [...PathApi.next(block), 0], 0, '\n')
  );
};

const mergeRemovesBlockBefore = (editor: Editor, block: Path) => {
  if (!PathApi.hasPrevious(block)) return false;

  const previousPath = PathApi.previous(block);
  const canRemoveBlockBefore = getEditorSchema(editor).canPlaceAtPath(
    previousPath,
    [],
    {
      removing: [getDefined(previousPath.at(-1))],
      root: getActiveUpdateRoot(editor) ?? 'main',
    }
  );

  return (
    canRemoveBlockBefore &&
    editorShouldMergeNodesRemovePrevNode(
      editor,
      [NodeApi.get(editor, previousPath), previousPath],
      [NodeApi.get(editor, block), block]
    )
  );
};

const mergeBlocksAtPoint = (editor: Editor, point: Point, voids: boolean) => {
  const reachedLineEnd = oneTextLineEndAt(editor, point, voids);
  const splitLineEnd =
    reachedLineEnd && !mergeRemovesBlockBefore(editor, reachedLineEnd.block)
      ? reachedLineEnd
      : null;

  if (splitLineEnd?.offset === point.offset) {
    applyBuiltDocumentChange(editor, (builder, root) =>
      builder.removeText(
        root,
        [...splitLineEnd.block, 0],
        splitLineEnd.offset,
        '\n'
      )
    );
    return;
  }
  if (splitLineEnd) splitOffLinesAfter(editor, splitLineEnd);
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
      releaseCollapsePoint(
        editor,
        target,
        removal,
        keptIncompatibleBlockBoundary
      ),
      removal.removedContent
    ) ?? null
  );
};

export type PreparedRemoval = Readonly<{
  options: DeleteOptions;
  wholeBlocks: WholeTopLevelBlockRange | null;
}> &
  (
    | Readonly<{ kind: 'ordinary'; target: DeletePathTarget | DeleteRangePlan }>
    | Readonly<{
        kind: 'grid';
        plan: GridRemovalPlan;
        target: DeleteRangePlan;
      }>
  );

export type RemovalOutcome =
  | Readonly<{ kind: 'ordinary'; landing: Point | null }>
  | Readonly<{ keepsGrid: boolean; kind: 'grid'; landing: Point | null }>;

type RemovalSite = Readonly<{
  at: Location;
  root: string | undefined;
  selectionInOtherRoot: boolean;
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
        const targetRoot = root ?? getEditorUpdateRoot(editor);
        const selectionInOtherRoot =
          at !== undefined &&
          selection !== null &&
          (SelectionApi.root(selection) ?? getCurrentSelectionRoot(editor)) !==
            targetRoot;
        const site: RemovalSite = {
          at: root ? stripLocationRoots(resolved) : resolved,
          root,
          selectionInOtherRoot,
          writesSelection:
            at === undefined ||
            (!selectionInOtherRoot &&
              selection !== null &&
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

export const refuseMemberCrossing = (editor: Editor, at: Location) => {
  if (LocationApi.isRange(at)) {
    refuseCrossing(getSetSite(editor), at, getEditorUpdateRoot(editor));
  }
};

export const refuseMemberCrossingNodes = (
  editor: Editor,
  at: Location | NodeSelection | Span,
  nodes: readonly NodeEntry[]
) => {
  const range = LocationApi.isSpan(at)
    ? {
        anchor: { offset: 0, path: at[0] },
        focus: { offset: 0, path: at[1] },
      }
    : at;

  if (
    RangeApi.isRange(range) &&
    nodes.some(
      ([node]) => !NodeApi.isElement(node) || !editorIsBlock(editor, node)
    )
  ) {
    refuseMemberCrossing(editor, range);
  }
};

const refuseUnhungInStruck = (
  editor: Editor,
  at: Location,
  prepared: PreparedRemoval | null
) => {
  if (
    RangeApi.isRange(at) &&
    RangeApi.isExpanded(at) &&
    prepared?.target.kind === 'range'
  ) {
    refuseTextWriteInStruck(
      editor,
      prepared.target.effectiveRange,
      getChildList(editor)
    );
  }
};

const prepareAt = (
  editor: Editor,
  options: DeleteOptions,
  at: Location,
  writes: boolean
): PreparedRemoval | null => {
  refuseMemberCrossing(editor, at);
  const target = profileCoreDuration('delete-resolve-target', () =>
    resolveDeleteTarget(editor, options, at)
  );

  if (!target) return null;
  if (target.kind === 'range') {
    refuseMemberCrossing(editor, target.effectiveRange);
  }
  if (!spansTexts(target)) {
    return { kind: 'ordinary', options, target, wholeBlocks: null };
  }

  const plan = profileCoreDuration('delete-grid-plan', () =>
    planGridRemoval(editor, target.effectiveRange)
  );
  const shortcut = plan?.keepsGrid
    ? null
    : profileCoreDuration('delete-whole-range-plan', () =>
        getWholeTopLevelBlockRange(editor, target)
      );
  const wholeBlocks =
    writes && shortcut && !isWritablePoint(editor, shortcut.landing)
      ? null
      : shortcut;

  if (!plan) return { kind: 'ordinary', options, target, wholeBlocks };
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
  const writesSelection = site.selectionInOtherRoot
    ? false
    : site.writesSelection || target.kind === 'path' || !target.isSingleText;

  if (target.kind === 'path') {
    deletePathTarget(editor, target, tx, writesSelection);

    return { kind: 'ordinary', landing: null };
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
  const { wholeBlocks } = prepared;

  if (wholeBlocks) {
    const caret = deleteWholeTopLevelBlockRange(
      editor,
      wholeBlocks,
      writesSelection
    );

    setDeletedMarks();

    const landing = withRoot(caret);

    return prepared.kind === 'grid'
      ? { keepsGrid: false, kind: 'grid', landing }
      : { kind: 'ordinary', landing };
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

  const landing = releaseCollapsePoint(
    editor,
    target,
    removal,
    keptIncompatibleBlockBoundary
  );

  if (writesSelection) {
    resolveDeleteSelection(editor, target, landing, tx, removal.removedContent);
  }
  setDeletedMarks();

  return { kind: 'ordinary', landing: landing && withRoot(landing) };
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

    if (options.writes) refuseUnhungInStruck(editor, site.at, prepared);

    return prepared && applyAt(editor, tx, site, prepared);
  });

/**
 * Reads each path where a write at `at` lands once its range is removed,
 * before anything changes: the caret, a grid removal's landing, the landing
 * of whole top-level blocks, or an ordinary range's edges. An emptied root
 * has no landing path yet, and `null` means nothing can take the write. A
 * slice write removes only a grid before it fits, so with `slice` any other
 * range lands at its start.
 */
export const readRemovalLanding = <T>(
  editor: Editor,
  at: Point | Range,
  read: (path: Path) => T,
  { slice = false }: { slice?: boolean } = {}
): readonly T[] | null => {
  const root = getLocationRoot(at);

  return inRoot(editor, root, () => {
    const local = root ? stripLocationRoots(at) : at;

    if (LocationApi.isPoint(local)) return [read(local.path)];
    if (RangeApi.isCollapsed(local)) return [read(local.anchor.path)];

    const prepared = prepareAt(editor, { at: local }, local, true);

    if (!prepared) return null;
    if (prepared.kind === 'ordinary' && slice) {
      return [read(RangeApi.start(local).path)];
    }
    if (prepared.wholeBlocks) return [read(prepared.wholeBlocks.landing.path)];
    if (prepared.kind === 'ordinary') {
      return RangeApi.edges(local).map((edge) => read(edge.path));
    }

    const { landing } = prepared.plan;

    if (landing?.kind === 'point') return [read(landing.at.path)];
    if (landing?.kind === 'cell') return [read(landing.at)];

    return [];
  });
};

/**
 * The range a move of `range` removes, or null when the removal cannot take
 * it exactly, such as a range across two members of a set root. A move then
 * refuses before it runs; a copy removes nothing and lands.
 */
export const resolveDeletedRange = (
  editor: Editor,
  range: Range
): Range | null => {
  const site = getSetSite(editor);
  const root = getLocationRoot(range) ?? getEditorUpdateRoot(editor);

  if (crossesMembers(site, range, root)) return null;
  const target = resolveDeleteTarget(editor, {}, range);

  if (target?.kind !== 'range') return range;
  if (crossesMembers(site, target.effectiveRange, root)) return null;
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
  inRemovalRoot(editor, options.at, (tx, site) => {
    if (
      !options.voids &&
      !LocationApi.isPath(site.at) &&
      (hasEdgeInReadOnlyInline(editor, site.at) ||
        (RangeApi.isRange(site.at) &&
          RangeApi.isExpanded(site.at) &&
          refusesReadOnlyWrite(editor, site.at)))
    ) {
      return null;
    }
    if (RangeApi.isRange(site.at) && RangeApi.isExpanded(site.at)) {
      refuseTextWriteInStruck(editor, site.at, getChildList(editor));
    }

    const prepared = prepareAt(editor, options, site.at, false);

    refuseUnhungInStruck(editor, site.at, prepared);

    if (prepared) return applyAt(editor, tx, site, prepared);

    const caret = LocationApi.isPoint(site.at)
      ? site.at
      : RangeApi.isRange(site.at) && RangeApi.isCollapsed(site.at)
        ? site.at.anchor
        : null;
    const besideGrid =
      caret &&
      options.reverse &&
      options.at === undefined &&
      (options.distance ?? 1) > 0
        ? getGridBesideBlockEdge(editor, caret, true, !!options.voids)
        : null;

    if (besideGrid) {
      tx.setSelection(
        SelectionApi.text({
          anchor: besideGrid.landing,
          focus: besideGrid.landing,
        })
      );
    }

    return null;
  });
};
