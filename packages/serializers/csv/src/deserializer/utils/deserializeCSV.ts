import { ELEMENT_DEFAULT } from '@udecode/plate-common';
import {
  getPlatePluginType,
  PlateEditor,
  TDescendant,
  TElement,
  TNode,
} from '@udecode/plate-core';
import {
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
} from '@udecode/plate-table';
import { parse } from 'papaparse';

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
    (errors.length && errors.length > errorTolerance * data.length)
  );
};

export const deserializeCSV = <T = {}>(
  editor: PlateEditor<T>,
  content: string,
  header = false,
  errorTolerance: number
): TDescendant[] | undefined => {
  // Verify it's a csv string
  const testCsv = parse(content, { preview: 2 });

  if (testCsv.errors.length === 0) {
    const csv = parse(content, { header });

    if (
      !isValidCsv(
        csv.data as Record<string, string>[][],
        (csv.errors as unknown) as Record<string, string>[][],
        errorTolerance
      )
    )
      return;

    const paragraph = getPlatePluginType(editor, ELEMENT_DEFAULT);
    const table = getPlatePluginType(editor, ELEMENT_TABLE);
    const th = getPlatePluginType(editor, ELEMENT_TH);
    const tr = getPlatePluginType(editor, ELEMENT_TR);
    const td = getPlatePluginType(editor, ELEMENT_TD);

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
          (ast.children[ast.children.length - 1] as TElement).children.push({
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
