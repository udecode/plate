import type { QueryNodeOptions } from '@udecode/slate';

import {
  type PluginConfig,
  BaseParagraphPlugin,
  createTSlatePlugin,
} from '@udecode/plate-core';

import { withTrailingBlock } from './withTrailingBlock';

export type TrailingBlockConfig = PluginConfig<
  'trailingBlock',
  {
    /** Level where the trailing node should be, the first level being 0. */
    level?: number;
    /** Type of the trailing block */
    type?: string;
  } & QueryNodeOptions
>;

/** @see {@link withTrailingBlock} */
export const TrailingBlockPlugin = createTSlatePlugin<TrailingBlockConfig>({
  key: 'trailingBlock',
  options: {
    level: 0,
  },
})
  .overrideEditor(withTrailingBlock)
  .extend(({ editor }) => ({
    options: {
      type: editor.getType(BaseParagraphPlugin),
    },
  }));
