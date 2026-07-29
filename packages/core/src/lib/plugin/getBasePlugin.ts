import type { Value } from '@platejs/plite';

import type { BaseEditor } from '../editor';
import type {
  AnyPluginConfig,
  PluginConfig,
  PluginReference,
  WithRequiredKey,
} from './PluginConfig';
import type { BasePlugin } from './BasePlugin';
import {
  getCompiledPlatePlugin,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';

/** Get one installed editor plugin by descriptor or key. */
export function getBasePlugin<
  V extends Value,
  P extends AnyPluginConfig,
  C extends AnyPluginConfig,
>(
  editor: BaseEditor<V, P>,
  plugin: PluginReference & { readonly __config: C }
): BasePlugin<C>;
export function getBasePlugin<
  V extends Value,
  P extends AnyPluginConfig,
  C extends AnyPluginConfig = PluginConfig,
>(editor: BaseEditor<V, P>, p: WithRequiredKey<C>): BasePlugin<C>;
export function getBasePlugin(
  editor: object,
  p: Readonly<{ key: string }>
): unknown {
  const editorPlugin = getCompiledPlatePlugin(editor, p.key);

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
