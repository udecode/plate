import type { BaseEditor } from '@platejs/core';
import type { NodeInsertNodesOptions } from '@platejs/plite';
import type { TImageElement } from '@platejs/utils';

import { BaseImagePlugin } from '../BaseImagePlugin';
import { insertImage } from './insertImage';

export const insertImageFromFiles = (
  editor: BaseEditor,
  files: FileList,
  options: NodeInsertNodesOptions<TImageElement> = {}
) => {
  for (const file of files) {
    const reader = new FileReader();
    const [mime] = file.type.split('/');

    if (mime === 'image') {
      reader.addEventListener('load', async () => {
        if (!reader.result) {
          return;
        }

        const uploadImage = editor
          .plugin(BaseImagePlugin)
          .getOptions().uploadImage;

        const uploadedUrl = uploadImage
          ? await uploadImage(reader.result)
          : reader.result;

        insertImage(editor, uploadedUrl, options);
      });

      reader.readAsDataURL(file);
    }
  }
};
