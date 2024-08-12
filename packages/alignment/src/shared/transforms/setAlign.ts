import { type ValueOf, getKeyByType } from '@udecode/plate-common';
import {
  type ENode,
  type PlateEditor,
  type PlatePluginKey,
  type SetNodesOptions,
  type TNodeMatch,
  type Value,
  getPluginInjectProps,
  isBlock,
  setElements,
  unsetNodes,
} from '@udecode/plate-common';

import type { Alignment } from '../types';

import { KEY_ALIGN } from '../AlignPlugin';

export const setAlign = <E extends PlateEditor>(
  editor: E,
  {
    key = KEY_ALIGN,
    setNodesOptions,
    value,
  }: {
    setNodesOptions?: SetNodesOptions<ValueOf<E>>;
    value: Alignment;
  } & PlatePluginKey
) => {
  const { defaultNodeValue, nodeKey, validPlugins } = getPluginInjectProps(
    editor,
    key
  );

  const match: TNodeMatch<ENode<Value>> = (n) => {
    return (
      isBlock(editor, n) &&
      !!validPlugins &&
      validPlugins.includes(getKeyByType(editor, n.type as string))
    );
  };

  if (value === defaultNodeValue) {
    unsetNodes(editor, nodeKey!, {
      match,
      ...setNodesOptions,
    });
  } else {
    setElements(
      editor,
      { [nodeKey!]: value },
      {
        match: match as any,
        ...setNodesOptions,
      }
    );
  }
};
