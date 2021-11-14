import {
  setNodes,
  SetNodesOptions,
  TNodeMatch,
  unsetNodes,
} from '@udecode/plate-common';
import { getPlugin, PlateEditor } from '@udecode/plate-core';
import { Editor } from 'slate';
import { KEY_LINE_HEIGHT } from '../createLineHeightPlugin';

export const setLineHeight = (
  editor: PlateEditor,
  {
    value,
    setNodesOptions,
  }: { value: number; setNodesOptions?: SetNodesOptions }
): void => {
  const { overrideProps = {} } = getPlugin(editor, KEY_LINE_HEIGHT);
  const { validTypes, defaultNodeValue, nodeKey } = overrideProps;

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
