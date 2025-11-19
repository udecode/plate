import type { InsertNodesOptions, SlateEditor } from 'platejs';

import { KEYS } from 'platejs';

import { insertImage, insertMediaEmbed } from '../..';

export interface InsertMediaOptions extends InsertNodesOptions {
  /**
   * Default onClick is getting the image url by calling this promise before
   * inserting the image.
   */
  type?: string;

  getUrl?: () => Promise<string>;
}

export const insertMedia = async <E extends SlateEditor>(
  editor: E,
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
        `Enter the URL of the ${type === KEYS.img ? KEYS.img : KEYS.mediaEmbed}`
      );

  if (!url) return;
  if (type === editor.getType(KEYS.img)) {
    insertImage(editor, url, options);
  } else {
    insertMediaEmbed(editor, { url }, options);
  }
};
