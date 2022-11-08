import { ELEMENT_DEFAULT } from '../types/index';
import { getPluginType } from '../utils/index';
import { createPluginFactory } from '../utils/plate/createPluginFactory';

export const KEY_NODE_FACTORY = 'nodeFactory';

export const createNodeFactoryPlugin = createPluginFactory({
  key: KEY_NODE_FACTORY,
  withOverrides: (editor) => {
    editor.blockFactory = (node) => ({
      type: getPluginType(editor, ELEMENT_DEFAULT),
      children: [{ text: '' }],
      ...node,
    });
    editor.childrenFactory = () => [editor.blockFactory()];

    return editor;
  },
});
