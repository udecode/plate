import { createSlatePlugin } from '../../plugin';
import { deserializeHtml, parseHtmlDocument } from './utils';

/**
 * Enables support for deserializing inserted content from HTML format to Slate
 * format.
 */
export const DeserializeHtmlPlugin = createSlatePlugin({
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
