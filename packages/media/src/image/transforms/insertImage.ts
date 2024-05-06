import {
  type InsertNodesOptions,
  type PlateEditor,
  type Value,
  getPluginType,
  insertNodes,
} from '@udecode/plate-common/server';

import type { TImageElement } from '../types';

import { ELEMENT_IMAGE } from '../createImagePlugin';

export const insertImage = <V extends Value>(
  editor: PlateEditor<V>,
  url: ArrayBuffer | string,
  options: InsertNodesOptions<V> = {}
) => {
  const text = { text: '' };
  const image: TImageElement = {
    children: [text],
    type: getPluginType(editor, ELEMENT_IMAGE),
    url: url as any,
  };
  insertNodes<TImageElement>(editor, image, {
    nextBlock: true,
    ...(options as any),
  });
};
