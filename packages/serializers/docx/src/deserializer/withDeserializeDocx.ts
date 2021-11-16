import { WithOverride } from '@udecode/plate-core';
import { deserializeHtml } from '@udecode/plate-html-serializer';
import {
  insertDeserializedFragment,
  isDeserializerEnabled,
} from '@udecode/plate-serializer';
import cleanDocx from '../docx-cleaner/cleanDocx';
import { KEY_DESERIALIZE_DOCX } from './createDeserializeDocxPlugin';

/**
 * Enables support for deserializing inserted content from HTML format to Slate format.
 */
const parser = new DOMParser();

/**
 * Enables support for deserializing inserted content from HTML format to Slate format.
 */
export const withDeserializeDocx: WithOverride = (editor) => {
  const { insertData } = editor;

  editor.insertData = (data: DataTransfer) => {
    let html = data.getData('text/html');
    const rtf = data.getData('text/rtf');

    const isEnabled = isDeserializerEnabled(editor, KEY_DESERIALIZE_DOCX);

    html = cleanDocx(html, rtf);

    if (html && isEnabled) {
      const { body } = parser.parseFromString(html, 'text/html');

      const fragment = deserializeHtml(editor, {
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
