import type { SlateEditor } from '../editor';
import type { ParserOptions } from '../plugin/BasePlugin';
import type { AnyEditorPlugin } from '../plugin/SlatePlugin';

import { getEditorPlugin } from '../plugin';

/** Pipe editor.insertData.transformData */
export const pipeTransformData = (
  editor: SlateEditor,
  plugins: Partial<AnyEditorPlugin>[],
  { data, dataTransfer }: ParserOptions
) => {
  plugins.forEach((p) => {
    const transformData = p.parser?.transformData;

    if (!transformData) return;

    data = transformData({
      ...getEditorPlugin(editor, p as any),
      data,
      dataTransfer,
    });
  });

  return data;
};
