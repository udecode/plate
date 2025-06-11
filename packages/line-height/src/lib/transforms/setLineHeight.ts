import {
  type SetNodesOptions,
  type SlateEditor,
  getInjectMatch,
  KEYS,
} from 'platejs';

import { BaseLineHeightPlugin } from '../BaseLineHeightPlugin';

export const setLineHeight = (
  editor: SlateEditor,
  value: number,
  setNodesOptions?: SetNodesOptions
): void => {
  const { defaultNodeValue, nodeKey } =
    editor.getInjectProps(BaseLineHeightPlugin);

  const match = getInjectMatch(
    editor,
    editor.getPlugin({ key: KEYS.lineHeight })
  );

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
