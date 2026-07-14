import type { BaseEditor } from '@platejs/core';
import type { NodeInsertNodesOptions } from '@platejs/plite';
import type { TImageElement } from '@platejs/utils';
import { KEYS } from '@platejs/utils';

export const insertImage = (
  editor: BaseEditor,
  url: ArrayBuffer | string,
  options: NodeInsertNodesOptions<TImageElement> = {}
) => {
  const text = { text: '' };
  const image: TImageElement = {
    children: [text],
    type: editor.getType(KEYS.img),
    url: url as any,
  };
  editor.update.blocks.insertAfter(image, options);
};
