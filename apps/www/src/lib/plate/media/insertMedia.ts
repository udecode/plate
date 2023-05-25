import { PlateEditor, Value } from '@udecode/plate-common';
import { insertImage, insertMediaEmbed } from '@udecode/plate-media';

export interface InsertMediaOptions {
  /**
   * Default onClick is getting the image url by calling this promise before inserting the image.
   */
  getUrl?: () => Promise<string>;

  type?: 'image' | 'embed';
}

export const insertMedia = async <V extends Value>(
  editor: PlateEditor<V>,
  { getUrl, type = 'image' }: InsertMediaOptions = {}
) => {
  let url;
  if (getUrl) {
    url = await getUrl();
  } else {
    url = window.prompt(
      `Enter the URL of the ${type === 'image' ? 'image' : 'embed'}`
    );
  }
  if (!url) return;

  if (type === 'image') {
    insertImage(editor, url);
  } else {
    insertMediaEmbed(editor, { url });
  }
};
