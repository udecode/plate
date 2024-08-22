import type { EElement, TElement, Value } from '@udecode/slate';

import type { WithOverride } from '../types/index';

import { ELEMENT_DEFAULT } from '../constants';
import { createPluginFactory } from '../utils/createPluginFactory';
import { getPluginType } from '../utils/index';

export const KEY_NODE_FACTORY = 'nodeFactory';

export type NodeFactoryPlugiin = {
  createBlock?: <V extends Value = Value>(
    node?: Partial<TElement>
  ) => EElement<V>;
};

export const withNodeFactory: WithOverride<NodeFactoryPlugiin> = (
  editor,
  { options }
) => {
  editor.blockFactory = (node) => ({
    children: [{ text: '' }],
    type: getPluginType(editor, ELEMENT_DEFAULT),
    ...(options.createBlock?.(node) ?? node),
  });
  editor.childrenFactory = () => [editor.blockFactory()];

  return editor;
};

export const createNodeFactoryPlugin = createPluginFactory<NodeFactoryPlugiin>({
  key: KEY_NODE_FACTORY,
  withOverrides: withNodeFactory,
});
