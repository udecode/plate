import { htmlDeserialize } from 'deserializers';
import { Node, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { SlatePlugin } from 'types';

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
      const fragment: Node[] = htmlDeserialize(plugins)(parsed.body);

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
