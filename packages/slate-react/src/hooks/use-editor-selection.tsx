import { RangeApi, type Selection } from '@platejs/slate';

import { readRuntimeSelection } from '../editable/runtime-selection-state';
import { useEditorSelector } from './use-editor-selector';

/**
 * Get the current editor selection.
 * Only triggers a rerender when the selection actually changes
 */
export const useEditorSelection = () =>
  useEditorSelector(
    (editor) => readRuntimeSelection(editor),
    isSelectionEqual,
    { profileId: 'editor-selection' }
  );

const isSelectionEqual = (a: Selection, b: Selection) => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return RangeApi.equals(a, b);
};
