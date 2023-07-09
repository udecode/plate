import {
  ELEMENT_DEFAULT,
  QueryNodeOptions,
  createPluginFactory,
  getPluginType,
} from '@udecode/plate-common';

import { withTrailingBlock } from './withTrailingBlock';

export interface TrailingBlockPlugin extends QueryNodeOptions {
  /**
   * Level where the trailing node should be, the first level being 0.
   */
  level?: number;

  /**
   * Type of the trailing block
   */
  type?: string;
}

export const KEY_TRAILING_BLOCK = 'trailingBlock';

/**
 * @see {@link withTrailingBlock}
 */
export const createTrailingBlockPlugin =
  createPluginFactory<TrailingBlockPlugin>({
    key: KEY_TRAILING_BLOCK,
    withOverrides: withTrailingBlock,
    options: {
      level: 0,
    },
    then: (editor) => ({
      type: getPluginType(editor, ELEMENT_DEFAULT),
    }),
  });
