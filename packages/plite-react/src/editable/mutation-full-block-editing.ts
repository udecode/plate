import {
  type Descendant,
  type Node,
  NodeApi,
  type Operation,
  type Path,
  PathApi,
  PointApi,
  type Range,
  RangeApi,
} from '@platejs/plite';
import {
  createDefaultParagraph,
  getPointWithRoot,
} from './mutation-block-editing';
import { profileEditableMutationDuration } from './mutation-profiler';
import { withProjectedMutationRoot } from './mutation-root-scope';
import {
  getEditorCurrentMarks,
  markInternalOwnedReplayOperation,
  type Editor as RuntimeEditor,
  above as editorAbove,
  isBlock as editorIsBlock,
  point as editorPoint,
} from './runtime-editor-api';

const MULTILINE_TEXT_PATTERN = /[\n\r]/;

const STRUCTURAL_TEXT_REPLACEMENT_BLOCK_TYPES = new Set([
  'bulleted-list',
  'code-block',
  'numbered-list',
  'table',
  'table-cell',
  'table-row',
]);

const hasActiveMarks = (marks: Record<string, unknown> | null) =>
  !!marks && Object.keys(marks).length > 0;

const isUnmarkedTextNode = (node: Node) =>
  NodeApi.isText(node) && Object.keys(node).length === 1;

const getTextNodeMarks = (node: Node) => {
  if (!NodeApi.isText(node)) {
    return null;
  }

  const { text: _text, ...marks } = node;

  return Object.keys(marks).length > 0 ? marks : null;
};

const getTextNodeMarksKey = (marks: Record<string, unknown> | null) =>
  marks === null
    ? ''
    : JSON.stringify(
        Object.keys(marks)
          .sort()
          .map((key) => [key, marks[key]])
      );

const getConsistentTextMarksInBlocks = (
  editor: RuntimeEditor,
  blockPaths: Path[]
) =>
  editor.read((state) => {
    let firstMarks: Record<string, unknown> | null = null;
    let firstMarksKey: string | null = null;
    let sawText = false;

    for (const blockPath of blockPaths) {
      const [block] = state.nodes.get(blockPath);

      for (const [node] of NodeApi.texts(block)) {
        if (node.text.length === 0) {
          continue;
        }

        const marks = getTextNodeMarks(node);
        const marksKey = getTextNodeMarksKey(marks);

        if (!sawText) {
          sawText = true;
          firstMarks = marks;
          firstMarksKey = marksKey;

          if (marksKey === '') {
            return null;
          }

          continue;
        }

        if (marksKey !== firstMarksKey) {
          return null;
        }
      }
    }

    return sawText ? firstMarks : null;
  });

const createTextReplacementNode = (
  editor: RuntimeEditor,
  blockPaths: Path[],
  marks: Record<string, unknown> | null,
  text: string
): Descendant => {
  const children = [marks ? { ...marks, text } : { text }];

  if (blockPaths.length !== 1) {
    return {
      ...createDefaultParagraph(),
      children,
    } as Descendant;
  }

  return editor.read((state) => {
    const [block] = state.nodes.get(blockPaths[0]!);
    const { schema } = state;

    if (
      NodeApi.isElement(block) &&
      !STRUCTURAL_TEXT_REPLACEMENT_BLOCK_TYPES.has(
        typeof block.type === 'string' ? block.type : ''
      ) &&
      !schema.isInline(block) &&
      !schema.isVoid(block) &&
      block.children.every(
        (child) =>
          NodeApi.isText(child) ||
          (NodeApi.isElement(child) && schema.isInline(child))
      )
    ) {
      return {
        ...block,
        children,
      } as Descendant;
    }

    return {
      ...createDefaultParagraph(),
      children,
    } as Descendant;
  });
};

const isPlainTextLeafStart = ({
  editor,
  selection,
}: {
  editor: RuntimeEditor;
  selection: Range;
}) =>
  editor.read((state) => {
    const { path } = selection.anchor;

    if (path.length < 2 || selection.anchor.offset !== 0) {
      return false;
    }

    const [node] = state.nodes.get(path);

    if (!isUnmarkedTextNode(node)) {
      return false;
    }

    const [block] = state.nodes.get([path[0]!]);
    const targetRelativePath = path.slice(1);
    let previousTextNode: Node | null = null;

    for (const [textNode, textPath] of NodeApi.texts(block)) {
      if (PathApi.equals(textPath, targetRelativePath)) {
        return (
          previousTextNode === null || isUnmarkedTextNode(previousTextNode)
        );
      }

      previousTextNode = textNode;
    }

    return false;
  });

const canUseExplicitCollapsedTextInsert = ({
  editor,
  marks,
  selection,
}: {
  editor: RuntimeEditor;
  marks: Record<string, unknown> | null;
  selection: Range;
}) => {
  if (hasActiveMarks(marks)) {
    return false;
  }
  if (marks == null) {
    return true;
  }

  return editor.read((state) => {
    const [node] = state.nodes.get(selection.anchor.path);

    return isUnmarkedTextNode(node);
  });
};

export const canUseCachedCollapsedTextInsert = ({
  editor,
  selection,
}: {
  editor: RuntimeEditor;
  selection: Range;
}) => {
  const marks = getEditorCurrentMarks(editor);

  if (hasActiveMarks(marks)) {
    return false;
  }

  const unmarkedTextNode = editor.read((state) => {
    const [node] = state.nodes.get(selection.anchor.path);

    return isUnmarkedTextNode(node);
  });

  if (!unmarkedTextNode) {
    return false;
  }

  if (marks !== null || selection.anchor.offset > 0) {
    return true;
  }

  if (isPlainTextLeafStart({ editor, selection })) {
    return true;
  }

  return canUseExplicitCollapsedTextInsert({
    editor,
    marks: profileEditableMutationDuration('model-text-input-read-marks', () =>
      editor.read((state) => state.marks.get())
    ),
    selection,
  });
};

const getFullySelectedBlockPaths = (
  editor: RuntimeEditor,
  selection: Range | null,
  {
    includeAllSiblings = false,
    includeOnlyChild = false,
  }: {
    includeAllSiblings?: boolean;
    includeOnlyChild?: boolean;
  } = {}
): Path[] | null => {
  if (!selection || RangeApi.isCollapsed(selection)) {
    return null;
  }

  const [start, end] = RangeApi.edges(selection);
  const startBlock = editorAbove(editor, {
    at: start,
    match: (node) => NodeApi.isElement(node) && editorIsBlock(editor, node),
    mode: 'highest',
  });
  const endBlock = editorAbove(editor, {
    at: end,
    match: (node) => NodeApi.isElement(node) && editorIsBlock(editor, node),
    mode: 'highest',
  });

  if (!startBlock || !endBlock) {
    return null;
  }

  const [, blockPath] = startBlock;
  const [, endBlockPath] = endBlock;

  if (
    !PointApi.equals(start, editorPoint(editor, blockPath, { edge: 'start' }))
  ) {
    return null;
  }

  if (PathApi.equals(blockPath, endBlockPath)) {
    if (
      !PointApi.equals(end, editorPoint(editor, blockPath, { edge: 'end' }))
    ) {
      return null;
    }

    const parentPath = PathApi.parent(blockPath);
    const parentChildCount = editor.read((state) => {
      if (parentPath.length === 0) {
        return state.nodes.children().length;
      }

      const [parentNode] = state.nodes.get(parentPath);

      return NodeApi.isAncestor(parentNode) &&
        'children' in parentNode &&
        Array.isArray(parentNode.children)
        ? parentNode.children.length
        : 0;
    });

    return parentChildCount > 1 || includeOnlyChild ? [blockPath] : null;
  }

  if (PointApi.equals(end, editorPoint(editor, blockPath, { edge: 'end' }))) {
    return [blockPath];
  }

  const endsAtEndBlockStart = PointApi.equals(
    end,
    editorPoint(editor, endBlockPath, { edge: 'start' })
  );
  const endsAtEndBlockEnd = PointApi.equals(
    end,
    editorPoint(editor, endBlockPath, { edge: 'end' })
  );

  if (!endsAtEndBlockStart && !endsAtEndBlockEnd) {
    return null;
  }

  if (
    !PathApi.isSibling(blockPath, endBlockPath) ||
    !PathApi.isBefore(blockPath, endBlockPath)
  ) {
    return null;
  }

  const paths: Path[] = [];
  let path = blockPath;
  const stopPath = endsAtEndBlockEnd
    ? PathApi.next(endBlockPath)
    : endBlockPath;

  while (!PathApi.equals(path, stopPath)) {
    paths.push(path);
    path = PathApi.next(path);
  }

  const parentPath = PathApi.parent(blockPath);
  const parentChildCount = editor.read((state) => {
    if (parentPath.length === 0) {
      return state.nodes.children().length;
    }

    const [parentNode] = state.nodes.get(parentPath);

    return NodeApi.isAncestor(parentNode) &&
      'children' in parentNode &&
      Array.isArray(parentNode.children)
      ? parentNode.children.length
      : 0;
  });

  return paths.length < parentChildCount || includeAllSiblings ? paths : null;
};

const getFullySelectedTopLevelBlockPaths = (
  editor: RuntimeEditor,
  selection: Range | null
): Path[] | null => {
  if (!selection || RangeApi.isCollapsed(selection)) {
    return null;
  }

  const childCount = editor.read((state) => state.nodes.children().length);

  if (childCount === 0) {
    return null;
  }

  const [start, end] = RangeApi.edges(selection);
  const firstPath = [0];
  const lastPath = [childCount - 1];

  if (
    !PointApi.equals(start, editorPoint(editor, firstPath, { edge: 'start' }))
  ) {
    return null;
  }

  if (!PointApi.equals(end, editorPoint(editor, lastPath, { edge: 'end' }))) {
    return null;
  }

  return Array.from({ length: childCount }, (_, index) => [index]);
};

export const applyFullBlockDeleteFragment = (
  editor: RuntimeEditor,
  selection: Range | null
) => {
  const topLevelBlockPaths = profileEditableMutationDuration(
    'delete-fragment.full-top-level-paths',
    () => getFullySelectedTopLevelBlockPaths(editor, selection)
  );

  if (!topLevelBlockPaths) {
    const blockPaths = profileEditableMutationDuration(
      'delete-fragment.full-block-paths',
      () => getFullySelectedBlockPaths(editor, selection)
    );

    if (blockPaths) {
      profileEditableMutationDuration('delete-fragment.remove-blocks', () => {
        editor.update((tx) => {
          for (const blockPath of [...blockPaths].reverse()) {
            tx.nodes.remove({ at: blockPath });
          }
        });
      });

      return true;
    }

    return false;
  }

  const marks = profileEditableMutationDuration(
    'delete-fragment.consistent-marks',
    () => getConsistentTextMarksInBlocks(editor, topLevelBlockPaths)
  );
  const selectionPoint = getPointWithRoot(
    { path: [0, 0], offset: 0 },
    selection?.anchor.root
  );
  const paragraph = {
    ...createDefaultParagraph(),
    children: [marks ? { ...marks, text: '' } : { text: '' }],
  } as Descendant;
  const root = selection?.anchor.root;
  const selectedChildren = profileEditableMutationDuration(
    'delete-fragment.selected-children',
    () =>
      withProjectedMutationRoot(editor, root, () =>
        editor.read((state) => [...state.nodes.children()])
      )
  );
  const nextSelection = { anchor: selectionPoint, focus: selectionPoint };

  profileEditableMutationDuration('delete-fragment.replay-replace', () => {
    editor.update((tx) => {
      tx.operations.replay([
        markInternalOwnedReplayOperation({
          children: selectedChildren,
          index: 0,
          newChildren: [paragraph],
          newSelection: nextSelection,
          path: [],
          ...(root ? { root } : {}),
          selection,
          type: 'replace_children',
        } as Operation),
      ]);

      if (marks) {
        for (const [key, value] of Object.entries(marks)) {
          tx.marks.add(key, value);
        }
      }
    });
  });

  return true;
};

export const applyFullBlockTextReplacement = (
  editor: RuntimeEditor,
  selection: Range | null,
  text: string
) => {
  if (MULTILINE_TEXT_PATTERN.test(text)) {
    return false;
  }

  const topLevelBlockPaths = getFullySelectedTopLevelBlockPaths(
    editor,
    selection
  );

  if (topLevelBlockPaths?.length) {
    const marks =
      getEditorCurrentMarks(editor) ??
      getConsistentTextMarksInBlocks(editor, topLevelBlockPaths);
    const replacement = createTextReplacementNode(
      editor,
      topLevelBlockPaths,
      marks,
      text
    );
    const root = selection?.anchor.root;
    const selectedChildren = withProjectedMutationRoot(editor, root, () =>
      editor.read((state) => [...state.nodes.children()])
    );
    const nextPoint = getPointWithRoot(
      { path: [0, 0], offset: text.length },
      root
    );
    const nextSelection = { anchor: nextPoint, focus: nextPoint };

    editor.update((tx) => {
      tx.operations.replay([
        {
          children: selectedChildren,
          index: 0,
          newChildren: [replacement],
          newSelection: nextSelection,
          path: [],
          ...(root ? { root } : {}),
          selection,
          type: 'replace_children',
        } as Operation,
      ]);
    });

    return true;
  }

  const blockPaths = getFullySelectedBlockPaths(editor, selection, {
    includeAllSiblings: true,
    includeOnlyChild: true,
  });

  if (!blockPaths?.length) {
    return false;
  }

  const insertionPath = [...blockPaths[0]!];
  const marks =
    getEditorCurrentMarks(editor) ??
    getConsistentTextMarksInBlocks(editor, blockPaths);
  const nextPoint = { path: insertionPath.concat(0), offset: text.length };
  const replacement = createTextReplacementNode(
    editor,
    blockPaths,
    marks,
    text
  );

  editor.update((tx) => {
    for (const blockPath of [...blockPaths].reverse()) {
      tx.nodes.remove({ at: blockPath });
    }

    tx.nodes.insert(replacement, { at: insertionPath });
    tx.selection.set({ anchor: nextPoint, focus: nextPoint });
  });

  return true;
};
