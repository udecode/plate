import {
  type OverrideEditor,
  getInjectedPlugins,
  pipeInsertDataQuery,
} from 'platejs';

import type { ImageConfig } from './BaseImagePlugin';

import { insertImageFromFiles } from './transforms';

/**
 * Allows for pasting images from clipboard. Not yet: dragging and dropping
 * images, selecting them through a file system dialog.
 */
export const withImageUpload: OverrideEditor<ImageConfig> = ({
  editor,
  getOptions,
  plugin,
  tf: { insertData },
}) => ({
  transforms: {
    insertData(dataTransfer) {
      if (getOptions().disableUploadInsert) {
        return insertData(dataTransfer);
      }

      const mimeType = 'text/plain';
      const text = dataTransfer.getData(mimeType);
      const { files } = dataTransfer;

      if (!text && files && files.length > 0) {
        const injectedPlugins = getInjectedPlugins(editor, plugin);

        if (
          !pipeInsertDataQuery(editor, injectedPlugins, {
            data: text,
            dataTransfer,
            mimeType,
          })
        ) {
          return insertData(dataTransfer);
        }

        insertImageFromFiles(editor, files);
      } else {
        return insertData(dataTransfer);
      }
    },
  },
});
