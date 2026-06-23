import { getEditorSchema } from '../core/editor-runtime';
import {
  getCurrentSelection,
  getCurrentSelectionRoot,
} from '../core/public-state';
import { node as getNode } from '../editor/node';
import {
  type Location,
  LocationApi,
  NodeApi,
  type Operation,
  type Path,
  PathApi,
  type Point,
  PointApi,
  type Range,
  type Element as PliteElement,
} from '../interfaces';
import { type Editor, Editor as EditorApi } from '../interfaces/editor';
import type { TextMutationMethods } from '../interfaces/transforms/text';
import { getLocationRoot, stripLocationRoots } from '../internal/root-location';

export type DeleteOptions = NonNullable<
  Parameters<TextMutationMethods['delete']>[1]
> & {
  preserveInlineEdge?: boolean;
};

export type DeletePathTarget = {
  fallbackPoint?: Point;
  initialAt: DeleteOptions['at'];
  kind: 'path';
  path: Path;
};

export type TransactionWriter = {
  apply: (operation: Operation) => void;
  setMarks: (marks: Record<string, unknown> | null) => void;
  setSelection: (selection: Range | null) => void;
};

export const getCurrentNode = (editor: Editor, path: Path) =>
  getNode(editor, path)[0];

export const isTextNode = (
  node: unknown
): node is import('../interfaces').Text =>
  node != null && typeof node === 'object' && 'text' in node;

const getImplicitSelectionRoot = (editor: Editor) =>
  getCurrentSelection(editor) ? getCurrentSelectionRoot(editor) : undefined;

export const getTransactionRoot = (
  editor: Editor,
  at: Location | undefined
): string | undefined => {
  if (at === undefined) {
    return getImplicitSelectionRoot(editor);
  }

  return LocationApi.isPath(at) ? undefined : getLocationRoot(at);
};

export const getHighestNonEditable = (editor: Editor, at: Path | Point) =>
  EditorApi.above(editor, {
    at,
    match: (node) =>
      NodeApi.isElement(node) &&
      (getEditorSchema(editor).isVoid(node) ||
        getEditorSchema(editor).isReadOnly(node)),
    mode: 'highest',
  });

export const pathContainsPoint = (path: readonly number[], point: Point) =>
  PathApi.equals(path as Path, point.path) ||
  PathApi.isAncestor(path as Path, point.path);

export const matchPointRootVisibility = (
  point: Point,
  reference: Point
): Point => {
  if (reference.root === undefined) {
    return stripLocationRoots(point);
  }

  return point.root === undefined ? { ...point, root: reference.root } : point;
};

export const getLivePoint = (
  editor: Editor,
  point: Point | null | undefined
) => {
  if (!point || !EditorApi.hasPath(editor, point.path)) {
    return null;
  }

  return point;
};

export const shouldKeepSplitTextAfterInteriorElementRemoval = (
  editor: Editor,
  start: Point,
  end: Point,
  isAcrossBlocks: boolean
) =>
  !isAcrossBlocks &&
  start.path.length === end.path.length &&
  PathApi.equals(
    start.path.slice(0, -1) as Path,
    end.path.slice(0, -1) as Path
  ) &&
  Math.abs((start.path.at(-1) ?? 0) - (end.path.at(-1) ?? 0)) > 1 &&
  (() => {
    const parentPath = start.path.slice(0, -1) as Path;

    if (!EditorApi.hasPath(editor, parentPath)) {
      return false;
    }

    const parent = getCurrentNode(editor, parentPath);

    if (!NodeApi.isElement(parent)) {
      return false;
    }

    const from = Math.min(start.path.at(-1) ?? 0, end.path.at(-1) ?? 0) + 1;
    const to = Math.max(start.path.at(-1) ?? 0, end.path.at(-1) ?? 0);

    for (let index = from; index < to; index += 1) {
      const child = parent.children[index];

      if (child && NodeApi.isElement(child)) {
        return true;
      }
    }

    return false;
  })();

export const shouldPreserveEmptyStartBlockForHangingRange = (
  editor: Editor,
  start: Point,
  isSingleText: boolean,
  isAcrossBlocks: boolean,
  preserveEndBlock: boolean,
  originalHangingBlockRange: boolean,
  effectiveStartBlock: readonly [import('../interfaces').Node, Path] | undefined
) =>
  !isSingleText &&
  isAcrossBlocks &&
  (preserveEndBlock || originalHangingBlockRange) &&
  effectiveStartBlock &&
  NodeApi.isElement(effectiveStartBlock[0]) &&
  !getEditorSchema(editor).isVoid(effectiveStartBlock[0]) &&
  PointApi.equals(start, EditorApi.point(editor, start.path, { edge: 'start' }))
    ? effectiveStartBlock[1]
    : null;

export type DeleteRangePlan = {
  distance: number;
  effectiveEndBlockPath: Path | null;
  effectiveRange: Range;
  effectiveStartBlockPath: Path | null;
  end: Point;
  endNonEditable: ReturnType<typeof getHighestNonEditable>;
  initialAt: DeleteOptions['at'];
  isAcrossBlocks: boolean;
  isCollapsed: boolean;
  isSingleText: boolean;
  kind: 'range';
  preserveEmptyStartBlockPath: Path | null;
  preserveEndBlock: boolean;
  preserveInlineEdge: boolean;
  preservedEmptyStartBlock: PliteElement | null;
  removedInteriorElementSiblingStructure: boolean;
  reverse: boolean;
  start: Point;
  startMergeBlockPath: Path | null;
  startNonEditable: ReturnType<typeof getHighestNonEditable>;
  unit: NonNullable<DeleteOptions['unit']>;
  voids: boolean;
};
