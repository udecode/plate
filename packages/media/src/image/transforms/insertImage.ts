import {
  type InsertNodesOptions,
  type PlateEditor,
  getPluginType,
  insertNodes,
} from '@udecode/plate-common';

import type { TImageElement } from '../types';

import { ImagePlugin } from '../ImagePlugin';

export const insertImage = <E extends PlateEditor>(
  editor: E,
  url: ArrayBuffer | string,
  options: InsertNodesOptions<E> = {}
) => {
  const text = { text: '' };
  const image: TImageElement = {
    children: [text],
    type: getPluginType(editor, ImagePlugin.key),
    url: url as any,
  };
  insertNodes<TImageElement>(editor, image, {
    nextBlock: true,
    ...(options as any),
  });
};
