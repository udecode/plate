import { useHotkeys } from '@udecode/plate-common';
import {
  type PlatePluginUseHooks,
  isExpanded,
} from '@udecode/plate-common/server';

import type { CommentsPluginOptions } from './types';

import { useAddCommentMark, useCommentsActions } from './stores';

export const useHooksComments: PlatePluginUseHooks<CommentsPluginOptions> = ({
  editor,
  plugin: {
    options: { hotkey },
  },
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
