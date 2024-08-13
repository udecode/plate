import { createPlugin } from '../../plugin';
import { deserializeHtml } from './utils/deserializeHtml';
import { parseHtmlDocument } from './utils/parseHtmlDocument';

/**
 * Enables support for deserializing inserted content from HTML format to Slate
 * format.
 */
export const DeserializeHtmlPlugin = createPlugin({
  editor: {
    insertData: {
      format: 'text/html',
      getFragment: ({ data, editor }) => {
        const document = parseHtmlDocument(data);

        return deserializeHtml(editor, {
          element: document.body,
        });
      },
    },
  },
  key: 'deserializeHtml',
});
