import { getPluginType, PlateEditor, Value } from '@udecode/plate-common';
import {
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED,
  insertImage,
  insertMediaEmbed,
} from '..';

export interface InsertMediaOptions {
  /**
   * Default onClick is getting the image url by calling this promise before inserting the image.
   */
  getUrl?: () => Promise<string>;

  type?: string;
}

export const insertMedia = async <V extends Value>(
  editor: PlateEditor<V>,
  {
    getUrl,
    type = getPluginType(editor, ELEMENT_IMAGE),
  }: InsertMediaOptions = {}
) => {
  let url;
  if (getUrl) {
    url = await getUrl();
  } else {
    url = window.prompt(
      `Enter the URL of the ${
        type === ELEMENT_IMAGE ? ELEMENT_IMAGE : ELEMENT_MEDIA_EMBED
      }`
    );
  }
  if (!url) return;

  if (type === getPluginType(editor, ELEMENT_IMAGE)) {
    insertImage(editor, url);
  } else {
    insertMediaEmbed(editor, { url });
  }
};
