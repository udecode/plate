import { isUrl } from '@udecode/plate-common';
import { createPlugin, WithOverride } from '@udecode/plate-core';
import {
  insertDeserializedFragment,
  isDeserializerEnabled,
} from '@udecode/plate-serializer';
import { deserializeMd } from './utils';

export const KEY_DESERIALIZE_MD = 'deserializeMd';

/**
 * Enables support for deserializing content
 * from Markdown format to Slate format.
 */
export const withDeserializeMd = (): WithOverride => (editor) => {
  const { insertData } = editor;

  editor.insertData = (data) => {
    const content = data.getData('text/plain');

    const isEnabled = isDeserializerEnabled(
      editor,
      editor.plugins,
      KEY_DESERIALIZE_MD
    );

    const { files } = data;
    if (content && isEnabled && !files?.length) {
      // if content is simply a URL pass through to not break LinkPlugin
      if (isUrl(content)) {
        return insertData(data);
      }

      const fragment = deserializeMd(editor, content);

      if (fragment.length) {
        return insertDeserializedFragment(editor, {
          plugins: editor.plugins,
          fragment,
        });
      }
    }

    insertData(data);
  };

  return editor;
};

/**
 * @see {@link withDeserializeMd}
 */
export const createDeserializeMdPlugin = createPlugin({
  key: KEY_DESERIALIZE_MD,
  withOverrides: withDeserializeMd(),
});
