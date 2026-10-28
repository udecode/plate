import {
  type EditorMarks,
  type Node,
  NodeApi,
  PathApi,
  type Point,
  type Range,
  SelectionApi,
} from '../..';
import { commandViewHides } from '../../core/command-frame';
import { toInternalRoot } from '../../core/public-root';
import { profilePliteReactDuration } from '../render-profiler';
import {
  failInvariant,
  type Editor as RuntimeEditor,
} from './runtime-editor-api';
import { readRuntimeSelection } from './runtime-selection-state';

const hasActiveMarks = (marks: Record<string, unknown> | null) =>
  !!marks && Object.keys(marks).length > 0;

const isUnmarkedTextNode = (node: Node) =>
  NodeApi.isText(node) && Object.keys(node).length === 1;

const followsPlainText = (editor: RuntimeEditor, point: Point) =>
  editor.read((state) => {
    const { path } = point;

    if (path.length < 2) {
      return false;
    }

    const blockPath = [path[0]];
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

export type UserTextLanding = 'pinned' | 'selection' | 'stored';

export const decideUserTextLanding = ({
  activeMarks,
  composed,
  hidden,
  plainLeaf,
}: Readonly<{
  activeMarks: boolean;
  composed: boolean;
  hidden: boolean;
  plainLeaf: boolean;
}>): UserTextLanding =>
  activeMarks
    ? 'selection'
    : composed && hidden
      ? 'stored'
      : plainLeaf
        ? 'pinned'
        : 'selection';

export const readUserTextLanding = ({
  composed,
  editor,
  marks,
  target,
}: {
  composed: boolean;
  editor: RuntimeEditor;
  marks?: EditorMarks | null;
  target: Range;
}): UserTextLanding => {
  const currentSelection = readRuntimeSelection(editor);
  const pending =
    marks !== undefined
      ? marks
      : SelectionApi.isText(currentSelection)
        ? (currentSelection.marks ?? null)
        : null;
  const point = target.anchor;
  const hidden =
    composed &&
    commandViewHides(
      editor,
      toInternalRoot(SelectionApi.root(target) ?? editor.read.view.root()),
      point
    );
  const plainLeaf = editor.read((state) => {
    const [node] =
      state.nodes.get(point.path) ??
      failInvariant(
        `Expected text insertion anchor at ${JSON.stringify(point.path)}`
      );

    return isUnmarkedTextNode(node);
  });
  const inheritsMarks =
    plainLeaf &&
    pending === null &&
    point.offset === 0 &&
    !followsPlainText(editor, point);
  const activeMarks = inheritsMarks
    ? hasActiveMarks(
        profilePliteReactDuration('model-text-input-read-marks', () =>
          editor.read((state) => state.marks())
        )
      )
    : hasActiveMarks(pending);

  return decideUserTextLanding({ activeMarks, composed, hidden, plainLeaf });
};
