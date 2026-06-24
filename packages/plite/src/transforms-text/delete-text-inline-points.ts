import { getEditorSchema } from '../core/editor-runtime';
import {
  NodeApi,
  type Path,
  PathApi,
  type Point,
  PointApi,
} from '../interfaces';
import {
  hasPath as editorHasPath,
  point as editorPoint,
} from '../interfaces/editor';
import type { Editor } from '../interfaces/editor';
import {
  type DeleteRangePlan,
  getCurrentNode,
  getLivePoint,
  isTextNode,
} from './delete-text-plan';

export const movePointToFollowingInline = (
  editor: Editor,
  point: Point | null | undefined
) => {
  const livePoint = getLivePoint(editor, point);

  if (!livePoint || livePoint.path.length < 2) {
    return livePoint;
  }

  const currentNode = getCurrentNode(editor, livePoint.path);

  if (
    !isTextNode(currentNode) ||
    livePoint.offset !== currentNode.text.length
  ) {
    return livePoint;
  }

  const parentPath = livePoint.path.slice(0, -1) as Path;

  if (!editorHasPath(editor, parentPath)) {
    return livePoint;
  }

  const parent = getCurrentNode(editor, parentPath);

  if (!NodeApi.isElement(parent) || !getEditorSchema(editor).isInline(parent)) {
    return livePoint;
  }

  const nextSiblingPath =
    parentPath.at(-1) == null ? null : PathApi.next(parentPath);

  if (!nextSiblingPath || !editorHasPath(editor, nextSiblingPath)) {
    return livePoint;
  }

  const nextSibling = getCurrentNode(editor, nextSiblingPath);

  if (
    NodeApi.isElement(nextSibling) &&
    getEditorSchema(editor).isInline(nextSibling)
  ) {
    return editorPoint(editor, nextSiblingPath, { edge: 'start' });
  }

  if (!isTextNode(nextSibling) || nextSibling.text !== '') {
    return livePoint;
  }

  const nextInlinePath =
    nextSiblingPath.at(-1) == null ? null : PathApi.next(nextSiblingPath);

  if (!nextInlinePath || !editorHasPath(editor, nextInlinePath)) {
    return livePoint;
  }

  const nextInline = getCurrentNode(editor, nextInlinePath);

  if (
    !NodeApi.isElement(nextInline) ||
    !getEditorSchema(editor).isInline(nextInline)
  ) {
    return livePoint;
  }

  return editorPoint(editor, nextInlinePath, { edge: 'start' });
};

export const moveLeadingSpacerPointIntoFollowingInline = (
  editor: Editor,
  point: Point | null | undefined
) => {
  const livePoint = getLivePoint(editor, point);

  if (!livePoint || livePoint.offset !== 0 || livePoint.path.length === 0) {
    return livePoint;
  }

  if ((livePoint.path.at(-1) ?? 0) !== 0) {
    return livePoint;
  }

  const currentNode = getCurrentNode(editor, livePoint.path);

  if (!isTextNode(currentNode) || currentNode.text !== '') {
    return livePoint;
  }

  const nextSiblingPath = PathApi.next(livePoint.path as Path);

  if (!editorHasPath(editor, nextSiblingPath)) {
    return livePoint;
  }

  const nextSibling = getCurrentNode(editor, nextSiblingPath);

  if (
    NodeApi.isElement(nextSibling) &&
    getEditorSchema(editor).isInline(nextSibling) &&
    !getEditorSchema(editor).isVoid(nextSibling)
  ) {
    return editorPoint(editor, nextSiblingPath, { edge: 'start' });
  }

  return livePoint;
};

export const moveTrailingTextPointIntoFollowingInline = (
  editor: Editor,
  point: Point | null | undefined
) => {
  const livePoint = getLivePoint(editor, point);

  if (!livePoint) {
    return livePoint;
  }

  const currentNode = getCurrentNode(editor, livePoint.path);

  if (
    !isTextNode(currentNode) ||
    livePoint.offset !== currentNode.text.length ||
    currentNode.text.length === 0
  ) {
    return livePoint;
  }

  const nextSiblingPath = PathApi.next(livePoint.path as Path);

  if (!editorHasPath(editor, nextSiblingPath)) {
    return livePoint;
  }

  const nextSibling = getCurrentNode(editor, nextSiblingPath);

  if (
    NodeApi.isElement(nextSibling) &&
    getEditorSchema(editor).isInline(nextSibling) &&
    !getEditorSchema(editor).isVoid(nextSibling)
  ) {
    return editorPoint(editor, nextSiblingPath, { edge: 'start' });
  }

  return livePoint;
};

export const moveExpandedInlineEdgeDeletePointOutsideInline = (
  editor: Editor,
  plan: DeleteRangePlan,
  point: Point | null | undefined
) => {
  const livePoint = getLivePoint(editor, point);

  if (
    !livePoint ||
    plan.isCollapsed ||
    plan.isAcrossBlocks ||
    plan.preserveInlineEdge ||
    livePoint.path.length < 2
  ) {
    return livePoint;
  }

  const parentPath = livePoint.path.slice(0, -1) as Path;

  if (!editorHasPath(editor, parentPath)) {
    return livePoint;
  }

  const originalStartParentPath = plan.start.path.slice(0, -1) as Path;
  const originalEndParentPath = plan.end.path.slice(0, -1) as Path;

  if (
    !PathApi.equals(originalStartParentPath, parentPath) ||
    !PathApi.equals(originalEndParentPath, parentPath)
  ) {
    return livePoint;
  }

  const parent = getCurrentNode(editor, parentPath);

  if (
    !NodeApi.isElement(parent) ||
    !getEditorSchema(editor).isInline(parent) ||
    getEditorSchema(editor).isVoid(parent)
  ) {
    return livePoint;
  }

  const currentText = NodeApi.string(parent);

  if (currentText.length === 0) {
    return livePoint;
  }

  const parentStart = editorPoint(editor, parentPath, { edge: 'start' });
  const parentEnd = editorPoint(editor, parentPath, { edge: 'end' });

  if (plan.start.offset === 0 && PointApi.equals(livePoint, parentStart)) {
    const previousSiblingPath =
      parentPath.at(-1) === 0 ? null : PathApi.previous(parentPath);

    if (previousSiblingPath && editorHasPath(editor, previousSiblingPath)) {
      const previousSibling = getCurrentNode(editor, previousSiblingPath);

      if (isTextNode(previousSibling)) {
        return editorPoint(editor, previousSiblingPath, { edge: 'end' });
      }
    }
  }

  const deletedLength = plan.end.offset - plan.start.offset;
  const removedThroughInlineEnd = plan.start.offset >= currentText.length;

  if (
    deletedLength > 0 &&
    removedThroughInlineEnd &&
    PointApi.equals(livePoint, parentEnd)
  ) {
    const nextSiblingPath =
      parentPath.at(-1) == null ? null : PathApi.next(parentPath);

    if (nextSiblingPath && editorHasPath(editor, nextSiblingPath)) {
      const nextSibling = getCurrentNode(editor, nextSiblingPath);

      if (isTextNode(nextSibling)) {
        return editorPoint(editor, nextSiblingPath, { edge: 'start' });
      }
    }
  }

  return livePoint;
};
