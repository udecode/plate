import {
  setNodes,
  SetNodesOptions,
  TNodeMatch,
  unsetNodes,
} from '@udecode/plate-common';
import {
  getPluginInjectProps,
  PlateEditor,
  PlatePluginKey,
} from '@udecode/plate-core';
import { Editor } from 'slate';
import { KEY_ALIGN } from '../createAlignPlugin';
import { Alignment } from '../types';

export const setAlign = (
  editor: PlateEditor,
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
    Editor.isBlock(editor, n) && !!validTypes && validTypes.includes(n.type);

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
