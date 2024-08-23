import { bindFirst } from '@udecode/utils';

import { createSlatePlugin } from '../../plugin';
import { deserializeHtml, parseHtmlDocument } from './utils';

/**
 * Enables support for deserializing inserted content from HTML format to Slate
 * format.
 */
export const HtmlPlugin = createSlatePlugin({
  key: 'html',
})
  .extendApi(({ editor }) => ({
    deserialize: bindFirst(deserializeHtml, editor),
  }))
  .extend({
    parser: {
      deserialize: ({ api, data }) => {
        const document = parseHtmlDocument(data);

        return api.html.deserialize({
          element: document.body,
        });
      },
      format: 'text/html',
    },
  });
