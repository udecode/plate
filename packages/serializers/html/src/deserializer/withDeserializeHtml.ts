import { WithOverride } from '@udecode/plate-core';
import {
  insertDeserializedFragment,
  isDeserializerEnabled,
} from '@udecode/plate-serializer';
import { deserializeHTMLToDocumentFragment } from './utils/deserializeHTMLToDocumentFragment';
import { KEY_DESERIALIZE_HTML } from './createDeserializeHtmlPlugin';

const parser = new DOMParser();

/**
 * Enables support for deserializing inserted content from HTML format to Slate format.
 */
export const withDeserializeHtml: WithOverride = (editor) => {
  const { insertData } = editor;

  editor.insertData = (data: DataTransfer) => {
    const html = data.getData('text/html');

    const isEnabled = isDeserializerEnabled(editor, KEY_DESERIALIZE_HTML);

    if (html && isEnabled) {
      const { body } = parser.parseFromString(html, 'text/html');

      const fragment = deserializeHTMLToDocumentFragment(editor, {
        element: body,
      });

      if (fragment.length) {
        return insertDeserializedFragment(editor, {
          fragment,
        });
      }
    }

    insertData(data);
  };

  return editor;
};
