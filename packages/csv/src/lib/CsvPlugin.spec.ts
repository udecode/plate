import { createBasePlateEditor } from 'platejs';
import { createPlateEditor } from 'platejs/react';

import { deserializeCsv } from './deserializer/utils/deserializeCsv';
import { CsvPlugin } from './CsvPlugin';

describe('CsvPlugin', () => {
  it('exposes the default options, bound csv api, and plain-text parser contract', () => {
    const editor = createBasePlateEditor({
      plugins: [CsvPlugin],
    });
    const plugin = editor.getPlugin(CsvPlugin);
    const data = 'name,age\nAda,36';
    const parserOptions = {
      data,
      dataTransfer: {} as DataTransfer,
      mimeType: 'text/plain',
    };

    expect(editor.getOptions(CsvPlugin)).toEqual({
      errorTolerance: 0.25,
      parseOptions: {
        header: true,
      },
    });
    expect(typeof editor.api.csv.deserialize).toBe('function');
    expect(plugin.parser?.format).toBe('text/plain');
    expect(plugin.parser?.deserialize?.(parserOptions as any)).toEqual(
      deserializeCsv(editor, { data })
    );
  });

  it('exposes the csv api on the Plite runtime route', () => {
    const editor = createPlateEditor({
      plugins: [CsvPlugin],
      runtime: 'plite',
    });
    const api = editor.api as typeof editor.api & {
      csv: {
        deserialize: (
          options: Parameters<typeof deserializeCsv>[1]
        ) => ReturnType<typeof deserializeCsv>;
      };
    };

    expect(typeof api.csv.deserialize).toBe('function');
    expect(api.csv.deserialize({ data: 'name,age\nAda,36' })).toEqual([
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
});
