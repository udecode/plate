import { type PluginConfig, createTSlatePlugin } from '@udecode/plate-common';

import { withRemoveEmptyNodes } from './withRemoveEmptyNodes';

export type RemoveEmptyNodesConfig = PluginConfig<
  'removeEmptyNodes',
  {
    types?: string[] | string;
  }
>;

/** @see {@link withRemoveEmptyNodes} */
export const RemoveEmptyNodesPlugin =
  createTSlatePlugin<RemoveEmptyNodesConfig>({
    key: 'removeEmptyNodes',
    extendEditor: withRemoveEmptyNodes,
  });
