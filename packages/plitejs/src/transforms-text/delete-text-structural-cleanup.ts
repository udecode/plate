import type { Anchor } from '../core/anchor';
import type { NodeList } from '../core/change/document-index';
import { getEditorSchema } from '../core/editor-runtime';
import { getChildList } from '../core/public-state';
import { node as getNode } from '../editor/node';
import {
  type Descendant,
  type Node,
  NodeApi,
  type Path,
  PathApi,
  type Element as EditorElement,
  type Text,
} from '../interfaces';
import type { AnyEditor as Editor } from '../interfaces/editor';
import { hasPath as editorHasPath } from '../interfaces/editor';
import { getDefined } from '../internal/get-defined';
import { insertNodes, mergeNodes, removeNodes } from '../transforms-node';

export type DeleteStructuralCleanupPlan = {
  effectiveEndBlockPath?: Path | null;
  effectiveStartBlockPath?: Path | null;
  isAcrossBlocks: boolean;
  topLevelCountBefore: number;
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

// Merging a later pair never changes whether an earlier pair can merge, so one
// pass finds every pair, last first, before any merge runs.
const collectMergeableTextPaths = (
  children: NodeList<Descendant>,
  parentPath: Path,
  paths: Path[],
  first = 0,
  last = children.length - 1
) => {
  for (let index = last; index >= first; index--) {
    const child = getDefined(children.at(index));

    if (!NodeApi.isText(child)) {
      collectMergeableTextPaths(child.children, [...parentPath, index], paths);
      continue;
    }

    if (
      index > 0 &&
      canMergeAdjacentTextNodes(getDefined(children.at(index - 1)), child)
    ) {
      paths.push([...parentPath, index]);
    }
  }

  return paths;
};

// A delete leaves mergeable neighbors only inside the top-level blocks it
// touched; elsewhere the text is as the last commit's canonical form left it.
export const mergeAdjacentTextRuns = (
  editor: Editor,
  touchedRange?: { end: number; start: number } | null
) => {
  const children = getChildList(editor);

  if (children.length === 0) {
    return;
  }

  collectMergeableTextPaths(
    children,
    [],
    [],
    touchedRange?.start ?? 0,
    Math.min(children.length - 1, touchedRange?.end ?? Infinity)
  ).forEach((path) => {
    mergeNodes(editor, { at: path });
  });
};

const collectElementPathsBelow = (node: Node, path: Path, paths: Path[]) => {
  if (!NodeApi.isElement(node)) {
    return;
  }

  for (let index = node.children.length - 1; index >= 0; index--) {
    const childPath = [...path, index];

    collectElementPathsBelow(node.children[index], childPath, paths);

    if (NodeApi.isElement(node.children[index])) {
      paths.push(childPath);
    }
  }
};

// Only an interior top-level block of the range or a block below the prune
// path can be removed, so only those are visited. They come last first and
// each after its children, so no removal shifts a path still to visit.
const getRemovableElementPaths = (
  editor: Editor,
  pruneNestedUnderPath: Path | null | undefined,
  pruneTopLevelRange: { end: number; start: number } | null | undefined
) => {
  const paths: Path[] = [];
  const pruneIndex =
    pruneNestedUnderPath && editorHasPath(editor, pruneNestedUnderPath)
      ? pruneNestedUnderPath[0]
      : undefined;
  const last = Math.min(
    getChildList(editor).length - 1,
    Math.max(pruneTopLevelRange?.end ?? -1, pruneIndex ?? -1)
  );
  const first = Math.min(
    pruneTopLevelRange ? pruneTopLevelRange.start + 1 : Infinity,
    pruneIndex ?? Infinity
  );

  for (let index = last; index >= first; index--) {
    if (pruneNestedUnderPath && index === pruneIndex) {
      collectElementPathsBelow(
        getCurrentNode(editor, pruneNestedUnderPath),
        pruneNestedUnderPath,
        paths
      );
    }

    if (
      pruneTopLevelRange &&
      index > pruneTopLevelRange.start &&
      index <= pruneTopLevelRange.end
    ) {
      paths.push([index]);
    }
  }

  return paths;
};

export const removeEmptyEndChain = (
  editor: Editor,
  endChain: ReadonlyArray<Anchor<Path>>
) => {
  const schema = getEditorSchema(editor);

  for (const path of endChain.map((anchor) => anchor.release())) {
    if (!path || !editorHasPath(editor, path)) continue;

    const node = getCurrentNode(editor, path);

    if (
      !NodeApi.isElement(node) ||
      schema.isVoid(node) ||
      schema.isReadOnly(node) ||
      schema.isInline(node)
    ) {
      continue;
    }
    if (
      NodeApi.string(node) !== '' ||
      !(node.children.length === 0 || hasSingleChildNest(editor, node))
    ) {
      break;
    }

    const parentPath = path.slice(0, -1);
    const parent =
      parentPath.length === 0 ? editor : getCurrentNode(editor, parentPath);

    if (NodeApi.isElement(parent) && parent.children.length === 1) continue;

    removeNodes(editor, { at: path });
  }
};

export const removeEmptyStructuralArtifacts = (
  editor: Editor,
  preservePath?: Path | null,
  pruneNestedUnderPath?: Path | null,
  pruneTopLevelRange?: { end: number; start: number } | null
) => {
  getRemovableElementPaths(
    editor,
    pruneNestedUnderPath,
    pruneTopLevelRange
  ).forEach((path) => {
    if (!editorHasPath(editor, path)) {
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

    if (
      NodeApi.isElement(node) &&
      NodeApi.string(node) === '' &&
      hasSingleChildNest(editor, node)
    ) {
      const parentPath = path.slice(0, -1) as Path;
      const parent =
        parentPath.length === 0 ? editor : getCurrentNode(editor, parentPath);

      if (NodeApi.isElement(parent) && parent.children.length === 1) {
        return;
      }

      removeNodes(editor, { at: path });
    }
  });
};

export const getTouchedTopLevelRange = (
  plan: DeleteStructuralCleanupPlan
): { end: number; start: number } | null => {
  const start = plan.effectiveStartBlockPath?.[0];
  const end = plan.effectiveEndBlockPath?.[0] ?? start;

  return start == null || end == null
    ? null
    : { end: Math.max(start, end), start: Math.min(start, end) };
};

export const getTopLevelCleanupRange = (
  editor: Editor,
  plan: DeleteStructuralCleanupPlan
): { end: number; start: number } | null => {
  if (
    !plan.isAcrossBlocks ||
    plan.effectiveStartBlockPath?.length !== 1 ||
    plan.effectiveEndBlockPath?.length !== 1
  ) {
    return null;
  }

  const start = Math.min(
    plan.effectiveStartBlockPath[0],
    plan.effectiveEndBlockPath[0]
  );
  const removedTopLevelBlocks =
    plan.topLevelCountBefore - getChildList(editor).length;

  return {
    end: Math.max(
      start,
      Math.max(plan.effectiveStartBlockPath[0], plan.effectiveEndBlockPath[0]) -
        removedTopLevelBlocks
    ),
    start,
  };
};

export const restorePreservedEmptyStartBlock = (
  editor: Editor,
  preservePath: Path | null | undefined,
  preservedBlock: EditorElement | null | undefined
) => {
  if (!preservePath || !preservedBlock) {
    return;
  }

  const children = getChildList(editor);
  const shouldRestore =
    (children.length === 1 &&
      NodeApi.string(getDefined(children.at(0))) !== '') ||
    !editorHasPath(editor, preservePath) ||
    NodeApi.string(getCurrentNode(editor, preservePath)) !== '';

  if (!shouldRestore) {
    return;
  }

  insertNodes(editor, preservedBlock, {
    at: preservePath,
  });
};
