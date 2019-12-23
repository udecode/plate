import { Transforms } from 'slate';
import { ReactEditor, SlatePlugin } from 'slate-react';
import { deserialize } from './deserialize';

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
      console.log('parsed.body:', parsed.body);
      const fragment = deserialize(plugins)(parsed.body);
      Transforms.insertFragment(editor, fragment);
      return;
    }

    insertData(data);
  };

  return editor;
};
