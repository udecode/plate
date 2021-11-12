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

  const addEditorPlugins = (plugins?: PlatePlugin[]) => {
    if (!plugins) return;

    plugins.forEach((plugin) => {
      if (plugin.type === undefined) plugin.type = plugin.key;

      const newPlugin = defaultsDeep(
        plugin,
        plugin.withEditor?.(editor, plugin)
      );

      editor.plugins.push(newPlugin);
      editor.pluginsByKey[plugin.key] = newPlugin;

      addEditorPlugins(plugin.plugins);
    });
  };

  // withEditor
  addEditorPlugins([createInlineVoidPlugin(), ..._plugins]);

  // withOverrides
  editor.plugins.forEach((plugin) => {
    if (plugin.withOverrides) {
      editor = plugin.withOverrides(editor, plugin);
    }
  });

  return editor;
};
