import type { Value } from '@platejs/plite';

import type { PlateEditor } from '../editor';
import type { InferConfig, PlatePluginContext } from './PlatePlugin';

import {
  type AnyPluginConfig,
  type BasePluginInput,
  type WithRequiredKey,
  getEditorPlugin as getBaseEditorPlugin,
} from '../../lib';

export function getEditorPlugin<
  V extends Value,
  E extends AnyPluginConfig,
  P extends BasePluginInput,
>(
  editor: PlateEditor<V, E>,
  plugin: WithRequiredKey<P>
): PlatePluginContext<InferConfig<P>>;
export function getEditorPlugin(
  editor: object,
  plugin: Readonly<{ key: string }>
): unknown {
  return Reflect.apply(getBaseEditorPlugin, undefined, [editor, plugin]);
}
