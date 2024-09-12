import {
  type SetNodesOptions,
  type SlateEditor,
  type TNodeMatch,
  getKeyByType,
  isBlock,
  setElements,
  unsetNodes,
} from '@udecode/plate-common';

import type { Alignment } from '../types';

import { BaseAlignPlugin } from '../BaseAlignPlugin';

export const setAlign = <E extends SlateEditor>(
  editor: E,
  {
    setNodesOptions,
    value,
  }: {
    setNodesOptions?: SetNodesOptions<E>;
    value: Alignment;
  }
) => {
  const {
    inject: { targetPlugins },
  } = editor.getPlugin(BaseAlignPlugin);
  const { defaultNodeValue, nodeKey } = editor.getInjectProps(BaseAlignPlugin);

  const match: TNodeMatch = (n) => {
    return (
      isBlock(editor, n) &&
      !!targetPlugins &&
      targetPlugins.includes(getKeyByType(editor, n.type as string))
    );
  };

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
