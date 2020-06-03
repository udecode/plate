import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { SlatePlugin } from '../../common';
import { deserializeHTMLToDocumentFragment } from './utils';

/**
 * Enables support for deserializing inserted content from HTML format to Slate format.
 */
export const withDeserializeHTML = (plugins: SlatePlugin[]) => <
  T extends ReactEditor
>(
  editor: T
) => {
  const { insertData } = editor;

  editor.insertData = (data: DataTransfer) => {
    const html = data.getData('text/html');

    if (html) {
      const { body } = new DOMParser().parseFromString(html, 'text/html');
      const fragment = deserializeHTMLToDocumentFragment(plugins)(body);

      // replace the selected node type by the first node type
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
