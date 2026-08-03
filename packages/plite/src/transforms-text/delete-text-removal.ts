import { getEditorSchema } from '../core/editor-runtime';
import { applyBuiltDocumentChange } from '../core/public-state';
import { nodes as getNodes } from '../editor/nodes';
import {
  NodeApi,
  type Path,
  PathApi,
  type Point,
  PointApi,
  RangeApi,
  SelectionApi,
} from '../interfaces';
import {
  after as editorAfter,
  getChildren as editorGetChildren,
  hasPath as editorHasPath,
  leaf as editorLeaf,
  point as editorPoint,
} from '../interfaces/editor';
import type { AnyEditor as Editor } from '../interfaces/editor';
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
  tx: TransactionWriter,
  select: boolean
) => {
  const fallbackAnchor = target.fallbackPoint
    ? editor.anchor(target.fallbackPoint, {
        association: 'backward',
        deletion: 'nearest',
      })
    : null;

  applyBuiltDocumentChange(editor, (builder, root) =>
    builder.removeNode(root, target.path)
  );

  if (editorHasPath(editor, target.path)) {
    maybeMergeAdjacentTextAt(editor, target.path);
  }

  const fallbackPoint = fallbackAnchor?.release();

  if (select && fallbackPoint) {
    tx.setSelection(
      SelectionApi.text({
        anchor: fallbackPoint,
        focus: fallbackPoint,
      })
    );
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

export const removeDeleteContents = (editor: Editor, plan: DeleteRangePlan) => {
  const deleteMatchPaths = collectDeleteMatchPaths(editor, plan);
  const skipStartText = deleteMatchPaths.some((path) =>
    PathApi.isCommon(path, plan.start.path)
  );
  const skipEndText = deleteMatchPaths.some((path) =>
    PathApi.isCommon(path, plan.end.path)
  );
  const pathAnchors = deleteMatchPaths.map((path) =>
    editor.anchor(path, {
      association: 'forward',
      deletion: 'drop',
    })
  );
  const startAnchor = editor.anchor(plan.start, {
    association: 'backward',
    deletion: 'nearest',
  });
  const endAnchor = editor.anchor(plan.end, {
    association: 'forward',
    deletion: 'nearest',
  });
  let removedText = '';

  if (!plan.isSingleText && !plan.startNonEditable && !skipStartText) {
    const point = startAnchor.resolve()!;
    const [node] = editorLeaf(editor, point);
    const text = node.text.slice(plan.start.offset);

    if (text.length > 0) {
      applyBuiltDocumentChange(editor, (builder, root) =>
        builder.removeText(root, point.path, plan.start.offset, text)
      );
      removedText = text;
    }
  }

  pathAnchors
    .slice()
    .reverse()
    .map((anchor) => anchor.release())
    .filter((path): path is Path => path !== null)
    .forEach((path) => {
      applyBuiltDocumentChange(editor, (builder, root) =>
        builder.removeNode(root, path)
      );
    });

  if (!plan.endNonEditable && !plan.preserveEndBlock && !skipEndText) {
    const point =
      resolveRemovalEndPoint(
        editor,
        plan,
        startAnchor.resolve(),
        endAnchor.resolve()
      ) ?? getLivePoint(editor, startAnchor.resolve());

    if (!point) {
      throw new Error('deleteAt could not resolve a surviving end point');
    }

    const [node] = editorLeaf(editor, point);
    const offset = plan.isSingleText ? plan.start.offset : 0;
    const text = node.text.slice(offset, plan.end.offset);

    if (text.length > 0) {
      applyBuiltDocumentChange(editor, (builder, root) =>
        builder.removeText(root, point.path, offset, text)
      );
      removedText = text;
    }
  }

  return {
    startAnchor,
    endAnchor,
    removedText,
  };
};
