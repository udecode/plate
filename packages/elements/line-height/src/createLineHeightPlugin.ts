import { ELEMENT_DEFAULT } from '@udecode/plate-common';
import { createPluginFactory, getPluginType } from '@udecode/plate-core';

export const KEY_LINE_HEIGHT = 'lineHeight';

/**
 * Enables support for text alignment, useful to align your content
 * to left, right and center it.
 */
export const createLineHeightPlugin = createPluginFactory({
  key: KEY_LINE_HEIGHT,
  inject: {
    props: {
      defaultNodeValue: 1.5,
      validNodeValues: [1, 1.2, 1.5, 2, 3],
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
