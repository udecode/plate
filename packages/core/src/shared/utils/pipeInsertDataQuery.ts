import type {
  AnyEditorPlugin,
  PlateEditor,
  PlatePluginInsertDataOptions,
} from '../types';

/** Is the plugin disabled by another plugin. */
export const pipeInsertDataQuery = (
  editor: PlateEditor,
  plugins: Partial<AnyEditorPlugin>[],
  { data, dataTransfer }: PlatePluginInsertDataOptions
) =>
  plugins.every((p) => {
    const query = p.editor?.insertData?.query;

    return (
      !query ||
      query({
        data,
        dataTransfer,
        editor,
        plugin: p as any,
      })
    );
  });
