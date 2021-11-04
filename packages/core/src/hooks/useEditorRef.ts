import { useSlateStatic } from 'slate-react';
import { PlateEditor } from '../types/SPEditor';

/**
 * Typed {@link useSlateStatic} & PlateEditor.
 * Needs to be called in a child component of `Plate`.
 * Else, use `useStoreEditorRef`.
 */
export const useEditorRef = <T = {}>() =>
  (useSlateStatic() as unknown) as PlateEditor<T>;
