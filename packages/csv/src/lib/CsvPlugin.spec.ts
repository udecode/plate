import { createBaseEditor } from '@platejs/core';

import { deserializeCsv } from './deserializer/utils/deserializeCsv';
import { CsvPlugin } from './CsvPlugin';

describe('CsvPlugin', () => {
  it('exposes the default options, bound csv api, and plain-text parser contract', () => {
    const editor = createBaseEditor({
      plugins: [CsvPlugin],
    });
    const plugin = editor.getPlugin(CsvPlugin);
    const data = 'name,age\nAda,36';
    const parserOptions = {
      data,
      dataTransfer: new DataTransfer(),
      mimeType: 'text/plain',
    };

    expect(editor.plugin(CsvPlugin).getOptions()).toEqual({
      errorTolerance: 0.25,
      parseOptions: {
        header: true,
      },
    });
    expect(typeof editor.api.csv.deserialize).toBe('function');
    expect(typeof editor.plugin(CsvPlugin).api.deserialize).toBe('function');
    expect(plugin.parser?.format).toBe('text/plain');
    expect(
      plugin.parser?.deserialize?.({
        ...editor.plugin(CsvPlugin),
        ...parserOptions,
      })
    ).toEqual(deserializeCsv(editor, { data }));
  });
});
