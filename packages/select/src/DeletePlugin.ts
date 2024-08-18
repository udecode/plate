import {
  ParagraphPlugin,
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
  key: 'delete',
  options: {
    query: {
      allow: [ParagraphPlugin.key],
    },
  },
  withOverrides: withDelete,
});
