import {
  type Editor,
  type Element,
  ElementApi,
  type Path,
  PathApi,
  RangeApi,
  SelectionApi,
} from '../../core';
import { hasNonWritableAt } from '../../facade';

/**
 * Return `true` when the block at `path` is non-writable via a contributor
 * (such as `BaseLockPlugin`) on itself, an ancestor, an owned root, or any
 * descendant, excluding static `schema.isReadOnly` atoms.
 *
 * @internal
 */
export const isAIPathNonWritable = (editor: Editor, path: Path): boolean => {
  const root = editor.read.view.root();

  return hasNonWritableAt(
    editor,
    SelectionApi.nodes([path], { mode: 'block', ...(root ? { root } : {}) }),
    { includeReadOnly: false }
  );
};

/**
 * Result of resolving the active AI selection into target block entries.
 *
 * @internal
 */
export type AISelectedBlocksResult = Readonly<{
  entries: ReadonlyArray<readonly [Element, Path]>;
  /**
   * `true` when a text selection starts or ends mid-container inside a
   * container that holds a non-writable block.
   */
  partialLockedContainer: boolean;
}>;

const isElementAt = (
  editor: Editor,
  path: Path
): readonly [Element, Path] | null => {
  const entry = editor.read.nodes.get(path, { match: ElementApi.isElement });

  return entry ? [entry[0], entry[1]] : null;
};

const isContainerFullyCoveredByRange = (
  editor: Editor,
  containerPath: Path,
  startPath: Path,
  endPath: Path
): boolean => {
  const firstLeaf = editor.read.nodes.first(containerPath);
  const lastLeaf = editor.read.nodes.last(containerPath);

  if (!firstLeaf || !lastLeaf) return true;

  const startsAtOrBeforeFirst = PathApi.compare(startPath, firstLeaf[1]) <= 0;
  const endsAtOrAfterLast = PathApi.compare(endPath, lastLeaf[1]) >= 0;

  return startsAtOrBeforeFirst && endsAtOrAfterLast;
};

/**
 * Resolve the active AI selection into sibling target block entries shared by
 * client target capture, request ref collection, and server edit serialization.
 *
 * @internal
 */
export const resolveAISelectedBlocks = (
  editor: Editor,
  explicitSelection?: ReturnType<Editor['read']['selection']>
): AISelectedBlocksResult => {
  const selectedNodes =
    explicitSelection === undefined ? editor.read.selection.nodes() : [];

  if (selectedNodes.length > 0) {
    const entries: Array<readonly [Element, Path]> = [];

    for (const [node, path] of selectedNodes) {
      if (ElementApi.isElement(node)) {
        entries.push([node, path]);
      }
    }
    entries.sort(([, left], [, right]) => PathApi.compare(left, right));

    return { entries, partialLockedContainer: false };
  }

  const selection =
    explicitSelection === undefined
      ? editor.read.selection()
      : explicitSelection;

  if (!selection) {
    return { entries: [], partialLockedContainer: false };
  }

  const [start, end] = RangeApi.edges(selection);

  if (PathApi.equals(start.path, end.path)) {
    const block = editor.read.nodes.block({ at: start });

    return {
      entries: block ? [block] : [],
      partialLockedContainer: false,
    };
  }

  let containerPath = PathApi.common(start.path, end.path);

  while (containerPath.length > 0) {
    const entry = editor.read.nodes.get(containerPath);

    if (
      entry &&
      ElementApi.isElement(entry[0]) &&
      !editor.read.schema.isInline(entry[0]) &&
      entry[0].children.every((child) => ElementApi.isElement(child))
    ) {
      break;
    }

    containerPath = PathApi.parent(containerPath);
  }

  const depth = containerPath.length;
  const startIndex = start.path[depth];
  const endIndex = end.path[depth];

  if (startIndex === undefined || endIndex === undefined) {
    const lowest = [...editor.read.nodes.blocks({ at: selection })];

    return { entries: lowest, partialLockedContainer: false };
  }

  const siblings: Array<readonly [Element, Path]> = [];

  for (let index = startIndex; index <= endIndex; index += 1) {
    const path = [...containerPath, index];
    const entry = isElementAt(editor, path);

    if (entry) siblings.push(entry);
  }

  if (siblings.length === 0) {
    return { entries: [], partialLockedContainer: false };
  }

  let hasPartial = false;
  let partialLockedContainer = false;

  for (const [node, path] of siblings) {
    const isContainer =
      node.children.length > 0 &&
      node.children.every((child) => ElementApi.isElement(child));

    if (!isContainer) continue;
    if (isContainerFullyCoveredByRange(editor, path, start.path, end.path)) {
      continue;
    }

    hasPartial = true;
    if (isAIPathNonWritable(editor, path)) {
      partialLockedContainer = true;
    }
  }

  if (partialLockedContainer) {
    return { entries: siblings, partialLockedContainer: true };
  }

  if (hasPartial) {
    return {
      entries: [...editor.read.nodes.blocks({ at: selection })],
      partialLockedContainer: false,
    };
  }

  return { entries: siblings, partialLockedContainer: false };
};
