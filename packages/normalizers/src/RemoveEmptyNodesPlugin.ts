import { createPlugin } from '@udecode/plate-common';

import { withRemoveEmptyNodes } from './withRemoveEmptyNodes';

export interface RemoveEmptyNodesPluginOptions {
  types?: string | string[];
}

/** @see {@link withRemoveEmptyNodes} */
export const RemoveEmptyNodesPlugin = createPlugin<
  'removeEmptyNodes',
  RemoveEmptyNodesPluginOptions
>({
  key: 'removeEmptyNodes',
  withOverrides: withRemoveEmptyNodes,
});
