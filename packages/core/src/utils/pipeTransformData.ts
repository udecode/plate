import { Value } from '../slate/editor/TEditor';
import { PluginOptions } from '../types/plugins/PlatePlugin';
import { PlatePluginInsertDataOptions } from '../types/plugins/PlatePluginInsertData';
import { InjectedPlugin } from './getInjectedPlugins';

/**
 * Pipe editor.insertData.transformData
 */
export const pipeTransformData = <V extends Value>(
  plugins: InjectedPlugin<PluginOptions, V>[],
  { data, dataTransfer }: PlatePluginInsertDataOptions
) => {
  plugins.forEach((p) => {
    const transformData = p.editor?.insertData?.transformData;
    if (!transformData) return;

    data = transformData(data, { dataTransfer });
  });

  return data;
};
