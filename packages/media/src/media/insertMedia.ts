import {
  type InsertNodesOptions,
  type PlateEditor,
  type Value,
  getPluginType,
} from '@udecode/plate-common/server';

import {
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED,
  insertImage,
  insertMediaEmbed,
} from '..';

export interface InsertMediaOptions<V extends Value>
  extends InsertNodesOptions<V> {
  /**
   * Default onClick is getting the image url by calling this promise before
   * inserting the image.
   */
  getUrl?: () => Promise<string>;

  type?: string;
}

export const insertMedia = async <V extends Value>(
  editor: PlateEditor<V>,
  {
    getUrl,
    type = getPluginType(editor, ELEMENT_IMAGE),
    ...options
  }: InsertMediaOptions<V> = {}
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
