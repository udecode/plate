import {
  type PluginConfig,
  type QueryNodeOptions,
  BaseParagraphPlugin,
  createTSlatePlugin,
} from '@udecode/plate-common';

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
  extendEditor: withTrailingBlock,
  options: {
    level: 0,
  },
}).extend(({ editor }) => ({
  options: {
    type: editor.getType(BaseParagraphPlugin),
  },
}));
