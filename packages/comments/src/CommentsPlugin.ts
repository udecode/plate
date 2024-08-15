import { type PluginConfig, createTPlugin } from '@udecode/plate-common';

import { useHooksComments } from './useHooksComments';
import { withComments } from './withComments';

export type CommentsConfig = PluginConfig<
  'comment',
  {
    hotkey?: string | string[];
  }
>;

export const CommentsPlugin = createTPlugin<CommentsConfig>({
  isLeaf: true,
  key: 'comment',
  options: {
    hotkey: ['meta+shift+m', 'ctrl+shift+m'],
  },
  useHooks: useHooksComments,
  withOverrides: withComments,
});
