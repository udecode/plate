import marked from 'marked';
import { Node, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { deserializeMd } from './deserializeMd';

export function filterBreaklines(item: any): boolean {
  return !item.text;
}

export const withPasteMd = <T extends ReactEditor>(editor: T) => {
  const { insertData, isInline, isVoid } = editor;

  editor.isInline = element => {
    return element.type === 'link' ? true : isInline(element);
  };

  editor.isVoid = element => {
    return element.type === 'image' ? true : isVoid(element);
  };

  editor.insertData = data => {
    const content = data.getData('text/plain');

    if (content) {
      const html = marked(content);
      const parsed = new DOMParser().parseFromString(html, 'text/html');

      // `filterBreaklines` filters all the breaklines in the pasted document
      const fragment: Array<Node> = deserializeMd(parsed.body).filter(
        filterBreaklines
      );

      Transforms.insertFragment(editor, fragment);
      return;
    }

    insertData(data);
  };

  return editor;
};
