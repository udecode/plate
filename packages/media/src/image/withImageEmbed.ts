import type { WithOverride } from '@udecode/plate-common';

import type { ImagePluginOptions } from './types';

import { insertImage } from './transforms/insertImage';
import { isImageUrl } from './utils/isImageUrl';

/** If inserted text is image url, insert image instead. */
export const withImageEmbed: WithOverride<ImagePluginOptions> = ({
  editor,
}) => {
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
