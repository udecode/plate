import type { BaseEditor } from '../../lib/editor';
import type { ParserOptions } from '../../lib/plugin/SlatePlugin';
import type { AnyBasePlugin } from '../../lib/plugin/BasePlugin';

import { getEditorPlugin } from '../../lib/plugin';

/** Pipe insert-data transformData hooks. */
export const pipeTransformData = (
  editor: BaseEditor,
  plugins: AnyBasePlugin[],
  { data, ...options }: ParserOptions
) => {
  plugins.forEach((p) => {
    const transformData = p.parser?.transformData;

    if (!transformData) return;

    data = transformData({
      ...getEditorPlugin(editor, p),
      data,
      ...options,
    });
  });

  return data;
};
