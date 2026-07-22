import {
  type ExtendPlateEditorExtension,
  prepareInsertDataQuery,
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
}) => {
  const queryInsertData = prepareInsertDataQuery(editor, plugin);

  return {
    clipboard: {
      insertData(dataTransfer, { next }) {
        if (getOptions().disableUploadInsert) {
          return next(dataTransfer);
        }

        const mimeType = 'text/plain';
        const text = dataTransfer.getData(mimeType);
        const { files } = dataTransfer;

        if (!text && files && files.length > 0) {
          if (
            !editor.read((state) =>
              queryInsertData(state, {
                data: text,
                format: mimeType,
                source: dataTransfer,
              })
            )
          ) {
            return next(dataTransfer);
          }

          insertImageFromFiles(editor, files);
          return true;
        }
        return next(dataTransfer);
      },
    },
  };
};
