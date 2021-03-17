import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { parseMD } from './utils/parseMD';

/**
 * Enables support for deserializing content
 * from Markdown format to Slate format.
 */
export const withDeserializeMd = () => <T extends ReactEditor>(editor: T) => {
  const { insertData } = editor;

  editor.insertData = (data) => {
    const content = data.getData('text/plain');

    if (content) {
      const fragment = parseMD(editor, content);

      if (!fragment.length) return;

      if (fragment[0].type) {
        Transforms.setNodes(editor, { type: fragment[0].type });
      }

      Transforms.insertFragment(editor, fragment);
      return;
    }

    insertData(data);
  };

  return editor;
};
