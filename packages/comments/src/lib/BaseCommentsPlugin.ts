import {
  type Path,
  type PluginConfig,
  createTSlatePlugin,
} from '@udecode/plate';

import { withComments } from './withComments';

export type CommentsPluginConfig = PluginConfig<
  'comment',
  {
    activeId: string | null;
    hotkey: string[] | string;
    hoverId: string | null;
    isOverlapWithEditor: boolean;
    uniquePathMap: Map<string, Path>;
    updateTimestamp: number | null;
  }
>;

export const BaseCommentsPlugin = createTSlatePlugin<CommentsPluginConfig>({
  key: 'comment',
  node: { isLeaf: true },
  options: {
    activeId: null,
    hotkey: ['meta+shift+m', 'ctrl+shift+m'],
    hoverId: null,
    isOverlapWithEditor: false,
    uniquePathMap: new Map(),
    updateTimestamp: null,
  },
}).overrideEditor(withComments);
