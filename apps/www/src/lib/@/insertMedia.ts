import { ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED } from '@udecode/plate';
import { PlateEditor, Value } from '@udecode/plate-common';
import { insertImage, insertMediaEmbed } from '@udecode/plate-media';

export interface InsertMediaOptions {
  /**
   * Default onClick is getting the image url by calling this promise before inserting the image.
   */
  getUrl?: () => Promise<string>;

  type?: typeof ELEMENT_IMAGE | typeof ELEMENT_MEDIA_EMBED;
}

export const insertMedia = async <V extends Value>(
  editor: PlateEditor<V>,
  { getUrl, type = ELEMENT_IMAGE }: InsertMediaOptions = {}
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

  if (type === ELEMENT_IMAGE) {
    insertImage(editor, url);
  } else {
    insertMediaEmbed(editor, { url });
  }
};
