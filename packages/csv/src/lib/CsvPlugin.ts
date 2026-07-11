import type { ParseConfig } from 'papaparse';
import type { PluginConfig } from '@platejs/core';
import type { OmitFirst } from '@udecode/utils';

import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';
import { bindFirst } from '@udecode/utils';

import { deserializeCsv } from './deserializer/utils';

export type CsvConfig = PluginConfig<
  'csv',
  {
    /**
     * Percentage in decimal form, from 0 to a very large number, 0 for no
     * errors allowed, Percentage based on number of errors compared to number
     * of rows
     *
     * @default 0.25
     */
    errorTolerance?: number;
    /**
     * Options to pass to papaparse
     *
     * @default { header: true }
     * @see https://www.papaparse.com/docs#config
     */
    parseOptions?: CsvParseOptions;
  },
  {
    csv: {
      deserialize: OmitFirst<typeof deserializeCsv>;
    };
  }
>;

export type CsvParseOptions = ParseConfig;

/** Enables support for deserializing CSV content into Plate nodes. */
export const CsvPlugin = createBasePlugin<CsvConfig>({
  key: KEYS.csv,
  options: {
    errorTolerance: 0.25,
    parseOptions: {
      header: true,
    },
  },
})
  .extendApi(({ editor }) => ({
    deserialize: bindFirst(deserializeCsv, editor),
  }))
  .extend({
    parser: {
      format: 'text/plain',
      deserialize: ({ api, data }) => api.deserialize({ data }),
    },
  });
