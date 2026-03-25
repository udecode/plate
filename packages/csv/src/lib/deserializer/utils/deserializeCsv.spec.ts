import { createSlateEditor } from 'platejs';

import { CsvPlugin } from '../../CsvPlugin';
import { deserializeCsv } from './deserializeCsv';

const createCsvEditor = (options?: {
  errorTolerance?: number;
  header?: boolean;
}) =>
  createSlateEditor({
    plugins: [
      CsvPlugin.configure({
        options: {
          ...(options?.errorTolerance === undefined
            ? {}
            : { errorTolerance: options.errorTolerance }),
          ...(options?.header === undefined
            ? {}
            : { parseOptions: { header: options.header } }),
        },
      }),
    ],
  });

describe('deserializeCsv', () => {
  it('deserializes header-based csv into paragraphs around a table', () => {
    const editor = createCsvEditor();

    expect(
      deserializeCsv(editor, {
        data: 'name,age\nAda,36',
      })
    ).toEqual([
      {
        children: [{ text: '' }],
        type: 'p',
      },
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
      {
        children: [{ text: '' }],
        type: 'p',
      },
    ]);
  });

  it('lets call-site parse options override the plugin default header mode', () => {
    const editor = createCsvEditor();

    expect(
      deserializeCsv(editor, {
        data: 'name,age\nAda,36',
        header: false,
      })
    ).toEqual([
      {
        children: [{ text: '' }],
        type: 'p',
      },
      {
        children: [
          {
            children: [
              {
                children: [{ children: [{ text: 'name' }], type: 'p' }],
                type: 'td',
              },
              {
                children: [{ children: [{ text: 'age' }], type: 'p' }],
                type: 'td',
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
      {
        children: [{ text: '' }],
        type: 'p',
      },
    ]);
  });

  it('returns undefined for csv without at least two columns', () => {
    const editor = createCsvEditor();

    expect(
      deserializeCsv(editor, {
        data: 'title\nvalue',
      })
    ).toBeUndefined();
  });

  it('returns undefined for array-mode csv without at least two rows of two columns', () => {
    const editor = createCsvEditor({ header: false });

    expect(
      deserializeCsv(editor, {
        data: 'name,age',
      })
    ).toBeUndefined();
  });

  it('uses error tolerance for full-parse field mismatch errors', () => {
    const strictEditor = createCsvEditor({ errorTolerance: 0 });
    const tolerantEditor = createCsvEditor({ errorTolerance: 1 });
    const malformedCsv = 'name,age\nAda,36\nBob,41,extra';

    expect(
      deserializeCsv(strictEditor, {
        data: malformedCsv,
      })
    ).toBeUndefined();

    expect(
      deserializeCsv(tolerantEditor, {
        data: malformedCsv,
      })
    ).toEqual([
      {
        children: [{ text: '' }],
        type: 'p',
      },
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
          {
            children: [
              {
                children: [{ children: [{ text: 'Bob' }], type: 'p' }],
                type: 'td',
              },
              {
                children: [{ children: [{ text: '41' }], type: 'p' }],
                type: 'td',
              },
            ],
            type: 'tr',
          },
        ],
        type: 'table',
      },
      {
        children: [{ text: '' }],
        type: 'p',
      },
    ]);
  });

  it('treats negative error tolerance like zero', () => {
    const editor = createCsvEditor({ errorTolerance: -1 });

    expect(
      deserializeCsv(editor, {
        data: 'name,age\nAda,36\nBob,41,extra',
      })
    ).toBeUndefined();
  });
});
