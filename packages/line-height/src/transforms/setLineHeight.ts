import { getKeyByType } from '@udecode/plate-common';
import {
  type PlateEditor,
  type SetNodesOptions,
  type TNodeMatch,
  type Value,
  getPluginInjectProps,
  isBlock,
  setElements,
  unsetNodes,
} from '@udecode/plate-common/server';

import { KEY_LINE_HEIGHT } from '../LineHeightPlugin';

export const setLineHeight = <V extends Value>(
  editor: PlateEditor<V>,
  {
    setNodesOptions,
    value,
  }: { setNodesOptions?: SetNodesOptions<V>; value: number }
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
