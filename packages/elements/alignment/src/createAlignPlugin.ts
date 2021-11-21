import {
  createPluginFactory,
  ELEMENT_DEFAULT,
  getPluginType,
} from '@udecode/plate-core';

export const KEY_ALIGN = 'align';

/**
 * Creates a plugin that adds alignment functionality to the editor.
 */
export const createAlignPlugin = createPluginFactory({
  key: KEY_ALIGN,
  then: (editor) => ({
    inject: {
      props: {
        nodeKey: KEY_ALIGN,
        defaultNodeValue: 'left',
        styleKey: 'textAlign',
        validNodeValues: ['left', 'center', 'right', 'justify'],
        validTypes: [getPluginType(editor, ELEMENT_DEFAULT)],
      },
    },
  }),
});
