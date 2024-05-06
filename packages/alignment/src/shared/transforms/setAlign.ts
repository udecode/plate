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
} from '@udecode/plate-common/server';

import type { Alignment } from '../types';

import { KEY_ALIGN } from '../createAlignPlugin';

export const setAlign = <V extends Value>(
  editor: PlateEditor<V>,
  {
    key = KEY_ALIGN,
    setNodesOptions,
    value,
  }: { setNodesOptions?: SetNodesOptions<V>; value: Alignment } & PlatePluginKey
) => {
  const { defaultNodeValue, nodeKey, validTypes } = getPluginInjectProps(
    editor,
    key
  );

  const match: TNodeMatch<ENode<Value>> = (n) => {
    return (
      isBlock(editor, n) &&
      !!validTypes &&
      validTypes.includes(n.type as string)
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
