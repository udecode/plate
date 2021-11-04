import { useSlate } from 'slate-react';
import { PlateEditor } from '../types/PlateEditor';

/**
 * Typed {@link useSlate} & PlateEditor.
 * Needs to be called in a child component of `Plate`.
 * Else, use `useStoreEditorState`.
 */
export const useEditorState = <T = {}>() =>
  (useSlate() as unknown) as PlateEditor<T>;
