import {
  type SetNodesOptions,
  type SlateEditor,
  getInjectMatch,
  setElements,
  unsetNodes,
} from '@udecode/plate-common';

import type { Alignment } from '../types';

import { BaseAlignPlugin } from '../BaseAlignPlugin';

export const setAlign = (
  editor: SlateEditor,
  {
    setNodesOptions,
    value,
  }: {
    value: Alignment;
    setNodesOptions?: SetNodesOptions;
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
