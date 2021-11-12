import {
  setNodes,
  SetNodesOptions,
  TNodeMatch,
  unsetNodes,
} from '@udecode/plate-common';
import { getPlugin, PlateEditor } from '@udecode/plate-core';
import { Editor } from 'slate';
import { KEY_ALIGN } from '../createAlignPlugin';
import { Alignment } from '../types';

export const setAlign = (
  editor: PlateEditor,
  { value }: { value: Alignment },
  options?: SetNodesOptions
) => {
  const { validTypes, defaultNodeValue, nodeKey } = getPlugin(
    editor,
    KEY_ALIGN
  );

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
