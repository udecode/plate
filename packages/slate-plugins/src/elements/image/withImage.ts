import { withVoid } from 'element';
import { ReactEditor } from 'slate-react';
import { isImageUrl } from './utils/isImageUrl';
import { insertImage } from './transforms';
import { IMAGE } from './types';

export const onImageLoad = (editor: ReactEditor, reader: FileReader) => () => {
  const url = reader.result;
  if (url) insertImage(editor, url);
};

export const withImage = ({ typeImg = IMAGE } = {}) => <T extends ReactEditor>(
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
