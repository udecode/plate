import { WithOverride } from '@udecode/plate-core';
import {
  insertDeserializedFragment,
  isDeserializerEnabled,
} from '@udecode/plate-serializer';
import { deserializeCsv } from './utils/deserializeCsv';
import { KEY_DESERIALIZE_CSV } from './createDeserializeCsvPlugin';
import { DeserializeCsvPlugin } from './types';

/**
 * Enables support for deserializing content
 * from CSV format to Slate format.
 */
export const withDeserializeCsv: WithOverride<{}, DeserializeCsvPlugin> = (
  editor
) => {
  const { insertData } = editor;

  editor.insertData = (data) => {
    const content = data.getData('text/plain');

    const isEnabled = isDeserializerEnabled(editor, KEY_DESERIALIZE_CSV);

    if (content && isEnabled) {
      const fragment = deserializeCsv(editor, { content, header: true });

      if (fragment?.length) {
        return insertDeserializedFragment(editor, {
          fragment,
        });
      }
    }

    insertData(data);
  };

  return editor;
};
