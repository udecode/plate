import {
  type ENode,
  type PlateEditor,
  type SetNodesOptions,
  type TNodeMatch,
  type Value,
  type ValueOf,
  getKeyByType,
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
    key?: string;
    setNodesOptions?: SetNodesOptions<ValueOf<E>>;
    value: Alignment;
  }
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
