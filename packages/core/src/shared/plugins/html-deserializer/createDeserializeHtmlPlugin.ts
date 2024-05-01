import { createPluginFactory } from '../../utils/createPluginFactory';
import { deserializeHtml } from './utils/deserializeHtml';
import { parseHtmlDocument } from './utils/parseHtmlDocument';

export const KEY_DESERIALIZE_HTML = 'deserializeHtml';

/**
 * Enables support for deserializing inserted content from HTML format to Slate
 * format.
 */
export const createDeserializeHtmlPlugin = createPluginFactory({
  key: KEY_DESERIALIZE_HTML,
  then: (editor) => ({
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
  }),
});
