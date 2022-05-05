import {
  getPluginInjectProps,
  isBlock,
  PlateEditor,
  setNodes,
  SetNodesOptions,
  TNodeMatch,
  unsetNodes,
  Value,
} from '@udecode/plate-core';
import { Editor } from 'slate';
import { KEY_LINE_HEIGHT } from '../createLineHeightPlugin';

export const setLineHeight = <V extends Value>(
  editor: PlateEditor<V>,
  {
    value,
    setNodesOptions,
  }: { value: number; setNodesOptions?: SetNodesOptions }
): void => {
  const { validTypes, defaultNodeValue, nodeKey } = getPluginInjectProps(
    editor,
    KEY_LINE_HEIGHT
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
