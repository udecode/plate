import { Value } from '@udecode/slate';

import { PlateEditor } from '../types/PlateEditor';
import { PluginOptions } from '../types/plugin/PlatePlugin';
import { PlatePluginInsertDataOptions } from '../types/plugin/PlatePluginInsertData';
import { InjectedPlugin } from './getInjectedPlugins';

/**
 * Is the plugin disabled by another plugin.
 */
export const pipeInsertDataQuery = <
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  plugins: InjectedPlugin<P, V, E>[],
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
