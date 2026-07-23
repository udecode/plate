import type { PlateEditor } from '../editor';
import type {
  InferConfig,
  PlatePlugin,
  PlatePluginContext,
} from './PlatePlugin';

import {
  type AnyPluginConfig,
  type BasePluginInput,
  type WithRequiredKey,
  getEditorPlugin as getBaseEditorPlugin,
} from '../../lib';

export function getEditorPlugin<P extends BasePluginInput>(
  editor: PlateEditor,
  plugin: WithRequiredKey<P>
): PlatePluginContext<InferConfig<P>>;
export function getEditorPlugin(
  editor: PlateEditor,
  plugin: WithRequiredKey<AnyPluginConfig> | PlatePlugin<AnyPluginConfig>
): PlatePluginContext<any> {
  return getBaseEditorPlugin(editor, plugin) as any;
}
