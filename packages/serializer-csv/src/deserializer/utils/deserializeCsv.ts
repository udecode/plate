import {
  ELEMENT_DEFAULT,
  getPlugin,
  getPluginType,
  PlateEditor,
  TDescendant,
  TElement,
  TNode,
  Value,
} from '@udecode/plate-common';
import {
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
} from '@udecode/plate-table';
import { parse } from 'papaparse';
import { KEY_DESERIALIZE_CSV } from '../createDeserializeCsvPlugin';
import { DeserializeCsvParseOptions, DeserializeCsvPlugin } from '../types';

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

export const deserializeCsv = <V extends Value>(
  editor: PlateEditor<V>,
  {
    data,
    ...parseOptions
  }: DeserializeCsvParseOptions & {
    data: string;
  }
): TDescendant[] | undefined => {
  const {
    options: { errorTolerance, parseOptions: pluginParseOptions },
  } = getPlugin<DeserializeCsvPlugin, V, PlateEditor<V>>(
    editor,
    KEY_DESERIALIZE_CSV
  );

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
    const table = getPluginType(editor, ELEMENT_TABLE);
    const th = getPluginType(editor, ELEMENT_TH);
    const tr = getPluginType(editor, ELEMENT_TR);
    const td = getPluginType(editor, ELEMENT_TD);

    const ast: TNode = {
      type: table,
      children: [],
    };

    if (csv.meta.fields) {
      // csv file has headers, data structure is an array of objects keyed on the heading title
      ast.children.push({
        type: tr,
        children: csv.meta.fields.map((field: string) => ({
          type: th,
          children: [{ type: paragraph, children: [{ text: field }] }],
        })),
      });
      for (const row of csv.data as Record<string, string>[]) {
        ast.children.push({
          type: tr,
          children: csv.meta.fields.map((field: string) => ({
            type: td,
            children: [
              { type: paragraph, children: [{ text: row[field] || '' }] },
            ],
          })),
        });
      }
    } else {
      // csv is an array of arrays
      for (const row of csv.data as [string[]]) {
        ast.children.push({
          type: tr,
          children: [],
        });
        for (const cell of row) {
          (ast.children.at(-1) as TElement).children.push({
            type: td,
            children: [{ type: paragraph, children: [{ text: cell }] }],
          });
        }
      }
    }
    return [
      {
        type: paragraph,
        children: [{ text: '' }],
      },
      ast,
      {
        type: paragraph,
        children: [{ text: '' }],
      },
    ];
  }
};
