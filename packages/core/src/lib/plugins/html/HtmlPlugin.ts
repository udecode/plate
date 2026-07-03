import { bindFirst } from '@udecode/utils';

import { createBasePlugin } from '../../plugin';
import { deserializeHtml, parseHtmlDocument } from './utils';

export type HtmlApi = {
  html: {
    deserialize: (
      options: Parameters<typeof deserializeHtml>[1]
    ) => ReturnType<typeof deserializeHtml>;
  };
};

/**
 * Enables support for deserializing inserted content from HTML format to Plite
 * format and serializing Plite content to HTML format.
 */
export const HtmlPlugin = createBasePlugin({
  key: 'html',
})
  .extendApi(({ editor }) => ({
    deserialize: bindFirst(deserializeHtml, editor),
  }))
  .extend({
    parser: {
      format: 'text/html',
      deserialize: ({ data, editor }) => {
        const document = parseHtmlDocument(data);

        return deserializeHtml(editor, {
          element: document.body,
        });
      },
    },
  });
