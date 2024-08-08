import { ELEMENT_DEFAULT } from '../constants';
import { createPlugin, getPluginType } from '../utils/index';

export const KEY_NODE_FACTORY = 'nodeFactory';

export const NodeFactoryPlugin = createPlugin({
  key: KEY_NODE_FACTORY,
  withOverrides: ({ editor }) => {
    editor.blockFactory = (node) => ({
      children: [{ text: '' }],
      type: getPluginType(editor, ELEMENT_DEFAULT),
      ...node,
    });
    editor.childrenFactory = () => [editor.blockFactory()];

    return editor;
  },
});
