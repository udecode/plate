import { type Node, NodeApi, PathApi, type Range } from '@platejs/plite';

import { profileEditableMutationDuration } from './mutation-profiler';
import {
  failInvariant,
  getEditorCurrentMarks,
  type Editor as RuntimeEditor,
} from './runtime-editor-api';

const hasActiveMarks = (marks: Record<string, unknown> | null) =>
  !!marks && Object.keys(marks).length > 0;

const isUnmarkedTextNode = (node: Node) =>
  NodeApi.isText(node) && Object.keys(node).length === 1;

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

    const [node] =
      state.nodes.get(path) ??
      failInvariant(
        `Expected collapsed replacement node at ${JSON.stringify(path)}`
      );

    if (!isUnmarkedTextNode(node)) {
      return false;
    }

    const blockPath = [path[0]!];
    const [block] =
      state.nodes.get(blockPath) ??
      failInvariant(
        `Expected collapsed replacement block at ${JSON.stringify(blockPath)}`
      );
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
    const [node] =
      state.nodes.get(selection.anchor.path) ??
      failInvariant(
        `Expected replacement anchor at ${JSON.stringify(selection.anchor.path)}`
      );

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
    const [node] =
      state.nodes.get(selection.anchor.path) ??
      failInvariant(
        `Expected cached insertion anchor at ${JSON.stringify(selection.anchor.path)}`
      );

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
      editor.read((state) => state.marks())
    ),
    selection,
  });
};
