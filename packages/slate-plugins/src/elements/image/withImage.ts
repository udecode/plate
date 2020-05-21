import { withVoid } from 'element';
import { onImageLoad } from 'elements/image/utils/onImageLoad';
import { ReactEditor } from 'slate-react';
import { isImageUrl } from './utils/isImageUrl';
import { insertImage } from './transforms';
import { IMAGE, WithImageOptions } from './types';

export const withImage = ({ typeImg = IMAGE }: WithImageOptions = {}) => <
  T extends ReactEditor
>(
  editor: T
) => {
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
