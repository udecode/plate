import marked from 'marked';
import { Node, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { SlatePlugin } from '../../common';
import { htmlDeserialize } from '../deserialize-html';
import { filterBreaklines } from './utils';

/**
 * Enables support for deserializing content
 * from Markdown format to Slate format.
 */
export const withDeserializeMd = (plugins: SlatePlugin[]) => <
  T extends ReactEditor
>(
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
