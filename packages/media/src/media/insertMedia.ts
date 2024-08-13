import {
  type InsertNodesOptions,
  type PlateEditor,
  type TEditor,
  getPluginType,
} from '@udecode/plate-common';

import {
  ImagePlugin,
  MediaEmbedPlugin,
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
    type = getPluginType(editor, ImagePlugin.key),
    ...options
  }: InsertMediaOptions<E> = {}
) => {
  const url = getUrl
    ? await getUrl()
    : window.prompt(
        `Enter the URL of the ${
          type === ImagePlugin.key ? ImagePlugin.key : MediaEmbedPlugin.key
        }`
      );

  if (!url) return;
  if (type === getPluginType(editor, ImagePlugin.key)) {
    insertImage(editor, url, options);
  } else {
    insertMediaEmbed(editor, { url }, options);
  }
};
