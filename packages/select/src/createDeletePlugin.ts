import { createPluginFactory, QueryNodeOptions } from '@udecode/plate-common';

import { withDelete } from './withDelete';

export type DeletePlugin = {
  query?: QueryNodeOptions;
};

export const KEY_FORWARD_DELETE = 'forwardDeleteBeforeCodeBlock';

/**
 * @see {@link withDelete}
 */
export const createDeletePlugin =
  createPluginFactory<DeletePlugin>({
    key: KEY_FORWARD_DELETE,
    withOverrides: withDelete,
  });
