import type { InferConfig } from '@platejs/core';
import { createBasePlugin } from '@platejs/core';
import { ContentSlice } from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import { bindFirst } from '@udecode/utils';
import type { ParseConfig } from 'papaparse';

import { deserializeCsv } from './deserializer/utils';
import { deserializeCsvWithContext } from './internal/deserializeCsv';

export type CsvParseOptions = ParseConfig;

export type CsvPluginOptions = {
  /**
   * Percentage of tolerated errors compared with the number of rows.
   *
   * @default 0.25
   */
  errorTolerance?: number;
  /**
   * Options passed to PapaParse.
   *
   * @default { header: true }
   * @see https://www.papaparse.com/docs#config
   */
  parseOptions?: CsvParseOptions;
};

/** Enables support for deserializing CSV content into Plate nodes. */
export const CsvPlugin = createBasePlugin({
  key: KEYS.csv,
  options: {
    errorTolerance: 0.25,
    parseOptions: { header: true } as CsvParseOptions,
  } satisfies CsvPluginOptions,
  codecs: ({ defineCodecs, editor, plugin }) =>
    defineCodecs({
      'text/plain': {
        priority: 20,
        scope: 'document',
        decode: ({ data }) => {
          const content = deserializeCsvWithContext(
            {
              getType: (key) => editor.getType(key),
              options: editor.plugin(plugin).getOptions(),
            },
            { data }
          );

          return content ? ContentSlice.closed(content) : null;
        },
      },
    }),
  api: ({ editor }) => ({
    deserialize: bindFirst(deserializeCsv, editor),
  }),
});

export type CsvConfig = InferConfig<typeof CsvPlugin>;
