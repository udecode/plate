import type { Value } from '@platejs/plite';

import type { AnyPluginConfig, PluginConfig, WithRequiredKey } from '../../lib';
import type { PlateEditor } from '../editor/PlateEditor';
import type { PlatePlugin } from './PlatePlugin';

import { getCompiledPlatePlugin } from '../../internal/plugin/compilePlateModel';

/** Get one installed editor plugin by key or descriptor. */
export function getPlugin<
  V extends Value,
  P extends AnyPluginConfig,
  C extends AnyPluginConfig = PluginConfig,
>(
  editor: PlateEditor<V, P>,
  plugin: WithRequiredKey<C>
): C extends { clone: unknown } ? C : PlatePlugin<C>;
export function getPlugin(
  editor: object,
  plugin: Readonly<{ key: string }>
): unknown {
  const installed = getCompiledPlatePlugin(editor, plugin.key);

  if (!installed) {
    throw new Error(`Plate plugin "${plugin.key}" is not installed.`);
  }

  return installed;
}
