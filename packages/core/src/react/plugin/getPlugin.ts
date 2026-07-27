import type { AnyPluginConfig, PluginConfig, WithRequiredKey } from '../../lib';
import type { PlateEditor } from '../editor/PlateEditor';
import type { PlatePlugin } from './PlatePlugin';

import { getCompiledPlatePlugin } from '../../internal/plugin/compilePlateModel';
import { createPlatePlugin } from './createPlatePlugin';

/** Get editor plugin by key or plugin object. */
export function getPlugin<C extends AnyPluginConfig = PluginConfig>(
  editor: PlateEditor,
  plugin: WithRequiredKey<C>
): C extends { clone: any } ? C : PlatePlugin<C> {
  const createFallback = createPlatePlugin as (config: {
    key: string;
  }) => PlatePlugin<AnyPluginConfig>;

  return (
    (getCompiledPlatePlugin(editor, plugin.key) as any) ??
    createFallback({ key: plugin.key })
  );
}
