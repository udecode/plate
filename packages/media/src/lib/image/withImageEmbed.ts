import type { ExtendPlateEditorExtension } from '@platejs/core';
import type { TImageElement } from '@platejs/utils';
import { KEYS } from '@platejs/utils';

import type { ImageConfig } from './BaseImagePlugin';

import { isImageUrl } from './utils/isImageUrl';

/** If inserted text is image url, insert image instead. */
export const withImageEmbed: ExtendPlateEditorExtension<ImageConfig> = ({
  editor,
  getOptions,
}) => ({
  clipboard: {
    insertData(dataTransfer, { next, tx }) {
      if (getOptions().disableEmbedInsert) {
        return next(dataTransfer);
      }

      const text = dataTransfer.getData('text/plain');

      if (isImageUrl(text)) {
        tx.blocks.insertAfter({
          children: [{ text: '' }],
          type: editor.getType(KEYS.img),
          url: text,
        } satisfies TImageElement);

        return true;
      }

      return next(dataTransfer);
    },
  },
});
