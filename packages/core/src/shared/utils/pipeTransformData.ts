import type { PlatePluginInsertDataOptions } from '../types/plugin/PlatePluginInsertData';
import type { InjectedPlugin } from './getInjectedPlugins';

/** Pipe editor.insertData.transformData */
export const pipeTransformData = (
  plugins: InjectedPlugin[],
  { data, dataTransfer }: PlatePluginInsertDataOptions
) => {
  plugins.forEach((p) => {
    const transformData = p.editor?.insertData?.transformData;

    if (!transformData) return;

    data = transformData(data, { dataTransfer });
  });

  return data;
};
