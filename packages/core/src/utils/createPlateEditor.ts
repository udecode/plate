import { createEditor } from 'slate';
import { createHistoryPlugin } from '../plugins/createHistoryPlugin';
import { createReactPlugin } from '../plugins/createReactPlugin';
import { OverridesByKey } from '../types/OverridesByKey';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';
import { PlatePluginComponent } from '../types/plugins/PlatePlugin/PlatePluginComponent';
import { createPlugins } from './createPlugins';
import { withPlate } from './withPlate';

export interface CreatePlateEditorOptions<T = {}> {
  editor?: any;
  plugins?: PlatePlugin<T>[];
  components?: Record<string, PlatePluginComponent>;
  overrides?: OverridesByKey<T>;
  disableCorePlugins?: boolean;
}

/**
 * Create a plate editor with:
 * - createEditor or `editor` param
 * - withPlate
 * - createReactPlugin
 * - createHistoryPlugin
 * - components
 */
export const createPlateEditor = <T = {}>({
  editor = createEditor(),
  plugins: _plugins = [],
  components,
  overrides,
  disableCorePlugins,
}: CreatePlateEditorOptions<T> = {}): PlateEditor<T> => {
  let plugins: PlatePlugin<T>[] = [];

  if (!disableCorePlugins) {
    plugins = [createReactPlugin(), createHistoryPlugin()];
  }

  plugins = [...plugins, ..._plugins];

  plugins = createPlugins(plugins, {
    components,
    overrides,
  });

  return withPlate(editor, {
    plugins,
  });
};
