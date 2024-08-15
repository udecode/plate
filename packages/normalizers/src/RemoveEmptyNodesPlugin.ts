import { type PluginConfig, createPlugin } from '@udecode/plate-common';

import { withRemoveEmptyNodes } from './withRemoveEmptyNodes';

export type RemoveEmptyNodesConfig = PluginConfig<
  'removeEmptyNodes',
  {
    types?: string | string[];
  }
>;

/** @see {@link withRemoveEmptyNodes} */
export const RemoveEmptyNodesPlugin = createPlugin({
  key: 'removeEmptyNodes',
  withOverrides: withRemoveEmptyNodes,
}) satisfies RemoveEmptyNodesConfig;
