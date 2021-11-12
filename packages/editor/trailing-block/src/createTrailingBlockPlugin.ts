import { ELEMENT_DEFAULT, QueryNodeOptions } from '@udecode/plate-common';
import { createPlugin, getPluginType } from '@udecode/plate-core';
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
 * @see {@link withTrailingNode}
 */
export const createTrailingBlockPlugin = createPlugin<TrailingBlockPlugin>({
  key: KEY_TRAILING_BLOCK,
  withOverrides: withTrailingBlock(),
  level: 0,
  then: (editor) => ({
    type: getPluginType(editor, ELEMENT_DEFAULT),
  }),
});
