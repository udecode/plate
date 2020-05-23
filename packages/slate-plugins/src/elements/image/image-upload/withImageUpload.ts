import { withVoid } from 'element';
import { WithImageUploadOptions } from 'elements/image/image-upload/types';
import { insertImage } from 'elements/image/transforms';
import { IMAGE } from 'elements/image/types';
import { isImageUrl } from 'elements/image/utils/isImageUrl';
import { onImageLoad } from 'elements/image/utils/onImageLoad';
import { ReactEditor } from 'slate-react';

/**
 * Allows for pasting images from clipboard.
 * Not yet: dragging and dropping images, selecting them through a file system dialog.
 * @param typeImg
 */
export const withImageUpload = ({
  typeImg = IMAGE,
}: WithImageUploadOptions = {}) => <T extends ReactEditor>(editor: T) => {
  editor = withVoid([typeImg])(editor);

  const { insertData } = editor;

  editor.insertData = (data: DataTransfer) => {
    const text = data.getData('text/plain');
    const { files } = data;
    if (files && files.length > 0) {
      for (const file of files) {
        const reader = new FileReader();
        const [mime] = file.type.split('/');
        if (mime === 'image') {
          reader.addEventListener('load', onImageLoad(editor, reader));
          reader.readAsDataURL(file);
        }
      }
    } else if (isImageUrl(text)) {
      insertImage(editor, text);
    } else {
      insertData(data);
    }
  };

  return editor;
};
