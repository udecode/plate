import { PlateEditor, Value, WithPlatePlugin } from '@udecode/plate-core';
import { CommentsPlugin } from './types';

export const useHooksComments = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  { options }: WithPlatePlugin<CommentsPlugin>
) => {
  // useEditorState()
};
