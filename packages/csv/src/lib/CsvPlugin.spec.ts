import {
  createBaseEditor,
  getPluginHostPolicyResource,
  prepareParserPluginContext,
} from '@platejs/core';
import { ElementApi } from '@platejs/plite';

import * as csv from '../index';
import { deserializeCsv } from './deserializer/utils/deserializeCsv';
import { CsvPlugin, defineCsvConfig } from './CsvPlugin';

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

    expect(editor.plugin(CsvPlugin).getOptions()).toEqual({});
    expect(getPluginHostPolicyResource(plugin.config.profile)).toMatchObject({
      errorTolerance: 0.25,
      parseOptions: {
        header: true,
      },
    });
    expect(typeof editor.api.csv.deserialize).toBe('function');
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

  it('rebinds immutable CSV policy without changing document schema identity', () => {
    const firstConfig = defineCsvConfig({
      id: 'plate-test:csv:host-policy',
      parseOptions: { header: true },
      version: 1,
    });
    const editor = createBaseEditor({
      plugins: [CsvPlugin.configure({ config: firstConfig })],
    });
    const data = 'name,age\nAda,36';
    const identity = editor.read.schema.identity();
    const firstProfile = editor.getPlugin(CsvPlugin).config.profile;

    expect(Object.isFrozen(firstProfile)).toBe(true);
    expect(JSON.stringify(firstProfile)).toBe(
      '{"id":"plate-test:csv:host-policy","version":1}'
    );
    expect(getCellTypes(editor, data)).toEqual(['th', 'th', 'td', 'td']);

    Reflect.apply(editor.plugin(CsvPlugin).setOptions, undefined, [
      {
        errorTolerance: 1,
        parseOptions: { header: false },
      },
    ]);

    expect(getCellTypes(editor, data)).toEqual(['th', 'th', 'td', 'td']);
    expect(editor.read.schema.identity()).toEqual(identity);

    const secondConfig = defineCsvConfig({
      id: 'plate-test:csv:host-policy',
      parseOptions: { header: false },
      version: 1,
    });

    editor.configure(CsvPlugin, secondConfig);

    expect(editor.getPlugin(CsvPlugin).config.profile).not.toBe(firstProfile);
    expect(getCellTypes(editor, data)).toEqual(['td', 'td', 'td', 'td']);
    expect(editor.read.schema.identity()).toEqual(identity);
  });
});
