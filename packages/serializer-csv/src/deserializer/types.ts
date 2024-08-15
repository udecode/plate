import type { PluginConfig } from '@udecode/plate-common';
import type { ParseConfig } from 'papaparse';

export type DeserializeCsvParseOptions = ParseConfig;

export type DeserializeCsvConfig = PluginConfig<
  'deserializeCsv' & {
    /**
     * Percenta!ge in decimal form, from 0 to a very large number, 0 for no
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
    parseOptions?: ParseConfig;
  }
>;
