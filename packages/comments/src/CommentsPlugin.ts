import { createPlugin } from '@udecode/plate-common';

import type { CommentsPluginOptions } from './types';

import { useHooksComments } from './useHooksComments';
import { withComments } from './withComments';

export const CommentsPlugin = createPlugin<'comment', CommentsPluginOptions>({
  isLeaf: true,
  key: 'comment',
  options: {
    hotkey: ['meta+shift+m', 'ctrl+shift+m'],
  },
  useHooks: useHooksComments,
  withOverrides: withComments,
});
