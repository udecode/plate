import { type PluginConfig, createTPlugin } from '@udecode/plate-common';

import { withRemoveEmptyNodes } from './withRemoveEmptyNodes';

export type RemoveEmptyNodesConfig = PluginConfig<
  'removeEmptyNodes',
  {
    types?: string | string[];
  }
>;

/** @see {@link withRemoveEmptyNodes} */
export const RemoveEmptyNodesPlugin = createTPlugin<RemoveEmptyNodesConfig>({
  key: 'removeEmptyNodes',
  withOverrides: withRemoveEmptyNodes,
});
