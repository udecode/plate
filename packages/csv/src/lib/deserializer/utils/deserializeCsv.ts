import type { BaseEditor, PluginConfig } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import type { CsvParseOptions, CsvPluginOptions } from '../../CsvPlugin';
import { deserializeCsvWithContext } from '../../internal/deserializeCsv';

type CsvRuntimePluginConfig = PluginConfig<'csv', CsvPluginOptions>;

export type DeserializeCsvOptions = { data: string } & CsvParseOptions;

export const deserializeCsv = (
  editor: BaseEditor,
  options: DeserializeCsvOptions
) => {
  const plugin = editor.plugin<CsvRuntimePluginConfig>({
    key: KEYS.csv,
  }).plugin;

  return deserializeCsvWithContext(
    {
      getType: (key) => editor.getType(key),
      options: editor.plugin(plugin).getOptions(),
    },
    options
  );
};
