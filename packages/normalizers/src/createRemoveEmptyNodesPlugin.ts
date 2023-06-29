import { createPluginFactory } from '@udecode/plate-common';

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
