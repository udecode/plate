import { getEditorSchema } from '../core/editor-runtime';
import { nodes as getNodes } from '../editor/nodes';
import {
  type Descendant,
  NodeApi,
  type Path,
  PathApi,
  type Point,
  PointApi,
  RangeApi,
} from '../interfaces';
import {
  after as editorAfter,
  getChildren as editorGetChildren,
  hasPath as editorHasPath,
  leaf as editorLeaf,
  pathRef as editorPathRef,
  point as editorPoint,
  pointRef as editorPointRef,
} from '../interfaces/editor';
import type { Editor } from '../interfaces/editor';
import {
  type DeletePathTarget,
  type DeleteRangePlan,
  getCurrentNode,
  getLivePoint,
  type TransactionWriter,
} from './delete-text-plan';
import { maybeMergeAdjacentTextAt } from './delete-text-structural-cleanup';

const resolveRemovalEndPoint = (
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
    return editorGetChildren(editor).length > 0
      ? editorPoint(editor, [], { edge: 'start' })
      : null;
  }

  const nextPoint = editorAfter(editor, liveStartPoint, {
    distance: 1,
    unit: 'offset',
    voids: true,
  });

  if (nextPoint) {
    return nextPoint;
  }

  if (!plan.isAcrossBlocks) {
    return liveStartPoint;
  }

  return null;
};

export const deletePathTarget = (
  editor: Editor,
  target: DeletePathTarget,
  tx: TransactionWriter
) => {
  const fallbackRef = target.fallbackPoint
    ? editorPointRef(editor, target.fallbackPoint)
    : null;

  tx.apply({
    type: 'remove_node',
    path: target.path,
    node: getCurrentNode(editor, target.path) as Descendant,
  });

  if (editorHasPath(editor, target.path)) {
    maybeMergeAdjacentTextAt(editor, target.path);
  }

  const fallbackPoint = fallbackRef?.unref();

  if (fallbackPoint) {
    tx.setSelection({
      anchor: fallbackPoint,
      focus: fallbackPoint,
    });
  }
};

const collectDeleteMatchPaths = (editor: Editor, plan: DeleteRangePlan) => {
  const matches: Path[] = [];
  let lastPath: Path | undefined;
  const addMatch = (path: Path) => {
    if (!matches.some((match) => PathApi.equals(match, path))) {
      matches.push(path);
    }
    lastPath = path;
  };
  const maybeAddFullySelectedInline = (path: Path) => {
    if (!editorHasPath(editor, path)) {
      return;
    }

    const node = getCurrentNode(editor, path);

    if (!NodeApi.isElement(node) || !getEditorSchema(editor).isInline(node)) {
      return;
    }

    const inlineStart = editorPoint(editor, path, { edge: 'start' });
    const inlineEnd = editorPoint(editor, path, { edge: 'end' });
    const [rangeStart, rangeEnd] = RangeApi.edges(plan.effectiveRange);

    if (
      PointApi.compare(rangeStart, inlineStart) <= 0 &&
      PointApi.compare(rangeEnd, inlineEnd) >= 0 &&
      (PointApi.compare(rangeStart, inlineStart) < 0 ||
        PointApi.compare(rangeEnd, inlineEnd) > 0)
    ) {
      addMatch(path);
    }
  };

  for (const [node, path] of getNodes(editor, {
    at: plan.effectiveRange,
    voids: plan.voids,
  })) {
    if (lastPath && PathApi.compare(path, lastPath) === 0) {
      continue;
    }

    if (
      plan.preserveEndBlock &&
      plan.effectiveEndBlockPath &&
      PathApi.isAncestor(plan.effectiveEndBlockPath, path)
    ) {
      lastPath = path;
      continue;
    }

    if (NodeApi.isElement(node) && getEditorSchema(editor).isInline(node)) {
      const inlineStart = editorPoint(editor, path, { edge: 'start' });
      const inlineEnd = editorPoint(editor, path, { edge: 'end' });
      const [rangeStart, rangeEnd] = RangeApi.edges(plan.effectiveRange);

      if (
        PointApi.compare(rangeStart, inlineStart) <= 0 &&
        PointApi.compare(rangeEnd, inlineEnd) >= 0 &&
        (PointApi.compare(rangeStart, inlineStart) < 0 ||
          PointApi.compare(rangeEnd, inlineEnd) > 0)
      ) {
        addMatch(path);
        continue;
      }
    }

    if (
      !PathApi.isCommon(path, plan.start.path) &&
      !PathApi.isCommon(path, plan.end.path)
    ) {
      addMatch(path);
      continue;
    }

    if (
      !plan.voids &&
      NodeApi.isElement(node) &&
      (getEditorSchema(editor).isVoid(node) ||
        getEditorSchema(editor).isReadOnly(node))
    ) {
      addMatch(path);
    }
  }

  for (const point of [plan.start, plan.end]) {
    for (let depth = point.path.length - 1; depth > 0; depth -= 1) {
      maybeAddFullySelectedInline(point.path.slice(0, depth) as Path);
    }
  }

  return matches;
};

export const removeDeleteContents = (
  editor: Editor,
  plan: DeleteRangePlan,
  tx: TransactionWriter
) => {
  const deleteMatchPaths = collectDeleteMatchPaths(editor, plan);
  const skipStartText = deleteMatchPaths.some((path) =>
    PathApi.isCommon(path, plan.start.path)
  );
  const skipEndText = deleteMatchPaths.some((path) =>
    PathApi.isCommon(path, plan.end.path)
  );
  const pathRefs = deleteMatchPaths.map((path) => editorPathRef(editor, path));
  const startRef = editorPointRef(editor, plan.start);
  const endRef = editorPointRef(editor, plan.end);
  let removedText = '';

  if (!plan.isSingleText && !plan.startNonEditable && !skipStartText) {
    const point = startRef.current!;
    const [node] = editorLeaf(editor, point);
    const text = node.text.slice(plan.start.offset);

    if (text.length > 0) {
      tx.apply({
        type: 'remove_text',
        path: point.path,
        offset: plan.start.offset,
        text,
      });
      removedText = text;
    }
  }

  pathRefs
    .slice()
    .reverse()
    .map((ref) => ref.unref())
    .filter((path): path is Path => path !== null)
    .forEach((path) => {
      tx.apply({
        type: 'remove_node',
        path,
        node: getCurrentNode(editor, path) as Descendant,
      });
    });

  if (!plan.endNonEditable && !plan.preserveEndBlock && !skipEndText) {
    const point =
      resolveRemovalEndPoint(editor, plan, startRef.current, endRef.current) ??
      getLivePoint(editor, startRef.current);

    if (!point) {
      throw new Error('deleteAt could not resolve a surviving end point');
    }

    const [node] = editorLeaf(editor, point);
    const offset = plan.isSingleText ? plan.start.offset : 0;
    const text = node.text.slice(offset, plan.end.offset);

    if (text.length > 0) {
      tx.apply({
        type: 'remove_text',
        path: point.path,
        offset,
        text,
      });
      removedText = text;
    }
  }

  return {
    startRef,
    endRef,
    removedText,
  };
};
