import {
  type SetNodesOptions,
  type SlateEditor,
  getInjectMatch,
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
    value: Alignment;
    setNodesOptions?: SetNodesOptions<E>;
  }
) => {
  const { defaultNodeValue, nodeKey } = editor.getInjectProps(BaseAlignPlugin);

  const match = getInjectMatch(editor, editor.getPlugin(BaseAlignPlugin));

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
