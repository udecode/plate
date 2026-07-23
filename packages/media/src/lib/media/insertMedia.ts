import type { BaseEditor } from '@platejs/core';
import type { NodeInsertNodesOptions } from '@platejs/plite';
import type { TImageElement, TMediaEmbedElement } from '@platejs/utils';
import { KEYS, NODES } from '@platejs/utils';

import { insertImage, insertMediaEmbed } from '../..';

export interface InsertMediaOptions
  extends NodeInsertNodesOptions<TImageElement | TMediaEmbedElement> {
  /**
   * Default onClick is getting the image url by calling this promise before
   * inserting the image.
   */
  type?: string;

  getUrl?: () => Promise<string>;
}

export const insertMedia = async (
  editor: BaseEditor,
  {
    getUrl,
    type = editor.getType(KEYS.img),
    ...options
  }: InsertMediaOptions = {}
) => {
  const url = getUrl
    ? await getUrl()
    : // biome-ignore lint/suspicious/noAlert: intentional user input for media URL
      window.prompt(
        `Enter the URL of the ${type === KEYS.img ? KEYS.img : NODES.mediaEmbed}`
      );

  if (!url) return;
  if (type === editor.getType(KEYS.img)) {
    insertImage(editor, url, options);
  } else {
    insertMediaEmbed(editor, { url }, options);
  }
};
