import { createPluginFactory } from '@udecode/plate-common/server';

import { withRemoveEmptyNodes } from './withRemoveEmptyNodes';

export interface RemoveEmptyNodesPlugin {
  types?: string | string[];
}

export const REMOVE_EMPTY_NODES_KEY = 'removeEmptyNodes'

/** @see {@link withRemoveEmptyNodes} */
export const createRemoveEmptyNodesPlugin =
  createPluginFactory<RemoveEmptyNodesPlugin>({
    key: REMOVE_EMPTY_NODES_KEY,
    withOverrides: withRemoveEmptyNodes,
  });
