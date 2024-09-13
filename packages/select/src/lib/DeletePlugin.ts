import {
  type PluginConfig,
  type QueryNodeOptions,
  BaseParagraphPlugin,
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
  key: 'delete',
  extendEditor: withDelete,
  options: {
    query: {
      allow: [BaseParagraphPlugin.key],
    },
  },
});
