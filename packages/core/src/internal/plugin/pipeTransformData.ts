import type { BasePlateEditor } from '../../lib/editor';
import type { ParserOptions } from '../../lib/plugin/BasePlugin';
import type { AnyEditorPlugin } from '../../lib/plugin/EditorPlugin';

import { getEditorPlugin } from '../../lib/plugin';

/** Pipe insert-data transformData hooks. */
export const pipeTransformData = (
  editor: BasePlateEditor,
  plugins: Partial<AnyEditorPlugin>[],
  { data, ...options }: ParserOptions
) => {
  plugins.forEach((p) => {
    const transformData = p.parser?.transformData;

    if (!transformData) return;

    data = transformData({
      ...getEditorPlugin(editor, p as any),
      data,
      ...options,
    });
  });

  return data;
};
