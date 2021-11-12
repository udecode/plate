import { ELEMENT_DEFAULT } from '@udecode/plate-common';
import { createPlugin, getPluginType } from '@udecode/plate-core';
import {
  DEFAULT_LINE_HEIGHT,
  DEFAULT_LINE_HEIGHTS,
  KEY_LINE_HEIGHT,
} from './defaults';

/**
 * Enables support for text alignment, useful to align your content
 * to left, right and center it.
 */
export const createLineHeightPlugin = createPlugin({
  key: KEY_LINE_HEIGHT,
  overrideProps: {
    nodeKey: KEY_LINE_HEIGHT,
    defaultNodeValue: DEFAULT_LINE_HEIGHT,
    validNodeValues: DEFAULT_LINE_HEIGHTS,
    validTypes: [],
  },
  withEditor: (editor) => ({
    overrideProps: {
      validTypes: [getPluginType(editor, ELEMENT_DEFAULT)],
    },
  }),
});
