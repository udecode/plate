import { createPluginFactory } from '@udecode/plate-common/server';

import { withRemoveEmptyNodes } from './withRemoveEmptyNodes';

export interface RemoveEmptyNodesPlugin {
  types?: string | string[];
}

export const KEY_REMOVE_EMPTY_NODES = 'removeEmptyNodes'

/** @see {@link withRemoveEmptyNodes} */
export const createRemoveEmptyNodesPlugin =
  createPluginFactory<RemoveEmptyNodesPlugin>({
    key: KEY_REMOVE_EMPTY_NODES,
    withOverrides: withRemoveEmptyNodes,
  });
