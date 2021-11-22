import { PlatePluginInsertDataOptions } from '../types/plugins/PlatePluginInsertData';
import { InjectedPlugin } from './getInjectedPlugins';

/**
 * Pipe editor.insertData.transformData
 */
export const pipeTransformData = <T = {}>(
  plugins: InjectedPlugin<T>[],
  { data, dataTransfer }: PlatePluginInsertDataOptions
) => {
  plugins.forEach((p) => {
    const transformData = p.editor?.insertData?.transformData;
    if (!transformData) return;

    data = transformData(data, { dataTransfer });
  });

  return data;
};
