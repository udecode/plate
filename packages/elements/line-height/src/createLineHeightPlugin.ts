import {
  createPluginFactory,
  ELEMENT_DEFAULT,
  getPluginType,
} from '@udecode/plate-core';

export const KEY_LINE_HEIGHT = 'lineHeight';

/**
 * Enables support for text alignment, useful to align your content
 * to left, right and center it.
 */
export const createLineHeightPlugin = createPluginFactory({
  key: KEY_LINE_HEIGHT,
  inject: {
    props: {
      nodeKey: KEY_LINE_HEIGHT,
      defaultNodeValue: 1.5,
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
