import {
  getPluginInjectProps,
  isBlock,
  PlateEditor,
  setElements,
  SetNodesOptions,
  TNodeMatch,
  unsetNodes,
  Value,
} from '@udecode/plate-common/server';

import { KEY_LINE_HEIGHT } from '../createLineHeightPlugin';

export const setLineHeight = <V extends Value>(
  editor: PlateEditor<V>,
  {
    value,
    setNodesOptions,
  }: { value: number; setNodesOptions?: SetNodesOptions<V> }
): void => {
  const { validTypes, defaultNodeValue, nodeKey } = getPluginInjectProps(
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
