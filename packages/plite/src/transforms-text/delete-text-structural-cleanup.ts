import { getEditorSchema } from '../core/editor-runtime';
import { getEditorTransformRegistry } from '../core/transform-registry';
import { node as getNode } from '../editor/node';
import { nodes as getNodes } from '../editor/nodes';
import {
  type Node,
  NodeApi,
  type Path,
  PathApi,
  type Element as PliteElement,
  type Text,
} from '../interfaces';
import {
  getChildren as editorGetChildren,
  hasPath as editorHasPath,
  isBlock as editorIsBlock,
} from '../interfaces/editor';
import type { Editor } from '../interfaces/editor';
import { mergeNodes } from '../transforms-node';

export type DeleteStructuralCleanupPlan = {
  effectiveEndBlockPath?: Path | null;
  effectiveStartBlockPath?: Path | null;
  isAcrossBlocks: boolean;
};

const getCurrentNode = (editor: Editor, path: Path) => getNode(editor, path)[0];

const isTextNode = (node: unknown): node is Text =>
  node != null && typeof node === 'object' && 'text' in node;

const valuesEqual = (left: unknown, right: unknown): boolean => {
  if (left === right) {
    return true;
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    return (
      left.length === right.length &&
      left.every((entry, index) => valuesEqual(entry, right[index]))
    );
  }

  if (left && typeof left === 'object' && right && typeof right === 'object') {
    const leftEntries = Object.entries(left);
    const rightEntries = Object.entries(right);

    return (
      leftEntries.length === rightEntries.length &&
      leftEntries.every(
        ([key, entry]) =>
          Object.hasOwn(right, key) &&
          valuesEqual(entry, (right as Record<string, unknown>)[key])
      )
    );
  }

  return false;
};

const textPropsEqual = (left: Text, right: Text) =>
  valuesEqual(
    Object.fromEntries(Object.entries(left).filter(([key]) => key !== 'text')),
    Object.fromEntries(Object.entries(right).filter(([key]) => key !== 'text'))
  );

const canMergeAdjacentTextNodes = (left: Node, right: Node) =>
  isTextNode(left) && isTextNode(right) && textPropsEqual(left, right);

export const maybeMergeAdjacentTextAt = (
  editor: Editor,
  path: Path | null | undefined
) => {
  if (
    !path ||
    !editorHasPath(editor, path) ||
    path.length === 0 ||
    path.at(-1) === 0
  ) {
    return;
  }

  const previousPath = PathApi.previous(path);

  if (!editorHasPath(editor, previousPath)) {
    return;
  }

  const node = getCurrentNode(editor, path);
  const previous = getCurrentNode(editor, previousPath);

  if (!canMergeAdjacentTextNodes(previous, node)) {
    return;
  }

  mergeNodes(editor, { at: path });
};

const hasSingleChildNest = (
  editor: Editor,
  node: Node | null | undefined
): boolean => {
  if (node === editor || node == null) {
    return false;
  }

  if (NodeApi.isText(node)) {
    return true;
  }

  if (NodeApi.isElement(node) && getEditorSchema(editor).isVoid(node)) {
    return true;
  }

  return (
    NodeApi.isElement(node) &&
    node.children.length === 1 &&
    hasSingleChildNest(editor, node.children[0])
  );
};

export const mergeAdjacentTextRuns = (editor: Editor) => {
  if (editorGetChildren(editor).length === 0) {
    return;
  }

  const textPaths = Array.from(
    getNodes(editor, {
      at: [],
      reverse: true,
      match: (node): node is Text => NodeApi.isText(node),
      voids: true,
    }),
    ([, path]) => path
  );

  textPaths.forEach((path) => {
    if (
      !editorHasPath(editor, path) ||
      path.length === 0 ||
      path.at(-1) === 0
    ) {
      return;
    }

    const previousPath = PathApi.previous(path);

    if (!editorHasPath(editor, previousPath)) {
      return;
    }

    const node = getCurrentNode(editor, path);
    const previous = getCurrentNode(editor, previousPath);

    if (canMergeAdjacentTextNodes(previous, node)) {
      mergeNodes(editor, { at: path });
    }
  });
};

export const removeEmptyStructuralArtifacts = (
  editor: Editor,
  preservePath?: Path | null,
  pruneNestedUnderPath?: Path | null,
  pruneTopLevelRange?: { end: number; start: number } | null
) => {
  const elementPaths = Array.from(
    getNodes(editor, {
      at: [],
      reverse: true,
      match: (node) => NodeApi.isElement(node),
      voids: true,
    }),
    ([, path]) => path
  );

  elementPaths.forEach((path) => {
    if (!editorHasPath(editor, path) || path.length === 0) {
      return;
    }

    if (
      preservePath &&
      (PathApi.equals(path, preservePath) ||
        PathApi.isAncestor(preservePath, path))
    ) {
      return;
    }

    const node = getCurrentNode(editor, path);

    if (
      NodeApi.isElement(node) &&
      (getEditorSchema(editor).isVoid(node) ||
        getEditorSchema(editor).isReadOnly(node))
    ) {
      return;
    }

    if (NodeApi.isElement(node) && getEditorSchema(editor).isInline(node)) {
      return;
    }

    const isTopLevelBlock =
      NodeApi.isElement(node) &&
      path.length === 1 &&
      editorIsBlock(editor, node);
    const isNestedBlock =
      NodeApi.isElement(node) && path.length > 1 && editorIsBlock(editor, node);
    const isInteriorTopLevelBlock =
      isTopLevelBlock &&
      !!pruneTopLevelRange &&
      path[0] > pruneTopLevelRange.start &&
      path[0] <= pruneTopLevelRange.end;

    if (
      isNestedBlock &&
      (!pruneNestedUnderPath || !PathApi.isAncestor(pruneNestedUnderPath, path))
    ) {
      return;
    }

    if (
      NodeApi.isElement(node) &&
      NodeApi.string(node) === '' &&
      hasSingleChildNest(editor, node) &&
      (!isTopLevelBlock || isInteriorTopLevelBlock)
    ) {
      const parentPath = path.slice(0, -1) as Path;
      const parent =
        parentPath.length === 0 ? editor : getCurrentNode(editor, parentPath);

      if (NodeApi.isElement(parent) && parent.children.length === 1) {
        return;
      }

      getEditorTransformRegistry(editor).removeNodes({ at: path });
    }
  });
};

export const getTopLevelCleanupRange = (
  plan: DeleteStructuralCleanupPlan
): { end: number; start: number } | null =>
  plan.isAcrossBlocks &&
  plan.effectiveStartBlockPath?.length === 1 &&
  plan.effectiveEndBlockPath?.length === 1
    ? {
        end: Math.max(
          plan.effectiveStartBlockPath[0]!,
          plan.effectiveEndBlockPath[0]!
        ),
        start: Math.min(
          plan.effectiveStartBlockPath[0]!,
          plan.effectiveEndBlockPath[0]!
        ),
      }
    : null;

export const restorePreservedEmptyStartBlock = (
  editor: Editor,
  preservePath: Path | null | undefined,
  preservedBlock: PliteElement | null | undefined
) => {
  if (!preservePath || !preservedBlock) {
    return;
  }

  const shouldRestore =
    (editorGetChildren(editor).length === 1 &&
      NodeApi.string(editorGetChildren(editor)[0]!) !== '') ||
    !editorHasPath(editor, preservePath) ||
    NodeApi.string(getCurrentNode(editor, preservePath)) !== '';

  if (!shouldRestore) {
    return;
  }

  getEditorTransformRegistry(editor).insertNodes(preservedBlock, {
    at: preservePath,
  });
};
