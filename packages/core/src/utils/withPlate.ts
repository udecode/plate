import defaultsDeep from 'lodash/defaultsDeep';
import { createHistoryPlugin } from '../plugins/createHistoryPlugin';
import { createInlineVoidPlugin } from '../plugins/createInlineVoidPlugin';
import { createReactPlugin } from '../plugins/createReactPlugin';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';
import { TEditor } from '../types/slate/TEditor';

export interface WithPlateOptions {
  id?: string | null;
  plugins?: PlatePlugin[];
}

/**
 * Apply `withInlineVoid` and all plate plugins `withOverrides`.
 * Overrides:
 * - `id`: id of the editor.
 * - `key`: random key for the <Slate> component so each time the editor is created, the component resets.
 * - `options`: Plate options
 */
export const withPlate = ({
  id = 'main',
  plugins: _plugins = [createReactPlugin(), createHistoryPlugin()],
}: WithPlateOptions = {}) => <T extends TEditor>(e: T) => {
  let editor = (e as any) as PlateEditor;

  editor.id = id as string;

  if (!editor.key) {
    editor.key = Math.random();
  }

  editor.plugins = [];
  editor.pluginsByKey = {};

  // recursive plugin.then
  const mergePlugin = (plugin: PlatePlugin): PlatePlugin => {
    if (plugin.then) {
      return mergePlugin(defaultsDeep(plugin.then(editor, plugin), plugin));
    }

    return plugin;
  };

  // recursive plugin.plugins
  const addEditorPlugins = (plugins?: PlatePlugin[]) => {
    if (!plugins) return;

    plugins.forEach((plugin) => {
      if (plugin.type === undefined) plugin.type = plugin.key;

      plugin = mergePlugin(plugin);

      editor.plugins.push(plugin);
      editor.pluginsByKey[plugin.key] = plugin;

      addEditorPlugins(plugin.plugins);
    });
  };

  // then
  addEditorPlugins([createInlineVoidPlugin(), ..._plugins]);

  // withOverrides
  editor.plugins.forEach((plugin) => {
    if (plugin.withOverrides) {
      editor = plugin.withOverrides(editor, plugin);
    }
  });

  return editor;
};
