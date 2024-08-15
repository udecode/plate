import { type PluginContext, createPlugin } from '@udecode/plate-common';

import { withRemoveEmptyNodes } from './withRemoveEmptyNodes';

export type RemoveEmptyNodesContext = PluginContext<{
  types?: string | string[];
}>;

/** @see {@link withRemoveEmptyNodes} */
export const RemoveEmptyNodesPlugin = createPlugin({
  key: 'removeEmptyNodes',
  withOverrides: withRemoveEmptyNodes,
}) satisfies RemoveEmptyNodesContext;
