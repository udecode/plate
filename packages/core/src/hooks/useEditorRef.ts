import { useSlateStatic } from 'slate-react';
import { PlateEditor } from '../types/PlateEditor';

/**
 * Typed {@link useSlateStatic} & PlateEditor.
 * Needs to be called in a child component of `Plate`.
 * Else, use `usePlateEditorRef`.
 */
export const useEditorRef = <T = {}>() =>
  (useSlateStatic() as unknown) as PlateEditor<T>;
