import { bindFirst } from '@udecode/utils';

import { createEditorPlugin } from '../../plugin';
import { deserializeHtml, parseHtmlDocument } from './utils';

/**
 * Enables support for deserializing inserted content from HTML format to Plite
 * format and serializing Plite content to HTML format.
 */
export const HtmlPlugin = createEditorPlugin({
  key: 'html',
})
  .extendApi(({ editor }) => ({
    deserialize: bindFirst(deserializeHtml, editor),
  }))
  .extend({
    parser: {
      format: 'text/html',
      deserialize: ({ api, data }) => {
        const document = parseHtmlDocument(data);

        return api.html.deserialize({
          element: document.body,
        });
      },
    },
  });
