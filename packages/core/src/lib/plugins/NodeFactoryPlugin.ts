import type { TElement, Value } from '@udecode/slate';
import type { Path } from 'slate';

import { ELEMENT_DEFAULT } from '../constants';
import { createPlugin } from '../plugin';
import { getPluginType } from '../plugin/getPlugin';

export const NodeFactoryPlugin = createPlugin({
  key: 'nodeFactory',
})
  .extendApi(({ editor }) => ({
    /** Default block factory. */
    blockFactory: (node?: Partial<TElement>, _path?: Path): TElement => ({
      children: [{ text: '' }],
      type: getPluginType(editor, ELEMENT_DEFAULT),
      ...node,
    }),
  }))
  .extendApi(({ plugin: { api } }) => ({
    /** Editor children factory. */
    childrenFactory: (): Value => [api.blockFactory()],
  }));
