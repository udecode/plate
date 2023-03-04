import { Value } from '@udecode/slate-utils';
import { useSlate } from 'slate-react';
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
