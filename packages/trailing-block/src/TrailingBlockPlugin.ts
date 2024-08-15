import {
  ParagraphPlugin,
  type QueryNodeOptions,
  createPlugin,
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
  options: {
    level: 0,
  },
  withOverrides: withTrailingBlock,
}).extend(({ editor }) => ({
  options: {
    type: editor.getType(ParagraphPlugin),
  },
}));
