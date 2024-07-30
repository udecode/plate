import {
  ELEMENT_DEFAULT,
  type QueryNodeOptions,
  createPlugin,
} from '@udecode/plate-common/server';

import { withDelete } from './withDelete';

export type DeletePlugin = {
  query?: QueryNodeOptions;
};

export const KEY_DELETE = 'delete';

/** @see {@link withDelete} */
export const DeletePlugin = createPlugin<DeletePlugin>({
  key: KEY_DELETE,
  options: {
    query: {
      allow: [ELEMENT_DEFAULT],
    },
  },
  withOverrides: withDelete,
});
