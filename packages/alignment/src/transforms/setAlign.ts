import {
  ENode,
  PlateEditor,
  PlatePluginKey,
  SetNodesOptions,
  TNodeMatch,
  Value,
  getPluginInjectProps,
  isBlock,
  setElements,
  unsetNodes,
} from '@udecode/plate-common';

import { KEY_ALIGN } from '../createAlignPlugin';
import { Alignment } from '../types';

export const setAlign = <V extends Value>(
  editor: PlateEditor<V>,
  {
    key = KEY_ALIGN,
    value,
    setNodesOptions,
  }: { value: Alignment; setNodesOptions?: SetNodesOptions<V> } & PlatePluginKey
) => {
  const { validTypes, defaultNodeValue, nodeKey } = getPluginInjectProps(
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
