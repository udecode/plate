import { createPluginFactory } from '@udecode/plate-common/server';

import { withRemoveEmptyNodes } from './withRemoveEmptyNodes';

export interface RemoveEmptyNodesPlugin {
  types?: string | string[];
}

/**
 * @see {@link withRemoveEmptyNodes}
 */
export const createRemoveEmptyNodesPlugin =
  createPluginFactory<RemoveEmptyNodesPlugin>({
    key: 'removeEmptyNodes',
    withOverrides: withRemoveEmptyNodes,
  });
