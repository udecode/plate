import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { SlatePlugin } from 'types';
import { htmlDeserialize } from '../deserializers';

export const withPasteHtml = (plugins: SlatePlugin[]) => <
  T extends ReactEditor
>(
  editor: T
) => {
  const { insertData } = editor;

  editor.insertData = (data: DataTransfer) => {
    const html = data.getData('text/html');

    if (html) {
      const parsed = new DOMParser().parseFromString(html, 'text/html');
      const fragment = htmlDeserialize(plugins)(parsed.body);
      Transforms.insertFragment(editor, fragment);
      return;
    }

    insertData(data);
  };

  return editor;
};
