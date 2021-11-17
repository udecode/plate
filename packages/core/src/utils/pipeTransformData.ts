import { PlatePluginInjectedPlugin } from '../types/plugins/PlatePluginInjectedPlugin';
import { PlatePluginInsertDataOptions } from '../types/plugins/PlatePluginInsertData';

/**
 * Pipe injectPlugins.transformData
 */
export const pipeTransformData = (
  injectedPlugins: PlatePluginInjectedPlugin[],
  { data, dataTransfer }: PlatePluginInsertDataOptions
) => {
  injectedPlugins.forEach(({ transformData }) => {
    if (!transformData) return;

    data = transformData(data, { dataTransfer });
  });

  return data;
};
