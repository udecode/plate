import type { BaseEditor } from '../editor';
import type {
  AnyPluginConfig,
  PluginConfig,
  WithRequiredKey,
} from './PluginConfig';
import type { BasePlugin } from './BasePlugin';
import {
  getCompiledPlatePlugin,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';

/** Get editor plugin by key or plugin object. */
export function getBasePlugin<C extends AnyPluginConfig = PluginConfig>(
  editor: BaseEditor,
  p: WithRequiredKey<C>
): C extends { clone: any } ? C : BasePlugin<C> {
  const editorPlugin = getCompiledPlatePlugin(editor, p.key) as any;

  if (!editorPlugin) {
    throw new Error(`Plate plugin "${p.key}" is not installed.`);
  }

  return editorPlugin;
}

/** Resolve an installed plugin type, or preserve an optional absent key. */
export function getPluginType(editor: BaseEditor, key: string): string {
  const plugin = getCompiledPlatePlugin(editor, key);

  return plugin?.type ?? key;
}

/** Get editor plugin types by key. */
export const getPluginTypes = (editor: BaseEditor, keys: readonly string[]) =>
  keys.map((key) => editor.getType(key));

export const getPluginKey = (
  editor: BaseEditor,
  type: string
): string | undefined => getPlateRuntime(editor).pluginCache.node.types[type];

export const getPluginKeys = (
  editor: BaseEditor,
  types: readonly string[]
): string[] =>
  types
    .map((type) => {
      const pluginKey = getPluginKey(editor, type);
      return pluginKey ?? type;
    })
    .filter(Boolean);

export const getPluginByType = (editor: BaseEditor, type: string) => {
  const key = getPluginKey(editor, type);
  if (!key) return null;

  return editor.getPlugin({ key });
};

export const getContainerTypes = (editor: BaseEditor) =>
  getPluginTypes(
    editor,
    getPlateRuntime(editor).pluginCache.node.containerTypes
  );
