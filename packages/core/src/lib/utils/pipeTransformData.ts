import type { PlateEditor } from '../editor';
import type {
  AnyEditorPlugin,
  PlatePluginInsertDataOptions,
} from '../plugin/types/PlatePlugin';

import { getPluginContext } from '../plugin';

/** Pipe editor.insertData.transformData */
export const pipeTransformData = (
  editor: PlateEditor,
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
