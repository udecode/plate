import {
  setNodes,
  SetNodesOptions,
  TNodeMatch,
  unsetNodes,
} from '@udecode/plate-common';
import { getPlatePluginOptions, SPEditor } from '@udecode/plate-core';
import { Editor } from 'slate';
import { KEY_ALIGN } from '../defaults';
import { Alignment, AlignPluginOptions } from '../types';

export const setAlign = (
  editor: SPEditor,
  { value }: { value: Alignment },
  options?: SetNodesOptions
) => {
  const { validTypes, defaultNodeValue, nodeKey } = getPlatePluginOptions<
    Required<AlignPluginOptions>
  >(editor, KEY_ALIGN);

  const match: TNodeMatch = (n) =>
    Editor.isBlock(editor, n) && validTypes.includes(n.type);

  if (value === defaultNodeValue) {
    unsetNodes(editor, nodeKey, {
      match,
      ...options,
    });
  } else {
    setNodes(
      editor,
      { [nodeKey]: value },
      {
        match,
        ...options,
      }
    );
  }
};
