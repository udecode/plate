import {
  type SetNodesOptions,
  type SlateEditor,
  type TNodeMatch,
  getKeyByType,
  isBlock,
  setElements,
  unsetNodes,
} from '@udecode/plate-common';

import { LineHeightPlugin } from '../LineHeightPlugin';

export const setLineHeight = <E extends SlateEditor>(
  editor: E,
  {
    setNodesOptions,
    value,
  }: { setNodesOptions?: SetNodesOptions<E>; value: number }
): void => {
  const {
    inject: { targetPlugins },
  } = editor.getPlugin(LineHeightPlugin);
  const { defaultNodeValue, nodeKey } = editor.getInjectProps(LineHeightPlugin);

  const match: TNodeMatch = (n) =>
    isBlock(editor, n) &&
    !!targetPlugins &&
    targetPlugins.includes(getKeyByType(editor, n.type as string));

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
