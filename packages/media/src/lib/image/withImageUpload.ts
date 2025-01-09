import {
  type OverrideEditor,
  getInjectedPlugins,
  pipeInsertDataQuery,
} from '@udecode/plate';

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

        insertImageFromFiles(editor, files);
      } else {
        return insertData(dataTransfer);
      }
    },
  },
});
