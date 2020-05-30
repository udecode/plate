import { ReactEditor } from 'slate-react';
import { insertImage } from '../transforms';

export const onImageLoad = (editor: ReactEditor, reader: FileReader) => () => {
  const url = reader.result;
  if (url) insertImage(editor, url);
};
