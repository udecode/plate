import {
  ParagraphPlugin,
  type PluginConfig,
  type QueryNodeOptions,
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
  extendEditor: withTrailingBlock,
  key: 'trailingBlock',
  options: {
    level: 0,
  },
}).extend(({ editor }) => ({
  options: {
    type: editor.getType(ParagraphPlugin),
  },
}));
