import { SlatePlugin } from 'common/types';
import { Node, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { htmlDeserialize } from './htmlDeserialize';

export const withDeserializeHtml = (plugins: SlatePlugin[]) => <
  T extends ReactEditor
>(
  editor: T
) => {
  const { insertData } = editor;

  editor.insertData = (data: DataTransfer) => {
    const html = data.getData('text/html');

    if (html) {
      const { body } = new DOMParser().parseFromString(html, 'text/html');
      const fragment: Node[] = htmlDeserialize(plugins)(body);

      if (!fragment.length) return;

      // replace the selected node type by the first node type
      Transforms.setNodes(editor, { type: fragment[0].type });

      Transforms.insertFragment(editor, fragment);
      return;
    }

    insertData(data);
  };

  return editor;
};
