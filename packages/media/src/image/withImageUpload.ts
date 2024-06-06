import {
  type PlateEditor,
  type Value,
  type WithPlatePlugin,
  getInjectedPlugins,
  pipeInsertDataQuery,
} from '@udecode/plate-common/server';

import type { ImagePlugin } from './types';

import { insertImage } from './transforms/insertImage';

/**
 * Allows for pasting images from clipboard. Not yet: dragging and dropping
 * images, selecting them through a file system dialog.
 */
export const withImageUpload = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  plugin: WithPlatePlugin<ImagePlugin, V, E>
) => {
  const {
    options: { uploadImage },
  } = plugin;
  const { insertData } = editor;

  editor.insertData = (dataTransfer: DataTransfer) => {
    const text = dataTransfer.getData('text/plain');
    const { files } = dataTransfer;

    if (!text && files && files.length > 0) {
      const injectedPlugins = getInjectedPlugins<{}, V, E>(editor, plugin);

      if (
        !pipeInsertDataQuery<{}, V, E>(injectedPlugins, {
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
