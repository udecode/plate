import { createEditor } from 'slate';
import { withPlate, WithPlateOptions } from '../plugins/withPlate';
import { OverrideByKey } from '../types/OverrideByKey';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/plugins/PlatePlugin';
import { PlatePluginComponent } from '../types/plugins/PlatePluginComponent';
import { createPlugins } from './createPlugins';

export interface CreatePlateEditorOptions<T = {}>
  extends Omit<WithPlateOptions, 'plugins'> {
  editor?: any;
  plugins?: PlatePlugin<T>[];
  components?: Record<string, PlatePluginComponent>;
  overrideByKey?: OverrideByKey<T>;
}

/**
 * Create a plate editor with:
 * - `createEditor` or custom `editor`
 * - `withPlate`
 * - custom `components`
 */
export const createPlateEditor = <T = {}>({
  editor = createEditor(),
  plugins = [],
  components,
  overrideByKey,
  ...withPlateOptions
}: CreatePlateEditorOptions<T> = {}): PlateEditor<T> => {
  plugins = createPlugins(plugins, {
    components,
    overrideByKey,
  });

  return withPlate(editor, {
    plugins,
    ...withPlateOptions,
  });
};
