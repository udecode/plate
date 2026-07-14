import type { ExtendPlateEditorExtension } from '@platejs/core';

import type { ImageConfig } from './BaseImagePlugin';

import { insertImage } from './transforms/insertImage';
import { isImageUrl } from './utils/isImageUrl';

/** If inserted text is image url, insert image instead. */
export const withImageEmbed: ExtendPlateEditorExtension<ImageConfig> = ({
  editor,
  getOptions,
}) => ({
  clipboard: {
    insertData(dataTransfer, { next }) {
      if (getOptions().disableEmbedInsert) {
        return next(dataTransfer);
      }

      const text = dataTransfer.getData('text/plain');

      if (isImageUrl(text)) {
        insertImage(editor, text);

        return true;
      }

      return next(dataTransfer);
    },
  },
});
