import { createPluginFactory } from '@udecode/plate-core';
import { deserializeHtml } from './utils/deserializeHtml';

export const KEY_DESERIALIZE_HTML = 'deserializeHtml';

const parser = new DOMParser();

/**
 * Enables support for deserializing inserted content from HTML format to Slate format.
 */
export const createDeserializeHtmlPlugin = createPluginFactory({
  key: KEY_DESERIALIZE_HTML,
  editor: {
    insertData: {
      format: 'text/html',
      getFragment: (editor, plugin, { data }) => {
        const { body } = parser.parseFromString(data, 'text/html');
        return deserializeHtml(editor, {
          element: body,
        });
      },
    },
  },
});
