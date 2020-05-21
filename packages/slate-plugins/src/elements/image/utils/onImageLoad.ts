import { insertImage } from 'elements/image/transforms';
import { ReactEditor } from 'slate-react';

export const onImageLoad = (editor: ReactEditor, reader: FileReader) => () => {
  const url = reader.result;
  if (url) insertImage(editor, url);
};
