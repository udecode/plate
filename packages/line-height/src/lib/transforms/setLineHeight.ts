import {
  type SetNodesOptions,
  type SlateEditor,
  getInjectMatch,
  setElements,
  unsetNodes,
} from '@udecode/plate-common';

import { BaseLineHeightPlugin } from '../BaseLineHeightPlugin';

export const setLineHeight = <E extends SlateEditor>(
  editor: E,
  {
    setNodesOptions,
    value,
  }: { value: number; setNodesOptions?: SetNodesOptions<E> }
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
