import { RangeApi } from '../..';
import { useEditorSelector } from './use-editor-selector';

/**
 * Get the current editor selection.
 * Only triggers a rerender when the selection actually changes
 */
export const useEditorSelection = () =>
  useEditorSelector((editor) => editor.read.selection(), {
    equalityFn: RangeApi.equals,
    profileId: 'editor-selection',
  });
