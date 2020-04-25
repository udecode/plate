import marked from 'marked';
import { Node, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { SlatePlugin } from 'types';
import { htmlDeserialize } from '../deserializers';

export function filterBreaklines(item: any): boolean {
  return !item.text;
}

export const withPasteMd = (plugins: SlatePlugin[]) => <T extends ReactEditor>(
  editor: T
) => {
  const { insertData } = editor;

  editor.insertData = (data) => {
    const content = data.getData('text/plain');

    if (content) {
      const html = marked(content);
      const parsed = new DOMParser().parseFromString(html, 'text/html');

      // `filterBreaklines` filters all the breaklines in the pasted document
      const fragment: Array<Node> = htmlDeserialize(plugins)(
        parsed.body
      ).filter(filterBreaklines);

      Transforms.insertFragment(editor, fragment);
      return;
    }

    insertData(data);
  };

  return editor;
};
