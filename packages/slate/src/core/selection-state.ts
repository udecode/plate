import type { Editor, EditorMarks, Selection } from '../interfaces/editor';
import { MAIN_ROOT_KEY } from '../internal/root-location';
import { cloneValue } from './clone';

const CURRENT_MARKS = new WeakMap<Editor, EditorMarks | null>();
const CURRENT_SELECTION = new WeakMap<Editor, Selection>();
const CURRENT_SELECTION_ROOT = new WeakMap<Editor, string>();

export const getSelectionStateMarks = (editor: Editor): EditorMarks | null =>
  cloneValue(
    CURRENT_MARKS.has(editor)
      ? (CURRENT_MARKS.get(editor) as EditorMarks | null)
      : null
  );

export const setSelectionStateMarks = (
  editor: Editor,
  marks: EditorMarks | null
) => {
  CURRENT_MARKS.set(editor, cloneValue(marks ?? null));
};

export const getSelectionStateSelection = (editor: Editor): Selection =>
  cloneValue(
    CURRENT_SELECTION.has(editor)
      ? (CURRENT_SELECTION.get(editor) as Selection)
      : null
  );

export const getSelectionStateRoot = (editor: Editor): string =>
  CURRENT_SELECTION_ROOT.get(editor) ?? MAIN_ROOT_KEY;

const normalizeSelectionRoot = (
  selection: Selection,
  root: string
): Selection => {
  const cloned = cloneValue(selection ?? null);

  if (!cloned) {
    return cloned;
  }

  const normalizePointRoot = <TPoint extends { root?: string }>(
    point: TPoint
  ) => {
    const { root: _root, ...pointWithoutRoot } = point;

    return root === MAIN_ROOT_KEY
      ? pointWithoutRoot
      : { ...pointWithoutRoot, root };
  };

  return {
    anchor: normalizePointRoot(cloned.anchor),
    focus: normalizePointRoot(cloned.focus),
  };
};

export const setSelectionStateSelection = (
  editor: Editor,
  selection: Selection,
  root: string
) => {
  CURRENT_SELECTION.set(editor, normalizeSelectionRoot(selection, root));
  CURRENT_SELECTION_ROOT.set(editor, root);
};

export const initializeSelectionState = (
  editor: Editor,
  selection: Selection,
  root: string
) => {
  CURRENT_SELECTION.set(editor, selection);
  CURRENT_SELECTION_ROOT.set(editor, root);
  CURRENT_MARKS.set(editor, null);
};
