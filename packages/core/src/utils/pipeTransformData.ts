import { Value } from '../slate/types/TEditor';
import { PlatePluginInsertDataOptions } from '../types/plugins/PlatePluginInsertData';
import { InjectedPlugin } from './getInjectedPlugins';

/**
 * Pipe editor.insertData.transformData
 */
export const pipeTransformData = <V extends Value, T = {}>(
  plugins: InjectedPlugin<V, T>[],
  { data, dataTransfer }: PlatePluginInsertDataOptions
) => {
  plugins.forEach((p) => {
    const transformData = p.editor?.insertData?.transformData;
    if (!transformData) return;

    data = transformData(data, { dataTransfer });
  });

  return data;
};
