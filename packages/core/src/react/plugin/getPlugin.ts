import type { AnyPluginConfig, PluginConfig, WithRequiredKey } from '../../lib';
import type { PlateEditor } from '../editor/PlateEditor';
import type { PlatePlugin } from './PlatePlugin';

import { createPlatePlugin } from './createPlatePlugin';

/** Get editor plugin by key or plugin object. */
export function getPlugin<C extends AnyPluginConfig = PluginConfig>(
  editor: PlateEditor,
  plugin: WithRequiredKey<C>
): C extends { node: any } ? C : PlatePlugin<C> {
  return (
    (editor.plugins[plugin.key] as any) ??
    createPlatePlugin({ key: plugin.key })
  );
}
