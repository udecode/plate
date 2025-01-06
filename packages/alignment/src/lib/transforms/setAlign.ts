import {
  type SetNodesOptions,
  type SlateEditor,
  getInjectMatch,
} from '@udecode/plate';

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
    editor.tf.unsetNodes(nodeKey!, {
      match,
      ...setNodesOptions,
    });
  } else {
    editor.tf.setNodes(
      { [nodeKey!]: value },
      {
        match: match as any,
        ...setNodesOptions,
      }
    );
  }
};
