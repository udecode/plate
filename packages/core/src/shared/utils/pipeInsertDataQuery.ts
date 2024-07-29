import type { PlatePluginInsertDataOptions } from '../types/plugin/PlatePluginInsertData';
import type { InjectedPlugin } from './getInjectedPlugins';

/** Is the plugin disabled by another plugin. */
export const pipeInsertDataQuery = (
  plugins: InjectedPlugin[],
  { data, dataTransfer }: PlatePluginInsertDataOptions
) =>
  plugins.every((p) => {
    const query = p.editor?.insertData?.query;

    return (
      !query ||
      query({
        data,
        dataTransfer,
      })
    );
  });
