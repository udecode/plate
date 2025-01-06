import { type UseHooks, useHotkeys } from '@udecode/plate/react';

import type { CommentsConfig } from './CommentsPlugin';

export const useHooksComments: UseHooks<CommentsConfig> = ({
  editor,
  setOption,
  tf,
}) => {
  useHotkeys(
    editor.shortcuts.toggleComment!.keys!,
    (e) => {
      if (!editor.selection) return;

      e.preventDefault();

      // block comments

      if (!editor.api.isExpanded()) return;

      tf.insert.comment();
      setOption('focusTextarea', true);
    },
    {
      enableOnContentEditable: true,
    }
  );
};
