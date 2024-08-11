import type { TElement } from '@udecode/slate';
import type { Path } from 'slate';

import { ELEMENT_DEFAULT } from '../constants';
import { createPlugin } from '../plugin';
import { getPluginType } from '../plugin/getPlugin';

export const KEY_NODE_FACTORY = 'nodeFactory';

export const NodeFactoryPlugin = createPlugin({
  key: KEY_NODE_FACTORY,
  withOverrides: ({ editor }) => {
    // TODO
    editor.blockFactory = (node) => ({
      children: [{ text: '' }],
      type: getPluginType(editor, ELEMENT_DEFAULT),
      ...node,
    });
    editor.childrenFactory = () => [editor.blockFactory()];

    return editor;
  },
})
  .extendApi(({ editor }) => ({
    blockFactory: (node?: Partial<TElement>, _path?: Path) => ({
      children: [{ text: '' }],
      type: getPluginType(editor, ELEMENT_DEFAULT),
      ...node,
    }),
  }))
  .extendApi(({ plugin: { api } }) => ({
    childrenFactory: () => [api.blockFactory()],
  }));
