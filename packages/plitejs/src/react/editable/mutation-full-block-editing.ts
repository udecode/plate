import {
  type EditorMarks,
  type Node,
  NodeApi,
  type Range,
  SelectionApi,
} from '../..';
import { commandViewHides } from '../../core/command-frame';
import { toInternalRoot } from '../../core/public-root';
import {
  failInvariant,
  type Editor as RuntimeEditor,
} from './runtime-editor-api';
import { readRuntimeSelection } from './runtime-selection-state';

const hasActiveMarks = (marks: Record<string, unknown> | null) =>
  !!marks && Object.keys(marks).length > 0;

export const isUnmarkedTextNode = (node: Node) =>
  NodeApi.isText(node) && Object.keys(node).length === 1;

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

  return decideUserTextLanding({
    activeMarks: hasActiveMarks(pending),
    composed,
    hidden,
    plainLeaf,
  });
};
