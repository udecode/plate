import { Value } from '@udecode/slate-utils';
import { useSlateStatic } from 'slate-react';
import { PlateEditor } from '../../types/plate/PlateEditor';

/**
 * Typed {@link useSlateStatic} & PlateEditor.
 * Needs to be called in a child component of `Plate`.
 * Else, use `usePlateEditorRef`.
 */
export const useEditorRef = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>() => (useSlateStatic() as unknown) as E;
