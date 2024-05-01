import type { Value } from '@udecode/slate';

import type { PlateEditor } from '../types/PlateEditor';
import type { PluginOptions } from '../types/plugin/PlatePlugin';
import type { PlatePluginInsertDataOptions } from '../types/plugin/PlatePluginInsertData';
import type { InjectedPlugin } from './getInjectedPlugins';

/** Is the plugin disabled by another plugin. */
export const pipeInsertDataQuery = <
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
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
