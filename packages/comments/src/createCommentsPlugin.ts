import { createPluginFactory } from '@udecode/plate-common';

import { MARK_COMMENT } from './constants';
import { CommentsPlugin } from './types';
import { useHooksComments } from './useHooksComments';
import { withComments } from './withComments';

export const createCommentsPlugin = createPluginFactory<CommentsPlugin>({
  key: MARK_COMMENT,
  isLeaf: true,
  withOverrides: withComments,
  useHooks: useHooksComments,
  options: {
    hotkey: ['meta+shift+m', 'ctrl+shift+m'],
  },
});
