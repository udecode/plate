import type { Value } from '@udecode/slate';

import type { PlateEditor } from '../types/PlateEditor';
import type {
  PluginOptions,
  WithPlatePlugin,
} from '../types/plugin/PlatePlugin';
import type { PluginKey } from '../types/plugin/PlatePluginKey';

/** Get `editor.pluginsByKey` */
export const getPluginsByKey = <
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor?: E
): Record<PluginKey, WithPlatePlugin<P, V, E>> => {
  return (
    (editor?.pluginsByKey as Record<PluginKey, WithPlatePlugin<P, V, E>>) ?? {}
  );
};
