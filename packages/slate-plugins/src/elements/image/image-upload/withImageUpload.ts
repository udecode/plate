import { ReactEditor } from 'slate-react';
import { withVoid } from '../../../element';
import { insertImage } from '../transforms';
import { IMAGE } from '../types';
import { isImageUrl, onImageLoad } from '../utils';
import { WithImageUploadOptions } from './types';

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
