import {
  type ExtendPlateEditorExtension,
  getInjectedPlugins,
  pipeInsertDataQuery,
} from '@platejs/core';

import type { ImageConfig } from './BaseImagePlugin';

import { insertImageFromFiles } from './transforms';

/**
 * Allows for pasting images from clipboard. Not yet: dragging and dropping
 * images, selecting them through a file system dialog.
 */
export const withImageUpload: ExtendPlateEditorExtension<ImageConfig> = ({
  editor,
  getOptions,
  plugin,
}) => ({
  clipboard: {
    insertData(dataTransfer, { next }) {
      if (getOptions().disableUploadInsert) {
        return next(dataTransfer);
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
          return next(dataTransfer);
        }

        insertImageFromFiles(editor, files);
        return true;
      }
      return next(dataTransfer);
    },
  },
});
