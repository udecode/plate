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

import { KEY_LINE_HEIGHT } from '../createLineHeightPlugin';

export const setLineHeight = <V extends Value>(
  editor: PlateEditor<V>,
  {
    setNodesOptions,
    value,
  }: { setNodesOptions?: SetNodesOptions<V>; value: number }
): void => {
  const { defaultNodeValue, nodeKey, validTypes } = getPluginInjectProps(
    editor,
    KEY_LINE_HEIGHT
  );

  const match: TNodeMatch = (n) =>
    isBlock(editor, n) && !!validTypes && validTypes.includes(n.type as string);

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
