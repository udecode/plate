import type { Value } from '@udecode/slate';

import type { PluginOptions } from '../types/plugin/PlatePlugin';
import type { PlatePluginInsertDataOptions } from '../types/plugin/PlatePluginInsertData';
import type { InjectedPlugin } from './getInjectedPlugins';

/** Pipe editor.insertData.transformData */
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
