import {
  ELEMENT_DEFAULT,
  type PlateEditor,
  type TDescendant,
  type TElement,
  type TNode,
  getPlugin,
  getPluginType,
} from '@udecode/plate-common/server';
import papaparse from 'papaparse';

import type {
  DeserializeCsvParseOptions,
  DeserializeCsvPluginOptions,
} from '../types';

import { KEY_DESERIALIZE_CSV } from '../DeserializeCsvPlugin';

const { parse } = papaparse;

const isValidCsv = (
  data: Record<string, string>[][],
  errors: Record<string, string>[][],
  errorTolerance: number
) => {
  if (errorTolerance < 0) errorTolerance = 0;

  return !(
    !data ||
    data.length < 2 ||
    data[0].length < 2 ||
    data[1].length < 2 ||
    (errors.length > 0 && errors.length > errorTolerance * data.length)
  );
};

export const deserializeCsv = (
  editor: PlateEditor,
  {
    data,
    ...parseOptions
  }: {
    data: string;
  } & DeserializeCsvParseOptions
): TDescendant[] | undefined => {
  const {
    options: { errorTolerance, parseOptions: pluginParseOptions },
  } = getPlugin<DeserializeCsvPluginOptions>(editor, KEY_DESERIALIZE_CSV);

  // Verify it's a csv string
  const testCsv = parse(data, { preview: 2 });

  if (testCsv.errors.length === 0) {
    const csv = parse(data, {
      ...pluginParseOptions,
      ...parseOptions,
    });

    if (
      !isValidCsv(
        csv.data as Record<string, string>[][],
        csv.errors as unknown as Record<string, string>[][],
        errorTolerance!
      )
    )
      return;

    const paragraph = getPluginType(editor, ELEMENT_DEFAULT);
    const table = getPluginType(editor, 'table');
    const th = getPluginType(editor, 'th');
    const tr = getPluginType(editor, 'tr');
    const td = getPluginType(editor, 'td');

    const ast: TNode = {
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
          (ast.children.at(-1) as TElement).children.push({
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
