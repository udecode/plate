import {
  type WithOverride,
  getInjectedPlugins,
  pipeInsertDataQuery,
} from '@udecode/plate-common';

import type { ImageConfig } from './ImagePlugin';

import { insertImage } from './transforms/insertImage';

/**
 * Allows for pasting images from clipboard. Not yet: dragging and dropping
 * images, selecting them through a file system dialog.
 */
export const withImageUpload: WithOverride<ImageConfig> = ({
  editor,
  getOptions,
  plugin,
}) => {
  const { insertData } = editor;

  editor.insertData = (dataTransfer: DataTransfer) => {
    if (getOptions().disableUploadInsert) {
      return insertData(dataTransfer);
    }

    const text = dataTransfer.getData('text/plain');
    const { files } = dataTransfer;

    if (!text && files && files.length > 0) {
      const injectedPlugins = getInjectedPlugins(editor, plugin);

      if (
        !pipeInsertDataQuery(editor, injectedPlugins, {
          data: text,
          dataTransfer,
        })
      ) {
        return insertData(dataTransfer);
      }

      for (const file of files) {
        const reader = new FileReader();
        const [mime] = file.type.split('/');

        if (mime === 'image') {
          reader.addEventListener('load', async () => {
            if (!reader.result) {
              return;
            }

            const uploadImage = getOptions().uploadImage;

            const uploadedUrl = uploadImage
              ? await uploadImage(reader.result)
              : reader.result;

            insertImage(editor, uploadedUrl);
          });

          reader.readAsDataURL(file);
        }
      }
    } else {
      insertData(dataTransfer);
    }
  };

  return editor;
};
