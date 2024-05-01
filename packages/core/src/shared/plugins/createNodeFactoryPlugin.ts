import { ELEMENT_DEFAULT } from '../constants';
import { createPluginFactory } from '../utils/createPluginFactory';
import { getPluginType } from '../utils/index';

export const KEY_NODE_FACTORY = 'nodeFactory';

export const createNodeFactoryPlugin = createPluginFactory({
  key: KEY_NODE_FACTORY,
  withOverrides: (editor) => {
    editor.blockFactory = (node) => ({
      children: [{ text: '' }],
      type: getPluginType(editor, ELEMENT_DEFAULT),
      ...node,
    });
    editor.childrenFactory = () => [editor.blockFactory()];

    return editor;
  },
});
