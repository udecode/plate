import { ReactEditor } from 'slate-react';
import { insertImage } from '../transforms';
import { ImagePluginOptions } from '../types';
import { isImageUrl } from '../utils';

/**
 * Allows for pasting images from clipboard.
 * Not yet: dragging and dropping images, selecting them through a file system dialog.
 * @param options.type
 * @param options.uploadImage
 */
export const withImageUpload = (options?: ImagePluginOptions) => <
  T extends ReactEditor
>(
  editor: T
) => {
  const { insertData } = editor;

  editor.insertData = (data: DataTransfer) => {
    const text = data.getData('text/plain');
    const { files } = data;
    if (files && files.length > 0) {
      for (const file of files) {
        const reader = new FileReader();
        const [mime] = file.type.split('/');

        if (mime === 'image') {
          reader.addEventListener('load', async () => {
            if (!reader.result) {
              return;
            }
            const uploadedUrl = options?.img?.uploadImage
              ? await options.img.uploadImage(reader.result)
              : reader.result;

            insertImage(editor, uploadedUrl);
          });

          reader.readAsDataURL(file);
        }
      }
    } else if (isImageUrl(text)) {
      insertImage(editor, text, options);
    } else {
      insertData(data);
    }
  };

  return editor;
};
