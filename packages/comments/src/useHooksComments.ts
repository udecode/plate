import { type PlatePluginUseHooks, isExpanded } from '@udecode/plate-common';
import { useHotkeys } from '@udecode/plate-common/react';

import type { CommentsConfig } from './CommentsPlugin';

import { useAddCommentMark, useCommentsActions } from './stores';

export const useHooksComments: PlatePluginUseHooks<CommentsConfig> = ({
  editor,
  options: { hotkey },
}) => {
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
