import { type PluginConfig, createTSlatePlugin } from '@udecode/plate-core';

import { KEYS } from '../../plate-keys';
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
    key: KEYS.removeEmptyNodes,
  }).overrideEditor(withRemoveEmptyNodes);
