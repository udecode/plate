import { bindFirst } from '@udecode/utils';

import { deserializeHtmlWithParserRuntime } from '../../../internal/plugin/html-parser-runtime';
import { createPreparedParserRuntime } from '../../../internal/plugin/prepareParserRegistry';
import { type PluginConfig, createBasePlugin } from '../../plugin';
import { deserializeHtml, parseHtmlDocument } from './utils';

export type HtmlApi = {
  deserialize: (
    options: Parameters<typeof deserializeHtml>[1]
  ) => ReturnType<typeof deserializeHtml>;
};

/**
 * Enables support for deserializing inserted HTML into Plite content.
 */
export const HtmlPlugin = createBasePlugin<
  PluginConfig<'html', {}, {}, {}, {}, {}, readonly [], never, HtmlApi>
>({ key: 'html' })
  .extendApi(({ editor }) => ({
    deserialize: bindFirst(deserializeHtml, editor),
  }))
  .extend({
    parser: {
      format: 'text/html',
      deserialize: ({ data, ...context }) => {
        const document = parseHtmlDocument(data);

        return deserializeHtmlWithParserRuntime(
          createPreparedParserRuntime(context),
          {
            element: document.body,
          }
        );
      },
      owns: [{ kind: 'schema' }],
    },
  });
