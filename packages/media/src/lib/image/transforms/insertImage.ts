import type { InsertNodesOptions, SlateEditor } from '@udecode/plate';

import { KEYS } from '@udecode/plate';

import type { TImageElement } from '../BaseImagePlugin';

export const insertImage = (
  editor: SlateEditor,
  url: ArrayBuffer | string,
  options: InsertNodesOptions = {}
) => {
  const text = { text: '' };
  const image: TImageElement = {
    children: [text],
    type: editor.getType(KEYS.img),
    url: url as any,
  };
  editor.tf.insertNodes<TImageElement>(image, {
    nextBlock: true,
    ...(options as any),
  });
};
