import { createPluginFactory } from '@udecode/plate-common/server';

import type { CommentsPlugin } from './types';

import { MARK_COMMENT } from './constants';
import { useHooksComments } from './useHooksComments';
import { withComments } from './withComments';

export const createCommentsPlugin = createPluginFactory<CommentsPlugin>({
  isLeaf: true,
  key: MARK_COMMENT,
  options: {
    hotkey: ['meta+shift+m', 'ctrl+shift+m'],
  },
  useHooks: useHooksComments,
  withOverrides: withComments,
});
