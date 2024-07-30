import { createPlugin } from '@udecode/plate-common/server';

import { withRemoveEmptyNodes } from './withRemoveEmptyNodes';

export interface RemoveEmptyNodesPluginOptions {
  types?: string | string[];
}

export const KEY_REMOVE_EMPTY_NODES = 'removeEmptyNodes';

/** @see {@link withRemoveEmptyNodes} */
export const RemoveEmptyNodesPlugin =
  createPlugin<RemoveEmptyNodesPluginOptions>({
    key: KEY_REMOVE_EMPTY_NODES,
    withOverrides: withRemoveEmptyNodes,
  });
