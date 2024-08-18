import type { AnyPluginConfig, EditorPlugin, WithRequiredKey } from '../../lib';
import type { PlateEditor } from '../editor/PlateEditor';
import type { EditorPlatePlugin } from './PlatePlugin';

import { createPlatePlugin } from './createPlatePlugin';

/** Get editor plugin by key or plugin object. */
export function getPlugin<C extends AnyPluginConfig = AnyPluginConfig>(
  editor: PlateEditor,
  plugin: WithRequiredKey<C>
): C extends EditorPlatePlugin<any>
  ? C
  : C extends EditorPlugin<any>
    ? C
    : EditorPlatePlugin<C> {
  return (
    (editor.plugins[plugin.key] as any) ??
    createPlatePlugin({ key: plugin.key })
  );
}
