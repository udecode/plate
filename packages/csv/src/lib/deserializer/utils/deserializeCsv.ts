import type { BaseEditor, PluginConfig } from '@platejs/core';
import { prepareParserPluginContext } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import type { CsvParseOptions, CsvPluginOptions } from '../../CsvPlugin';
import { deserializeCsvWithParserContext } from '../../internal/deserializeCsv';

type CsvRuntimePluginConfig = PluginConfig<'csv', CsvPluginOptions>;

export type DeserializeCsvOptions = { data: string } & CsvParseOptions;

export const deserializeCsv = (
  editor: BaseEditor,
  options: DeserializeCsvOptions
) => {
  const plugin = editor.plugin<CsvRuntimePluginConfig>({
    key: KEYS.csv,
  }).plugin;
  const createContext = prepareParserPluginContext(editor, plugin);

  return editor.read((state) =>
    deserializeCsvWithParserContext(createContext(state), options)
  );
};
