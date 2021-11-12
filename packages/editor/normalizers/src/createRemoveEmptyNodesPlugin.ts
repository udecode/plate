import { createPlugin } from '@udecode/plate-core';
import { withRemoveEmptyNodes } from './withRemoveEmptyNodes';

export interface RemoveEmptyNodesPlugin {
  types?: string | string[];
}

/**
 * @see {@link withRemoveEmptyNodes}
 */
export const createRemoveEmptyNodesPlugin = createPlugin<RemoveEmptyNodesPlugin>(
  {
    key: 'removeEmptyNodes',
    withOverrides: withRemoveEmptyNodes(),
  }
);
