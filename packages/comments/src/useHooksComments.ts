import { useHotkeys } from '@udecode/plate-common';
import {
  type PlateEditor,
  type Value,
  type WithPlatePlugin,
  isExpanded,
} from '@udecode/plate-common/server';

import type { CommentsPlugin } from './types';

import { useAddCommentMark, useCommentsActions } from './stores';

export const useHooksComments = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
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
