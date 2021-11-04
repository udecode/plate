import { useSlate } from 'slate-react';
import { PlateEditor, TPlateEditor } from '../types/SPEditor';

/**
 * Typed {@link useSlate} & SPEditor.
 * Needs to be called in a child component of `Plate`.
 * Else, use `useStoreEditorState`.
 */
export const useEditorState = <T = TPlateEditor>() =>
  (useSlate() as unknown) as PlateEditor<T>;
