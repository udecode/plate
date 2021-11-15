import { ELEMENT_DEFAULT } from '@udecode/plate-common';
import { createPluginFactory, getPluginType } from '@udecode/plate-core';

export const KEY_ALIGN = 'align';

/**
 * Enables support for text alignment, useful to align your content
 * to left, right, center or justify.
 */
export const createAlignPlugin = createPluginFactory({
  key: KEY_ALIGN,
  inject: {
    props: {
      nodeKey: KEY_ALIGN,
      defaultNodeValue: 'left',
      styleKey: 'textAlign',
      validNodeValues: ['left', 'center', 'right', 'justify'],
    },
  },
  then: (editor) => ({
    inject: {
      props: {
        validTypes: [getPluginType(editor, ELEMENT_DEFAULT)],
      },
    },
  }),
});
