import { createPluginFactory, QueryNodeOptions } from '@udecode/plate-common';

import { withCreateRemoveOnDeleteForward } from './withCreateRemoveOnDeleteForward';

export type RemoveOnDeleteForwardPlugin = {
  query?: QueryNodeOptions;
  removeNodeIfEmpty?: boolean;
};

export const KEY_FORWARD_DELETE_BEFORE_CODE_BLOCK = 'forwardDeleteBeforeCodeBlock';

/**
 * @see {@link withCreateRemoveOnDeleteForward}
 */
export const createRemoveOnDeleteForwardPlugin =
  createPluginFactory<RemoveOnDeleteForwardPlugin>({
    key: KEY_FORWARD_DELETE_BEFORE_CODE_BLOCK,
    withOverrides: withCreateRemoveOnDeleteForward,
    options: {
      removeNodeIfEmpty: true,
    },
  });
