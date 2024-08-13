import {
  type InsertNodesOptions,
  type PlateEditor,
  type TEditor,
  getPluginType,
} from '@udecode/plate-common';

import {
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED,
  insertImage,
  insertMediaEmbed,
} from '..';

export interface InsertMediaOptions<E extends TEditor = TEditor>
  extends InsertNodesOptions<E> {
  /**
   * Default onClick is getting the image url by calling this promise before
   * inserting the image.
   */
  getUrl?: () => Promise<string>;

  type?: string;
}

export const insertMedia = async <E extends PlateEditor>(
  editor: E,
  {
    getUrl,
    type = getPluginType(editor, ELEMENT_IMAGE),
    ...options
  }: InsertMediaOptions<E> = {}
) => {
  const url = getUrl
    ? await getUrl()
    : window.prompt(
        `Enter the URL of the ${
          type === ELEMENT_IMAGE ? ELEMENT_IMAGE : ELEMENT_MEDIA_EMBED
        }`
      );

  if (!url) return;
  if (type === getPluginType(editor, ELEMENT_IMAGE)) {
    insertImage(editor, url, options);
  } else {
    insertMediaEmbed(editor, { url }, options);
  }
};
