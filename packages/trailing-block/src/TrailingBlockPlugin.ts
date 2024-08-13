import {
  ParagraphPlugin,
  type QueryNodeOptions,
  createPlugin,
  getPluginType,
} from '@udecode/plate-common';

import { withTrailingBlock } from './withTrailingBlock';

export interface TrailingBlockPluginOptions extends QueryNodeOptions {
  /** Level where the trailing node should be, the first level being 0. */
  level?: number;

  /** Type of the trailing block */
  type?: string;
}

/** @see {@link withTrailingBlock} */
export const TrailingBlockPlugin = createPlugin<
  'trailingBlock',
  TrailingBlockPluginOptions
>({
  key: 'trailingBlock',
  withOverrides: withTrailingBlock,
}).extend(({ editor }) => ({
  options: {
    level: 0,
    type: getPluginType(editor, ParagraphPlugin.key),
  },
}));
