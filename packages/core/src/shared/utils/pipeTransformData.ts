import type { PlateEditor, PlatePluginList } from '../types';
import type { PlatePluginInsertDataOptions } from '../types/plugin/PlatePluginInsertData';

/** Pipe editor.insertData.transformData */
export const pipeTransformData = (
  editor: PlateEditor,
  plugins: PlatePluginList,
  { data, dataTransfer }: PlatePluginInsertDataOptions
) => {
  plugins.forEach((p) => {
    const transformData = p.editor?.insertData?.transformData;

    if (!transformData) return;

    data = transformData({ data, dataTransfer, editor, plugin: p });
  });

  return data;
};
