import type { BaseEditor } from '../../lib/editor';
import type { ParserOptions } from '../../lib/plugin/PluginBase';
import type { AnyBasePlugin } from '../../lib/plugin/BasePlugin';

import { getBasePlugin } from '../../lib/plugin';

/** Pipe insert-data transformData hooks. */
export const pipeTransformData = (
  editor: BaseEditor,
  plugins: Partial<AnyBasePlugin>[],
  { data, ...options }: ParserOptions
) => {
  plugins.forEach((p) => {
    const transformData = p.parser?.transformData;

    if (!transformData) return;

    data = transformData({
      ...getBasePlugin(editor, p as any),
      data,
      ...options,
    });
  });

  return data;
};
