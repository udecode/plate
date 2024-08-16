import {
  type PlateEditor,
  type SetNodesOptions,
  type TNodeMatch,
  getKeyByType,
  isBlock,
  setElements,
  unsetNodes,
} from '@udecode/plate-common';

import { LineHeightPlugin } from '../LineHeightPlugin';

export const setLineHeight = <E extends PlateEditor>(
  editor: E,
  {
    setNodesOptions,
    value,
  }: { setNodesOptions?: SetNodesOptions<E>; value: number }
): void => {
  const { defaultNodeValue, nodeKey, validPlugins } =
    editor.getInjectProps(LineHeightPlugin);

  const match: TNodeMatch = (n) =>
    isBlock(editor, n) &&
    !!validPlugins &&
    validPlugins.includes(getKeyByType(editor, n.type as string));

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
