import {
  createBaseEditor,
  prepareParserPluginContext,
} from '@platejs/core';
import { ElementApi } from '@platejs/plite';

import * as csv from '../index';
import { deserializeCsv } from './deserializer/utils/deserializeCsv';
import { CsvPlugin } from './CsvPlugin';

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
  it('exposes the default options, bound csv api, and plain-text parser contract', () => {
    const editor = createBaseEditor({
      plugins: [CsvPlugin],
    });
    const plugin = editor.getPlugin(CsvPlugin);
    const data = 'name,age\nAda,36';
    const dataTransfer = new DataTransfer();
    const createContext = prepareParserPluginContext(editor, CsvPlugin);
    const parserOptions = {
      data,
      format: 'text/plain',
      source: {
        files: dataTransfer.files,
        getData: (format: string) => dataTransfer.getData(format),
        types: [...dataTransfer.types],
      },
    };

    expect(editor.plugin(CsvPlugin).getOptions()).toMatchObject({
      errorTolerance: 0.25,
      parseOptions: {
        header: true,
      },
    });
    expect(Reflect.get(editor.api, 'csv')).toBeUndefined();
    expect(typeof editor.plugin(CsvPlugin).api.deserialize).toBe('function');
    expect('deserializeCsvWithParserContext' in csv).toBe(false);
    expect(plugin.parser?.format).toBe('text/plain');
    expect(
      editor.read((state) =>
        plugin.parser?.deserialize?.({
          ...createContext(state),
          ...parserOptions,
        })
      )
    ).toEqual(deserializeCsv(editor, { data }));
  });

  it('reads live parser options without changing document schema identity', () => {
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
