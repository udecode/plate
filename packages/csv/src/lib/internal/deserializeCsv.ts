import type { Descendant } from '@platejs/plite';

import { KEYS } from '@platejs/utils';
import Papa from 'papaparse';

import type { CsvParseOptions, CsvPluginOptions } from '../CsvPlugin';

type CsvTextNode = {
  text: string;
};

type CsvElementNode = {
  children: CsvDescendantNode[];
  type: string;
};

type CsvDescendantNode = CsvElementNode | CsvTextNode;

type CsvArrayRow = string[];
type CsvObjectRow = Record<string, string>;
type CsvRow = CsvArrayRow | CsvObjectRow;

const parseCsv = <T>(data: string, config?: CsvParseOptions) =>
  Papa.parse<T>(data, {
    ...config,
    download: false,
    worker: false,
  });

const materializeCsvParseOptions = (
  options: CsvPluginOptions['parseOptions']
): CsvParseOptions | undefined =>
  options
    ? {
        ...options,
        delimitersToGuess: options.delimitersToGuess
          ? [...options.delimitersToGuess]
          : options.delimitersToGuess,
      }
    : undefined;

const isValidCsv = (
  data: CsvRow[],
  errors: readonly unknown[],
  errorTolerance: number,
  fields?: string[]
) => {
  const tolerance = errorTolerance < 0 ? 0 : errorTolerance;
  const hasHeaders = !!fields;

  if (!data || data.length === 0) return false;

  if (hasHeaders) {
    if (fields.length < 2 || data.length < 1) return false;
  } else if (
    data.length < 2 ||
    !Array.isArray(data[0]) ||
    data[0].length < 2 ||
    !Array.isArray(data[1]) ||
    data[1].length < 2
  ) {
    return false;
  }

  if (errors.length > 0 && errors.length > tolerance * data.length) {
    return false;
  }

  return true;
};

export const deserializeCsvWithContext = (
  context: Readonly<{
    options: Readonly<CsvPluginOptions>;
    getType: (key: string) => string;
  }>,
  {
    data,
    ...parseOptions
  }: {
    data: string;
  } & CsvParseOptions
): Descendant[] | undefined => {
  const { errorTolerance, parseOptions: configuredParseOptions } =
    context.options;
  const pluginParseOptions = materializeCsvParseOptions(configuredParseOptions);

  const testCsv = parseCsv<unknown[]>(data, { preview: 2 });

  if (testCsv.errors.length > 0) return;

  const csv = parseCsv<CsvRow>(data, {
    ...pluginParseOptions,
    ...parseOptions,
  });

  if (
    !isValidCsv(csv.data, csv.errors, errorTolerance ?? 0.25, csv.meta.fields)
  ) {
    return;
  }

  const paragraph = context.getType(KEYS.p);
  const table = context.getType(KEYS.table);
  const th = context.getType(KEYS.th);
  const tr = context.getType(KEYS.tr);
  const td = context.getType(KEYS.td);

  const ast: CsvElementNode = {
    children: [],
    type: table,
  };

  if (csv.meta.fields) {
    ast.children.push({
      children: csv.meta.fields.map((field: string) => ({
        children: [{ children: [{ text: field }], type: paragraph }],
        type: th,
      })),
      type: tr,
    });

    for (const row of csv.data) {
      if (Array.isArray(row)) continue;

      ast.children.push({
        children: csv.meta.fields.map((field: string) => ({
          children: [
            { children: [{ text: row[field] || '' }], type: paragraph },
          ],
          type: td,
        })),
        type: tr,
      });
    }
  } else {
    for (const row of csv.data) {
      if (!Array.isArray(row)) continue;

      const rowElement: CsvElementNode = {
        children: [],
        type: tr,
      };

      ast.children.push(rowElement);

      for (const cell of row) {
        rowElement.children.push({
          children: [{ children: [{ text: cell }], type: paragraph }],
          type: td,
        });
      }
    }
  }

  return [
    {
      children: [{ text: '' }],
      type: paragraph,
    },
    ast,
    {
      children: [{ text: '' }],
      type: paragraph,
    },
  ];
};
