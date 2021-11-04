import { useSlateStatic } from 'slate-react';
import { PlateEditor, TPlateEditor } from '../types/SPEditor';

/**
 * Typed {@link useSlateStatic} & SPEditor.
 * Needs to be called in a child component of `Plate`.
 * Else, use `useStoreEditorRef`.
 */
export const useEditorRef = <T = TPlateEditor>() =>
  (useSlateStatic() as unknown) as PlateEditor<T>;
