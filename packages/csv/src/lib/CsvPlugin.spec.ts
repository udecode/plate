import { createSlateEditor } from 'platejs';

import { deserializeCsv } from './deserializer/utils/deserializeCsv';
import { CsvPlugin } from './CsvPlugin';

describe('CsvPlugin', () => {
  it('exposes the default options, bound csv api, and plain-text parser contract', () => {
    const editor = createSlateEditor({
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
    expect(typeof editor.getApi(CsvPlugin).csv.deserialize).toBe('function');
    expect(plugin.parser?.format).toBe('text/plain');
    expect(plugin.parser?.deserialize?.(parserOptions as any)).toEqual(
      deserializeCsv(editor, { data })
    );
  });
});
