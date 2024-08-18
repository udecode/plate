import type { WithOverride } from '@udecode/plate-common';

import type { ImageConfig } from './ImagePlugin';

import { insertImage } from './transforms/insertImage';
import { isImageUrl } from './utils/isImageUrl';

/** If inserted text is image url, insert image instead. */
export const withImageEmbed: WithOverride<ImageConfig> = ({ editor }) => {
  const { insertData } = editor;

  editor.insertData = (dataTransfer: DataTransfer) => {
    const text = dataTransfer.getData('text/plain');

    if (isImageUrl(text)) {
      insertImage(editor, text);

      return;
    }

    insertData(dataTransfer);
  };

  return editor;
};
