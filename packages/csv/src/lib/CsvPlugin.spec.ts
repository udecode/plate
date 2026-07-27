import {
  BaseParagraphPlugin,
  createBaseEditor,
  createBasePlugin,
} from '@platejs/core';
import { ElementApi, schema } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import * as csv from '../index';
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

const createCsvEditor = (state?: {
  errorTolerance?: number;
  header?: boolean;
}) =>
  createBaseEditor({
    plugins: [
      CsvPlugin.configure({
        initialState: {
          ...(state?.errorTolerance === undefined
            ? {}
            : { errorTolerance: state.errorTolerance }),
          ...(state?.header === undefined
            ? {}
            : { parseOptions: { header: state.header } }),
        },
      }),
      TestTablePlugin,
    ],
  });

const getCellTypes = (
  editor: ReturnType<typeof createCsvEditor>,
  data: string
) => {
  const table = editor.api.csv.deserialize({ data })?.[1];

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
  it('exposes initial state, scoped/root api, and the plain-text codec', () => {
    const editor = createCsvEditor();
    const plugin = editor.getPlugin(CsvPlugin);
    const data = 'name,age\nAda,36';
    const dataTransfer = new DataTransfer();

    dataTransfer.setData('text/plain', data);

    expect(editor.plugin(CsvPlugin).store.get()).toMatchObject({
      errorTolerance: 0.25,
      parseOptions: {
        header: true,
      },
    });
    expect(typeof editor.api.csv.deserialize).toBe('function');
    expect(typeof editor.plugin(CsvPlugin).api.deserialize).toBe('function');
    expect('deserializeCsv' in csv).toBe(false);
    expect('deserializeCsvWithContext' in csv).toBe(false);
    expect('parser' in plugin).toBe(false);
    expect(editor.api.clipboard.insertData(dataTransfer)).toBe(true);
    expect(editor.read.children()).toEqual(
      editor.api.csv.deserialize({ data }) as ReturnType<
        typeof editor.read.children
      >
    );
  });

  it('reads live state without changing document schema identity', () => {
    const editor = createCsvEditor();
    const data = 'name,age\nAda,36';
    const identity = editor.read.schema.identity();

    expect(getCellTypes(editor, data)).toEqual(['th', 'th', 'td', 'td']);

    editor.plugin(CsvPlugin).store.set({
      errorTolerance: 1,
      parseOptions: { header: false },
    });

    expect(getCellTypes(editor, data)).toEqual(['td', 'td', 'td', 'td']);
    expect(editor.read.schema.identity()).toEqual(identity);
  });

  it('deserializes header-based csv into paragraphs around a table', () => {
    const editor = createCsvEditor();

    expect(
      editor.api.csv.deserialize({
        data: 'name,age\nAda,36',
      })
    ).toEqual([
      { children: [{ text: '' }], type: 'p' },
      {
        children: [
          {
            children: [
              {
                children: [{ children: [{ text: 'name' }], type: 'p' }],
                type: 'th',
              },
              {
                children: [{ children: [{ text: 'age' }], type: 'p' }],
                type: 'th',
              },
            ],
            type: 'tr',
          },
          {
            children: [
              {
                children: [{ children: [{ text: 'Ada' }], type: 'p' }],
                type: 'td',
              },
              {
                children: [{ children: [{ text: '36' }], type: 'p' }],
                type: 'td',
              },
            ],
            type: 'tr',
          },
        ],
        type: 'table',
      },
      { children: [{ text: '' }], type: 'p' },
    ]);
  });

  it('lets call-site parse options override the plugin header mode', () => {
    const editor = createCsvEditor();

    expect(getCellTypes(editor, 'name,age\nAda,36')).toEqual([
      'th',
      'th',
      'td',
      'td',
    ]);
    expect(
      editor.api.csv
        .deserialize({ data: 'name,age\nAda,36', header: false })
        ?.at(1)
    ).toMatchObject({
      children: [
        { children: [{ type: 'td' }, { type: 'td' }] },
        { children: [{ type: 'td' }, { type: 'td' }] },
      ],
    });
  });

  it('rejects csv without at least two columns', () => {
    const editor = createCsvEditor();

    expect(
      editor.api.csv.deserialize({
        data: 'title\nvalue',
      })
    ).toBeUndefined();
  });

  it('rejects array-mode csv without two rows of two columns', () => {
    const editor = createCsvEditor({ header: false });

    expect(
      editor.api.csv.deserialize({
        data: 'name,age',
      })
    ).toBeUndefined();
  });

  it('uses error tolerance for full-parse field mismatch errors', () => {
    const strictEditor = createCsvEditor({ errorTolerance: 0 });
    const tolerantEditor = createCsvEditor({ errorTolerance: 1 });
    const malformedCsv = 'name,age\nAda,36\nBob,41,extra';

    expect(
      strictEditor.api.csv.deserialize({
        data: malformedCsv,
      })
    ).toBeUndefined();
    expect(
      tolerantEditor.api.csv.deserialize({
        data: malformedCsv,
      })
    ).toBeDefined();
  });

  it('treats negative error tolerance like zero', () => {
    const editor = createCsvEditor({ errorTolerance: -1 });

    expect(
      editor.api.csv.deserialize({
        data: 'name,age\nAda,36\nBob,41,extra',
      })
    ).toBeUndefined();
  });
});
