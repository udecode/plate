import type { SlateEditor } from '../editor';
import type {
  AnyPluginConfig,
  PluginConfig,
  WithRequiredKey,
} from './BasePlugin';
import type { SlatePlugin, SlatePluginContext } from './SlatePlugin';

import { resolvePlugin } from '../utils';

export function getSlatePluginContext<C extends AnyPluginConfig = PluginConfig>(
  editor: SlateEditor,
  plugin: WithRequiredKey<C>
): SlatePluginContext<C> {
  const editorPlugin = (plugin as any).options
    ? (plugin as any as SlatePlugin<C>).__resolved
      ? plugin
      : resolvePlugin(editor, plugin as any)
    : editor.getPlugin<C>({ key: plugin } as any);

  return {
    api: editor.api as any,
    editor,
    options: editorPlugin.options,
    plugin: editorPlugin,
    transforms: editor.transforms as any,
    type: editorPlugin.type,
  };
}
