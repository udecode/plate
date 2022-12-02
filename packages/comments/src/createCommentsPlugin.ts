import { createPluginFactory } from '@udecode/plate-core';
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
    hotkey: 'command+shift+m',
  },
});
