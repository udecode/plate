import {
  getPluginInjectProps,
  isBlock,
  PlateEditor,
  PlatePluginKey,
  setNodes,
  SetNodesOptions,
  TNodeMatch,
  unsetNodes,
  Value,
} from '@udecode/plate-core';
import { Editor } from 'slate';
import { KEY_ALIGN } from '../createAlignPlugin';
import { Alignment } from '../types';

export const setAlign = <V extends Value>(
  editor: PlateEditor<V>,
  {
    key = KEY_ALIGN,
    value,
    setNodesOptions,
  }: { value: Alignment; setNodesOptions?: SetNodesOptions } & PlatePluginKey
) => {
  const { validTypes, defaultNodeValue, nodeKey } = getPluginInjectProps(
    editor,
    key
  );

  const match: TNodeMatch = (n) =>
    isBlock(editor, n) && !!validTypes && validTypes.includes(n.type);

  if (value === defaultNodeValue) {
    unsetNodes(editor, nodeKey!, {
      match,
      ...setNodesOptions,
    });
  } else {
    setNodes(
      editor,
      { [nodeKey!]: value },
      {
        match,
        ...setNodesOptions,
      }
    );
  }
};
