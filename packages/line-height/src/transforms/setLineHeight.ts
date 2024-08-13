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

import { KEY_LINE_HEIGHT } from '../LineHeightPlugin';

export const setLineHeight = <E extends PlateEditor>(
  editor: E,
  {
    setNodesOptions,
    value,
  }: { setNodesOptions?: SetNodesOptions<E>; value: number }
): void => {
  const { defaultNodeValue, nodeKey, validPlugins } = getPluginInjectProps(
    editor,
    KEY_LINE_HEIGHT
  );

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
