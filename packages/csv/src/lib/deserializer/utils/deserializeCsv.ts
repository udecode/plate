import type { SlateEditor } from 'platejs';

import Papa from 'papaparse';
import { KEYS } from 'platejs';

import { type CsvParseOptions, CsvPlugin } from '../../CsvPlugin';

type CsvTextNode = {
  text: string;
};

type CsvElementNode = {
  children: CsvDescendantNode[];
  type: string;
};

type CsvDescendantNode = CsvElementNode | CsvTextNode;

const parseCsv = <T>(data: string, config?: CsvParseOptions) =>
  Papa.parse<T>(data, {
    ...config,
    download: false,
    worker: false,
  });

type CsvArrayRow = string[];
type CsvObjectRow = Record<string, string>;
type CsvRow = CsvArrayRow | CsvObjectRow;

const isValidCsv = (
  data: CsvRow[],
  errors: Record<string, string>[][],
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

  if (errors.length > 0 && errors.length > tolerance * data.length)
    return false;

  return true;
};

export const deserializeCsv = (
  editor: SlateEditor,
  {
    data,
    ...parseOptions
  }: {
    data: string;
  } & CsvParseOptions
): SlateEditor['children'] | undefined => {
  const { errorTolerance, parseOptions: pluginParseOptions } =
    editor.getOptions(CsvPlugin);

  // Verify it's a csv string
  const testCsv = parseCsv<unknown[]>(data, { preview: 2 });

  if (testCsv.errors.length === 0) {
    const csv = parseCsv<any>(data, {
      ...pluginParseOptions,
      ...parseOptions,
    });

    if (
      !isValidCsv(
        csv.data as CsvRow[],
        csv.errors as unknown as Record<string, string>[][],
        errorTolerance!,
        csv.meta.fields
      )
    )
      return;

    const paragraph = editor.getType(KEYS.p);
    const table = editor.getType(KEYS.table);
    const th = editor.getType(KEYS.th);
    const tr = editor.getType(KEYS.tr);
    const td = editor.getType(KEYS.td);

    const ast: CsvElementNode = {
      children: [],
      type: table,
    };

    if (csv.meta.fields) {
      // csv file has headers, data structure is an array of objects keyed on the heading title
      ast.children.push({
        children: csv.meta.fields.map((field: string) => ({
          children: [{ children: [{ text: field }], type: paragraph }],
          type: th,
        })),
        type: tr,
      });

      for (const row of csv.data as Record<string, string>[]) {
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
      // csv is an array of arrays
      for (const row of csv.data as [string[]]) {
        ast.children.push({
          children: [],
          type: tr,
        });

        for (const cell of row) {
          (ast.children.at(-1) as CsvElementNode | undefined)?.children.push({
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
  }
};
