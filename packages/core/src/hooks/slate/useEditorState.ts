import { useSlate } from 'slate-react';
import { Value } from '../../../../slate-utils/src/slate/editor/TEditor';
import { PlateEditor } from '../../types/plate/PlateEditor';

/**
 * Typed {@link useSlate} & PlateEditor.
 * Needs to be called in a child component of `Plate`.
 * Else, use `usePlateEditorState`.
 */
export const useEditorState = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>() => (useSlate() as unknown) as E;
