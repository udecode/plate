import { ELEMENT_DEFAULT } from '@udecode/plate-common';
import { createPlugin, getPluginType } from '@udecode/plate-core';
import { DEFAULT_ALIGNMENT, DEFAULT_ALIGNMENTS, KEY_ALIGN } from './defaults';

/**
 * Enables support for text alignment, useful to align your content
 * to left, right, center or justify.
 */
export const createAlignPlugin = createPlugin({
  key: KEY_ALIGN,
  overrideProps: {
    nodeKey: KEY_ALIGN,
    defaultNodeValue: DEFAULT_ALIGNMENT,
    styleKey: 'textAlign',
    validNodeValues: DEFAULT_ALIGNMENTS,
    validTypes: [],
  },
  withEditor: (editor) => ({
    overrideProps: {
      validTypes: [getPluginType(editor, ELEMENT_DEFAULT)],
    },
  }),
});
