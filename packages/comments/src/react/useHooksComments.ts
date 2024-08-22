import { isExpanded } from '@udecode/plate-common';
import { type PlateUseHooks, useHotkeys } from '@udecode/plate-common/react';

import { useAddCommentMark, useCommentsActions } from './stores';

export const useHooksComments: PlateUseHooks = ({ editor }) => {
  const addCommentMark = useAddCommentMark();
  const setFocusTextarea = useCommentsActions().focusTextarea();

  useHotkeys(
    editor.shortcuts.toggleComment!.keys!,
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
