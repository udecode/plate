import {
  BaseParagraphPlugin,
  createEditor,
  defineBasePlugin,
  ElementApi,
  property,
  schema,
  PLUGINS,
} from '../../core';
import { CsvPlugin } from './CsvPlugin';

const TestTableCellPlugin = defineBasePlugin(PLUGINS.tableCell, {
  schema: ({ plugins }) => ({
    element: {
      content: plugins.blockContent({
        default: BaseParagraphPlugin,
        min: 1,
      }),
      properties: {
        header: property.boolean({ default: false, omitDefault: true }),
      },
      blockContent: false,
    },
  }),
});
const TestTableRowPlugin = defineBasePlugin(PLUGINS.tableRow, {
  dependencies: [TestTableCellPlugin],
  schema: {
    element: {
      content: schema.content.element(TestTableCellPlugin, { min: 1 }),
      blockContent: false,
    },
  },
});
const TestTablePlugin = defineBasePlugin(PLUGINS.table, {
  dependencies: [TestTableRowPlugin],
  schema: {
    element: {
      content: schema.content.element(TestTableRowPlugin, { min: 1 }),
    },
  },
});

const createCsvEditor = (state?: {
  errorTolerance?: number;
  header?: boolean;
}) =>
  createEditor({
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

const getCellHeaders = (
  editor: ReturnType<typeof createCsvEditor>,
  data: string
) => {
  const table = editor.api.csv.deserialize({ data })?.[1];

  if (!ElementApi.isElement(table)) return [];

  return table.children.flatMap((row) =>
    ElementApi.isElement(row)
      ? row.children.flatMap((cell) =>
          ElementApi.isElement(cell) ? [cell.header === true] : []
        )
      : []
  );
};

describe('CsvPlugin', () => {
  it('exposes initial state, scoped/root api, and the plain-text codec', () => {
    const editor = createCsvEditor();
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
    expect(editor.api.dom.clipboard.insertData(dataTransfer)).toBe(true);
    const content = editor.api.csv.deserialize({ data });

    expect(content).toEqual([...editor.read.children()]);
  });

  it('reads live state without changing document schema identity', () => {
    const editor = createCsvEditor();
    const data = 'name,age\nAda,36';
    const identity = editor.read.schema.identity();

    expect(getCellHeaders(editor, data)).toEqual([true, true, false, false]);

    editor.plugin(CsvPlugin).store.set({
      errorTolerance: 1,
      parseOptions: { header: false },
    });

    expect(getCellHeaders(editor, data)).toEqual([false, false, false, false]);
    expect(editor.read.schema.identity()).toEqual(identity);
  });

  it('deserializes header-based csv into paragraphs around a table', () => {
    const editor = createCsvEditor();

    expect(
      editor.api.csv.deserialize({
        data: 'name,age\nAda,36',
      })
    ).toEqual([
      { children: [{ text: '' }], type: 'paragraph' },
      {
        children: [
          {
            children: [
              {
                children: [{ children: [{ text: 'name' }], type: 'paragraph' }],
                header: true,
                type: 'tableCell',
              },
              {
                children: [{ children: [{ text: 'age' }], type: 'paragraph' }],
                header: true,
                type: 'tableCell',
              },
            ],
            type: 'tableRow',
          },
          {
            children: [
              {
                children: [{ children: [{ text: 'Ada' }], type: 'paragraph' }],
                type: 'tableCell',
              },
              {
                children: [{ children: [{ text: '36' }], type: 'paragraph' }],
                type: 'tableCell',
              },
            ],
            type: 'tableRow',
          },
        ],
        type: 'table',
      },
      { children: [{ text: '' }], type: 'paragraph' },
    ]);
  });

  it('lets call-site parse options override the plugin header mode', () => {
    const editor = createCsvEditor();

    expect(getCellHeaders(editor, 'name,age\nAda,36')).toEqual([
      true,
      true,
      false,
      false,
    ]);
    expect(
      editor.api.csv
        .deserialize({ data: 'name,age\nAda,36', header: false })
        ?.at(1)
    ).toMatchObject({
      children: [
        { children: [{ type: 'tableCell' }, { type: 'tableCell' }] },
        { children: [{ type: 'tableCell' }, { type: 'tableCell' }] },
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
