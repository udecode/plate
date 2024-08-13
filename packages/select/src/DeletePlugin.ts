import {
  ParagraphPlugin,
  type QueryNodeOptions,
  createPlugin,
} from '@udecode/plate-common';

import { withDelete } from './withDelete';

export type DeletePluginOptions = {
  query?: QueryNodeOptions;
};

/** @see {@link withDelete} */
export const DeletePlugin = createPlugin<'delete', DeletePluginOptions>({
  key: 'delete',
  options: {
    query: {
      allow: [ParagraphPlugin.key],
    },
  },
  withOverrides: withDelete,
});
