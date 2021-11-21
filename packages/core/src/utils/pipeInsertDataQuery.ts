import { PlatePluginInsertDataOptions } from '../types/plugins/PlatePluginInsertData';
import { InjectedPlugin } from './getInjectedPlugins';

/**
 * Is the plugin disabled by another plugin.
 */
export const pipeInsertDataQuery = <T = {}>(
  plugins: InjectedPlugin<T>[],
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
