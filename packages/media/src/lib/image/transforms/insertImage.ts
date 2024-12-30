import {
  type InsertNodesOptions,
  type SlateEditor,
  insertNodes,
} from '@udecode/plate-common';

import { type TImageElement, BaseImagePlugin } from '../BaseImagePlugin';

export const insertImage = (
  editor: SlateEditor,
  url: ArrayBuffer | string,
  options: InsertNodesOptions = {}
) => {
  const text = { text: '' };
  const image: TImageElement = {
    children: [text],
    type: editor.getType(BaseImagePlugin),
    url: url as any,
  };
  insertNodes<TImageElement>(editor, image, {
    nextBlock: true,
    ...(options as any),
  });
};
