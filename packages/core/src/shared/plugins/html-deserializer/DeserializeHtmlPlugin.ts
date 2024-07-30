import { createPlugin } from '../../utils';
import { deserializeHtml } from './utils/deserializeHtml';
import { parseHtmlDocument } from './utils/parseHtmlDocument';

export const KEY_DESERIALIZE_HTML = 'deserializeHtml';

/**
 * Enables support for deserializing inserted content from HTML format to Slate
 * format.
 */
export const DeserializeHtmlPlugin = createPlugin({
  key: KEY_DESERIALIZE_HTML,
}).extend((editor) => ({
  editor: {
    insertData: {
      format: 'text/html',
      getFragment: ({ data }) => {
        const document = parseHtmlDocument(data);

        return deserializeHtml(editor, {
          element: document.body,
        });
      },
    },
  },
}));
