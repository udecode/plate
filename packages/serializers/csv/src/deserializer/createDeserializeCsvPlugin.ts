import { createPlugin, WithOverride } from '@udecode/plate-core';
import {
  insertDeserializedFragment,
  isDeserializerEnabled,
} from '@udecode/plate-serializer';
import { deserializeCsv } from './utils';

export const KEY_DESERIALIZE_CSV = 'deserializeCsv';

export interface DeserializeCsvPlugin {
  /**
   * Percentage in decimal form, from 0 to a very large number, 0 for no errors allowed,
   * Percentage based on number of errors compared to number of rows
   * @default 0.25
   */
  errorTolerance?: number;
}

/**
 * Enables support for deserializing content
 * from CSV format to Slate format.
 */
export const withDeserializeCsv = (): WithOverride => (editor) => {
  const { insertData } = editor;

  editor.insertData = (data) => {
    const content = data.getData('text/plain');

    const isEnabled = isDeserializerEnabled(
      editor,
      editor.plugins,
      KEY_DESERIALIZE_CSV
    );

    if (content && isEnabled) {
      const fragment = deserializeCsv(editor, { content, header: true });

      if (fragment?.length) {
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

/**
 * @see {@link withDeserializeCsv}
 */
export const createDeserializeCsvPlugin = createPlugin({
  key: KEY_DESERIALIZE_CSV,
  withOverrides: withDeserializeCsv(),
  errorTolerance: 0.25,
});
