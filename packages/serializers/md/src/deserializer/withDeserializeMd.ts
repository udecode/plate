import { isUrl } from '@udecode/plate-common';
import { WithOverride } from '@udecode/plate-core';
import {
  insertDeserializedFragment,
  isDeserializerEnabled,
} from '@udecode/plate-serializer';
import { deserializeMd } from './utils/deserializeMd';
import { KEY_DESERIALIZE_MD } from './createDeserializeMdPlugin';

/**
 * Enables support for deserializing content
 * from Markdown format to Slate format.
 */
export const withDeserializeMd = (): WithOverride => (editor) => {
  const { insertData } = editor;

  editor.insertData = (data) => {
    const content = data.getData('text/plain');

    const isEnabled = isDeserializerEnabled(editor, KEY_DESERIALIZE_MD);

    const { files } = data;
    if (content && isEnabled && !files?.length) {
      // if content is simply a URL pass through to not break LinkPlugin
      if (isUrl(content)) {
        return insertData(data);
      }

      const fragment = deserializeMd(editor, content);

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
