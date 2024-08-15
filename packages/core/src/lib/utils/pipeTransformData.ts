import type { PlateEditor } from '../editor';
import type {
  AnyEditorPlugin,
  PlatePluginInsertDataOptions,
} from '../plugin/types/PlatePlugin';

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
      api: editor.api,
      data,
      dataTransfer,
      editor,
      plugin: p as any,
    });
  });

  return data;
};
