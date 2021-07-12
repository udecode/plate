import {
  ELEMENT_PARAGRAPH,
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  getSlatePluginType,
  TElement,
  TNode,
} from '@udecode/slate-plugins';
import { SPEditor } from '@udecode/slate-plugins-core';
import { parse } from 'papaparse';

export const deserializeCSV = <T extends SPEditor = SPEditor>(
  editor: T,
  content: string,
  header = false
) => {
  // Verify it's a csv string
  const testCsv = parse(content, { preview: 2 });

  if (testCsv.errors.length === 0) {
    const csv = parse(content, { header });

    const paragraph = getSlatePluginType(editor, ELEMENT_PARAGRAPH);
    const table = getSlatePluginType(editor, ELEMENT_TABLE);
    const th = getSlatePluginType(editor, ELEMENT_TH);
    const tr = getSlatePluginType(editor, ELEMENT_TR);
    const td = getSlatePluginType(editor, ELEMENT_TD);

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
