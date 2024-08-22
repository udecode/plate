import { Key, toPlatePlugin } from '@udecode/plate-common/react';

import { CommentsPlugin as BaseCommentsPlugin } from '../lib/CommentsPlugin';
import { useHooksComments } from './useHooksComments';

/** Enables support for comments in the editor. */
export const CommentsPlugin = toPlatePlugin(BaseCommentsPlugin, {
  shortcuts: {
    toggleComment: {
      keys: [[Key.Mod, Key.Shift, 'm']],
    },
  },
  useHooks: useHooksComments,
});
