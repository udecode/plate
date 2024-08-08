import type {
  AnyEditorPlugin,
  PlateEditor,
  PlatePluginInsertDataOptions,
} from '../types';

/** Pipe editor.insertData.transformData */
export const pipeTransformData = (
  editor: PlateEditor,
  plugins: Partial<AnyEditorPlugin>[],
  { data, dataTransfer }: PlatePluginInsertDataOptions
) => {
  plugins.forEach((p) => {
    const transformData = p.editor?.insertData?.transformData;

    if (!transformData) return;

    data = transformData({ data, dataTransfer, editor, plugin: p as any });
  });

  return data;
};
