import {
  type PlateEditor,
  type SetNodesOptions,
  type TNodeMatch,
  getKeyByType,
  getPluginInjectProps,
  isBlock,
  setElements,
  unsetNodes,
} from '@udecode/plate-common';

import type { Alignment } from '../types';

import { AlignPlugin } from '../AlignPlugin';

export const setAlign = <E extends PlateEditor>(
  editor: E,
  {
    key = AlignPlugin.key,
    setNodesOptions,
    value,
  }: {
    key?: string;
    setNodesOptions?: SetNodesOptions<E>;
    value: Alignment;
  }
) => {
  const { defaultNodeValue, nodeKey, validPlugins } = getPluginInjectProps(
    editor,
    key
  );

  const match: TNodeMatch = (n) => {
    return (
      isBlock(editor, n) &&
      !!validPlugins &&
      validPlugins.includes(getKeyByType(editor, n.type as string))
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
