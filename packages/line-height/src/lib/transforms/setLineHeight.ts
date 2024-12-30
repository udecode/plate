import {
  type SetNodesOptions,
  type SlateEditor,
  getInjectMatch,
  setElements,
  unsetNodes,
} from '@udecode/plate-common';

import { BaseLineHeightPlugin } from '../BaseLineHeightPlugin';

export const setLineHeight = (
  editor: SlateEditor,
  {
    setNodesOptions,
    value,
  }: { value: number; setNodesOptions?: SetNodesOptions }
): void => {
  const { defaultNodeValue, nodeKey } =
    editor.getInjectProps(BaseLineHeightPlugin);

  const match = getInjectMatch(editor, editor.getPlugin(BaseLineHeightPlugin));

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
