import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { SlatePlugin } from '../../common';
import { deserializeHTMLToDocumentFragment } from './utils';

export interface WithDeserializeHTMLOptions {
  plugins?: SlatePlugin[];
}

/**
 * Enables support for deserializing inserted content from HTML format to Slate format.
 */
export const withDeserializeHTML = ({
  plugins = [],
}: WithDeserializeHTMLOptions = {}) => <T extends ReactEditor>(editor: T) => {
  const { insertData } = editor;

  const inlineTypes = plugins.reduce((arr: string[], plugin) => {
    const types = plugin.inlineTypes || [];
    return arr.concat(types);
  }, []);

  editor.insertData = (data: DataTransfer) => {
    const html = data.getData('text/html');

    if (html) {
      const { body } = new DOMParser().parseFromString(html, 'text/html');
      const fragment = deserializeHTMLToDocumentFragment(plugins)(body);

      const firstNodeType = fragment[0].type as string | undefined;

      // replace the selected node type by the first block type
      if (firstNodeType && !inlineTypes.includes(firstNodeType)) {
        Transforms.setNodes(editor, { type: fragment[0].type });
      }

      Transforms.insertFragment(editor, fragment);
      return;
    }

    insertData(data);
  };

  return editor;
};
