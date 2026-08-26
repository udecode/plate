import type { AnyEditor as Editor, Selection } from '../interfaces/editor';
import { RangeApi } from '../interfaces/range';
import { SelectionApi } from '../interfaces/selection';
import { MAIN_ROOT_KEY } from '../internal/root-location';
import { cloneEditorJsonValue } from './value-codec';

const CURRENT_SELECTION = new WeakMap<Editor, Selection>();
const CURRENT_SELECTION_ROOT = new WeakMap<Editor, string>();

export const getSelectionStateSelection = (editor: Editor): Selection =>
  cloneEditorJsonValue(
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
  const cloned = cloneEditorJsonValue(selection ?? null);

  if (!cloned) {
    return cloned;
  }

  if (SelectionApi.isNode(cloned)) {
    return SelectionApi.nodes(
      cloned.paths,
      root === MAIN_ROOT_KEY
        ? {
            anchorPath: cloned.anchorPath,
            focusPath: cloned.focusPath,
          }
        : {
            anchorPath: cloned.anchorPath,
            focusPath: cloned.focusPath,
            root,
          }
    );
  }

  if (!RangeApi.isRange(cloned)) {
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
    ...cloned,
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
  CURRENT_SELECTION.set(editor, normalizeSelectionRoot(selection, root));
  CURRENT_SELECTION_ROOT.set(editor, root);
};
