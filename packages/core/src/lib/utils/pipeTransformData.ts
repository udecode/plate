import type { SlateEditor } from '../editor';
import type { PlatePluginInsertDataOptions } from '../plugin/BasePlugin';
import type { AnyEditorPlugin } from '../plugin/SlatePlugin';

import { getPluginContext } from '../plugin';

/** Pipe editor.insertData.transformData */
export const pipeTransformData = (
  editor: SlateEditor,
  plugins: Partial<AnyEditorPlugin>[],
  { data, dataTransfer }: PlatePluginInsertDataOptions
) => {
  plugins.forEach((p) => {
    const transformData = p.editor?.insertData?.transformData;

    if (!transformData) return;

    data = transformData({
      ...getPluginContext(editor, p as any),
      data,
      dataTransfer,
    });
  });

  return data;
};
