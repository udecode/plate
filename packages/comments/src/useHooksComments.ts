import {
  isExpanded,
  PlateEditor,
  useHotkeys,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common';
import { useAddCommentMark, useCommentsActions } from './stores/index';
import { CommentsPlugin } from './types';

export const useHooksComments = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  { options }: WithPlatePlugin<CommentsPlugin>
) => {
  const { hotkey } = options;

  const addCommentMark = useAddCommentMark();
  const setFocusTextarea = useCommentsActions().focusTextarea();

  useHotkeys(
    hotkey!,
    (e) => {
      if (!editor.selection) return;

      e.preventDefault();

      // block comments

      if (!isExpanded(editor.selection)) return;

      addCommentMark();
      setFocusTextarea(true);
    },
    {
      enableOnContentEditable: true,
    }
  );
};
