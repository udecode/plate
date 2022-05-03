import { useSlate } from 'slate-react';
import { Value } from '../slate/types/TEditor';
import { PlateEditor } from '../types/PlateEditor';

/**
 * Typed {@link useSlate} & PlateEditor.
 * Needs to be called in a child component of `Plate`.
 * Else, use `usePlateEditorState`.
 */
export const useEditorState = <V extends Value = Value, T = {}>() =>
  (useSlate() as unknown) as PlateEditor<V, T>;
