import { createEditor } from 'slate';
import { withPlate, WithPlateOptions } from '../plugins/withPlate';
import { OverridesByKey } from '../types/OverridesByKey';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/plugins/PlatePlugin';
import { PlatePluginComponent } from '../types/plugins/PlatePluginComponent';
import { createPlugins } from './createPlugins';

export interface CreatePlateEditorOptions<T = {}>
  extends Omit<WithPlateOptions, 'plugins'> {
  editor?: any;
  plugins?: PlatePlugin<T>[];
  components?: Record<string, PlatePluginComponent>;
  overrides?: OverridesByKey<T>;
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
  plugins = [],
  components,
  overrides,
  ...withPlateOptions
}: CreatePlateEditorOptions<T> = {}): PlateEditor<T> => {
  plugins = createPlugins(plugins, {
    components,
    overrides,
  });

  return withPlate(editor, {
    plugins,
    ...withPlateOptions,
  });
};
