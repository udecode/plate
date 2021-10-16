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
  { align }: AlignPluginOptions & { align: Alignment },
  options?: SetNodesOptions
) => {
  const { types, defaultAlignment } = getPlatePluginOptions<
    Required<AlignPluginOptions>
  >(editor, KEY_ALIGN);

  const match: TNodeMatch = (n) =>
    Editor.isBlock(editor, n) && types.includes(n.type);

  if (align === defaultAlignment) {
    unsetNodes(editor, 'align', {
      match,
      ...options,
    });
  } else {
    setNodes(
      editor,
      { align },
      {
        match,
        ...options,
      }
    );
  }
};
