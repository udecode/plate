import type { NodeInsertNodesOptions } from '@platejs/slate';
import type { SlateEditor, TImageElement } from 'platejs';

import { KEYS, PathApi } from 'platejs';

type InsertNodesOptions = NodeInsertNodesOptions<TImageElement> & {
  nextBlock?: boolean;
};

const getNextBlockInsertLocation = (
  editor: SlateEditor,
  at: InsertNodesOptions['at']
) => {
  const location = at ?? editor.selection;

  if (!location) return at;

  const endPoint = editor.api.end(location);
  const blockEntry = endPoint ? editor.api.block({ at: endPoint }) : undefined;

  return blockEntry ? PathApi.next(blockEntry[1]) : at;
};

export const insertImage = (
  editor: SlateEditor,
  url: ArrayBuffer | string,
  options: InsertNodesOptions = {}
) => {
  const { nextBlock = true, ...insertOptions } = options;
  const text = { text: '' };
  const image: TImageElement = {
    children: [text],
    type: editor.getType(KEYS.img),
    url: url as TImageElement['url'],
  };
  editor.update((tx) => {
    tx.nodes.insert<TImageElement>(image, {
      ...insertOptions,
      at: nextBlock
        ? getNextBlockInsertLocation(editor, insertOptions.at)
        : insertOptions.at,
    });
  });
};
