import type { AnyEditor, RootKey } from '../interfaces/editor';
import { SelectionApi } from '../interfaces/selection';
import {
  getCurrentSelection,
  getCurrentSelectionRoot,
  getEditorUpdateRoot,
} from './public-state';

export const isSelectionInUpdateRoot = (
  editor: AnyEditor,
  targetRoot: RootKey = getEditorUpdateRoot(editor)
): boolean => {
  const selection = getCurrentSelection(editor);

  if (!selection) return false;

  const selectionRoot =
    SelectionApi.root(selection) ?? getCurrentSelectionRoot(editor);

  return selectionRoot === targetRoot;
};

export const isSelectionInOtherRoot = (
  editor: AnyEditor,
  targetRoot: RootKey = getEditorUpdateRoot(editor)
): boolean => {
  const selection = getCurrentSelection(editor);

  if (!selection) return false;

  const selectionRoot =
    SelectionApi.root(selection) ?? getCurrentSelectionRoot(editor);

  return selectionRoot !== targetRoot;
};

export const preservesSelectionForExplicitTarget = (
  editor: AnyEditor,
  hasExplicitAt: boolean,
  {
    preserveNull = false,
    targetRoot = getEditorUpdateRoot(editor),
  }: Readonly<{
    preserveNull?: boolean;
    targetRoot?: RootKey;
  }> = {}
): boolean => {
  if (!hasExplicitAt) return false;

  const selection = getCurrentSelection(editor);

  if (selection === null) return preserveNull;

  const selectionRoot =
    SelectionApi.root(selection) ?? getCurrentSelectionRoot(editor);

  return selectionRoot !== targetRoot;
};
