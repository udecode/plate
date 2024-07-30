import {
  ELEMENT_DEFAULT,
  type QueryNodeOptions,
  createPlugin,
  getPluginType,
} from '@udecode/plate-common/server';

import { withTrailingBlock } from './withTrailingBlock';

export interface TrailingBlockPlugin extends QueryNodeOptions {
  /** Level where the trailing node should be, the first level being 0. */
  level?: number;

  /** Type of the trailing block */
  type?: string;
}

export const KEY_TRAILING_BLOCK = 'trailingBlock';

/** @see {@link withTrailingBlock} */
export const TrailingBlockPlugin = createPlugin<TrailingBlockPlugin>({
  key: KEY_TRAILING_BLOCK,
  withOverrides: withTrailingBlock,
}).extend((editor) => ({
  options: {
    level: 0,
    type: getPluginType(editor, ELEMENT_DEFAULT),
  },
}));
