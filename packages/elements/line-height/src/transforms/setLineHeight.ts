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
  { lineHeight }: LineHeightPluginOptions & { lineHeight: number },
  options?: SetNodesOptions
): void => {
  const { types, defaultLineHeight } = getPlatePluginOptions<
    Required<LineHeightPluginOptions>
  >(editor, KEY_LINE_HEIGHT);

  const match: TNodeMatch = (n) =>
    Editor.isBlock(editor, n) && types.includes(n.type);

  if (lineHeight === defaultLineHeight) {
    unsetNodes(editor, 'lineHeight', {
      match,
      ...options,
    });
  } else {
    setNodes(
      editor,
      { lineHeight },
      {
        match,
        ...options,
      }
    );
  }
};
