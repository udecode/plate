import {
  BaseParagraphPlugin,
  type PluginConfig,
  type QueryNodeOptions,
  createTSlatePlugin,
} from '@udecode/plate-common';

import { withDelete } from './withDelete';

export type DeleteConfig = PluginConfig<
  'delete',
  {
    query?: QueryNodeOptions;
  }
>;

/** @see {@link withDelete} */
export const DeletePlugin = createTSlatePlugin<DeleteConfig>({
  extendEditor: withDelete,
  key: 'delete',
  options: {
    query: {
      allow: [BaseParagraphPlugin.key],
    },
  },
});
