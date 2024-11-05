import type { InsertNodesOptions, SlateEditor } from '@udecode/plate-common';

import { BaseImagePlugin } from '../BaseImagePlugin';
import { insertImage } from './insertImage';

export const insertImageFromFiles = (
  editor: SlateEditor,
  files: FileList,
  options: InsertNodesOptions = {}
) => {
  for (const file of files) {
    const reader = new FileReader();
    const [mime] = file.type.split('/');

    if (mime === 'image') {
      reader.addEventListener('load', async () => {
        if (!reader.result) {
          return;
        }

        const uploadImage = editor.getOptions(BaseImagePlugin).uploadImage;

        const uploadedUrl = uploadImage
          ? await uploadImage(reader.result)
          : reader.result;

        insertImage(editor, uploadedUrl, options);
      });

      reader.readAsDataURL(file);
    }
  }
};
