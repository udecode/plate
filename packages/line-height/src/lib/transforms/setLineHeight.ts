import {
  type SetNodesOptions,
  type SlateEditor,
  getInjectMatch,
} from '@udecode/plate';

import { BaseLineHeightPlugin } from '../BaseLineHeightPlugin';

export const setLineHeight = (
  editor: SlateEditor,
  {
    setNodesOptions,
    value,
  }: { value: number; setNodesOptions?: SetNodesOptions }
): void => {
  const { defaultNodeValue, nodeKey } =
    editor.getInjectProps(BaseLineHeightPlugin);

  const match = getInjectMatch(editor, editor.getPlugin(BaseLineHeightPlugin));

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
