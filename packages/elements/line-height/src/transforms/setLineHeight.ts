import {
  setNodes,
  SetNodesOptions,
  TNodeMatch,
  unsetNodes,
} from '@udecode/plate-common';
import { getPlatePluginOptions, SPEditor } from '@udecode/plate-core';
import { Editor } from 'slate';
import { KEY_LINE_HEIGHT } from '../defaults';
import { LineHeightPluginOptions } from '../types';

export const setLineHeight = (
  editor: SPEditor,
  {
    value,
    setNodesOptions,
  }: { value: number; setNodesOptions?: SetNodesOptions }
): void => {
  const { validTypes, defaultNodeValue, nodeKey } = getPlatePluginOptions<
    Required<LineHeightPluginOptions>
  >(editor, KEY_LINE_HEIGHT);

  const match: TNodeMatch = (n) =>
    Editor.isBlock(editor, n) && validTypes.includes(n.type);

  if (value === defaultNodeValue) {
    unsetNodes(editor, nodeKey, {
      match,
      ...setNodesOptions,
    });
  } else {
    setNodes(
      editor,
      { [nodeKey]: value },
      {
        match,
        ...setNodesOptions,
      }
    );
  }
};
