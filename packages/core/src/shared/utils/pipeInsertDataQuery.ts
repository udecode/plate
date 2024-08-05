import type { PlateEditor, PlatePluginList } from '../types';
import type { PlatePluginInsertDataOptions } from '../types/plugin/PlatePluginInsertData';

/** Is the plugin disabled by another plugin. */
export const pipeInsertDataQuery = (
  editor: PlateEditor,
  plugins: PlatePluginList,
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
        plugin: p,
      })
    );
  });
