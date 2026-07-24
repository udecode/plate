import type { InferConfig } from '@platejs/core';
import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';
import { bindFirst } from '@udecode/utils';
import type { ParseConfig } from 'papaparse';

import { deserializeCsv } from './deserializer/utils';
import { deserializeCsvWithParserContext } from './internal/deserializeCsv';

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
})
  .extendApi(({ editor }) => ({
    deserialize: bindFirst(deserializeCsv, editor),
  }))
  .extend({
    parser: {
      format: 'text/plain',
      deserialize: (context) =>
        deserializeCsvWithParserContext(context, { data: context.data }),
      owns: [{ kind: 'schema' }],
    },
  });

export type CsvConfig = InferConfig<typeof CsvPlugin>;
