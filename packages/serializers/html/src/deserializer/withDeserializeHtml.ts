import { WithOverride } from '@udecode/plate-core';
import {
  insertDeserializedFragment,
  isDeserializerEnabled,
} from '@udecode/plate-serializer';
import { deserializeHTMLToDocumentFragment } from './utils/deserializeHTMLToDocumentFragment';
import { KEY_DESERIALIZE_HTML } from './createDeserializeHtmlPlugin';

/**
 * Enables support for deserializing inserted content from HTML format to Slate format.
 */
export const withDeserializeHtml = (): WithOverride => (editor) => {
  const { insertData } = editor;

  editor.insertData = (data: DataTransfer) => {
    const html = data.getData('text/html');

    const isEnabled = isDeserializerEnabled(
      editor,
      editor.plugins,
      KEY_DESERIALIZE_HTML
    );

    if (html && isEnabled) {
      const { body } = new DOMParser().parseFromString(html, 'text/html');

      const fragment = deserializeHTMLToDocumentFragment(editor, {
        plugins: editor.plugins,
        element: body,
      });

      if (fragment.length) {
        return insertDeserializedFragment(editor, {
          fragment,
          plugins: editor.plugins,
        });
      }
    }

    insertData(data);
  };

  return editor;
};
