import {
  type SetNodesOptions,
  type SlateEditor,
  getInjectMatch,
  KEYS,
} from '@udecode/plate';

import { BaseTextAlignPlugin } from '../BaseTextAlignPlugin';

export type Alignment =
  | 'center'
  | 'end'
  | 'justify'
  | 'left'
  | 'right'
  | 'start';

export const setAlign = (
  editor: SlateEditor,
  {
    value,
    ...setNodesOptions
  }: {
    value: Alignment;
  } & SetNodesOptions
) => {
  const { defaultNodeValue, nodeKey } =
    editor.getInjectProps(BaseTextAlignPlugin);

  const match = getInjectMatch(
    editor,
    editor.getPlugin({ key: KEYS.textAlign })
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
