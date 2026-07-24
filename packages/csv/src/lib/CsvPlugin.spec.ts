import {
  BaseParagraphPlugin,
  createBaseEditor,
  createBasePlugin,
} from '@platejs/core';
import { ElementApi, schema } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import * as csv from '../index';
import { deserializeCsv } from './deserializer/utils/deserializeCsv';
import { CsvPlugin } from './CsvPlugin';

const TestTableCellPlugin = createBasePlugin({
  key: KEYS.td,
  schema: ({ plugins }) => ({
    element: {
      content: plugins.blockContent({
        default: { type: plugins.elementType(BaseParagraphPlugin) },
        min: 1,
      }),
      topLevel: false,
    },
  }),
});
const TestTableHeaderPlugin = createBasePlugin({
  key: KEYS.th,
  schema: ({ plugins }) => ({
    element: {
      content: plugins.blockContent({
        default: { type: plugins.elementType(BaseParagraphPlugin) },
        min: 1,
      }),
      topLevel: false,
    },
  }),
});
const TestTableRowPlugin = createBasePlugin({
  dependencies: [TestTableCellPlugin, TestTableHeaderPlugin],
  key: KEYS.tr,
  schema: ({ plugins }) => ({
    element: {
      content: schema.content.types(
        plugins.elementTypes([TestTableCellPlugin, TestTableHeaderPlugin]),
        { default: { type: plugins.elementType(TestTableCellPlugin) }, min: 1 }
      ),
      topLevel: false,
    },
  }),
});
const TestTablePlugin = createBasePlugin({
  dependencies: [TestTableRowPlugin],
  key: KEYS.table,
  schema: ({ plugins }) => ({
    element: {
      content: schema.content.type(plugins.elementType(TestTableRowPlugin), {
        default: { type: plugins.elementType(TestTableRowPlugin) },
        min: 1,
      }),
    },
  }),
});

const getCellTypes = (
  editor: Parameters<typeof deserializeCsv>[0],
  data: string
) => {
  const table = deserializeCsv(editor, { data })?.[1];

  if (!ElementApi.isElement(table)) return [];

  return table.children.flatMap((row) =>
    ElementApi.isElement(row)
      ? row.children.flatMap((cell) =>
          ElementApi.isElement(cell) ? [cell.type] : []
        )
      : []
  );
};

describe('CsvPlugin', () => {
  it('exposes the default options, bound csv api, and plain-text codec', () => {
    const editor = createBaseEditor({
      plugins: [CsvPlugin, TestTablePlugin],
    });
    const plugin = editor.getPlugin(CsvPlugin);
    const data = 'name,age\nAda,36';
    const dataTransfer = new DataTransfer();

    dataTransfer.setData('text/plain', data);

    expect(editor.plugin(CsvPlugin).getOptions()).toMatchObject({
      errorTolerance: 0.25,
      parseOptions: {
        header: true,
      },
    });
    expect(typeof editor.api.csv.deserialize).toBe('function');
    expect(typeof editor.plugin(CsvPlugin).api.deserialize).toBe('function');
    expect('deserializeCsvWithContext' in csv).toBe(false);
    expect('parser' in plugin).toBe(false);
    expect(editor.api.clipboard.insertData(dataTransfer)).toBe(true);
    const expected = deserializeCsv(editor, { data });

    expect(expected).toBeDefined();
    if (!expected) return;
    expect(editor.read.children()).toEqual(
      expected as ReturnType<typeof editor.read.children>
    );
  });

  it('reads live codec options without changing document schema identity', () => {
    const editor = createBaseEditor({
      plugins: [CsvPlugin],
    });
    const data = 'name,age\nAda,36';
    const identity = editor.read.schema.identity();

    expect(getCellTypes(editor, data)).toEqual(['th', 'th', 'td', 'td']);

    editor.plugin(CsvPlugin).setOptions({
      errorTolerance: 1,
      parseOptions: { header: false },
    });

    expect(getCellTypes(editor, data)).toEqual(['td', 'td', 'td', 'td']);
    expect(editor.read.schema.identity()).toEqual(identity);
  });
});
