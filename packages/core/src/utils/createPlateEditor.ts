import { withPlate, WithPlateOptions } from '../plugins/withPlate';
import { normalizeEditor } from '../slate/editor/normalizeEditor';
import { Value } from '../slate/types/TEditor';
import { OverrideByKey } from '../types/OverrideByKey';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/plugins/PlatePlugin';
import { PlatePluginComponent } from '../types/plugins/PlatePluginComponent';
import { createPlugins } from './createPlugins';
import { createTEditor } from './createTEditor';

export interface CreatePlateEditorOptions<V extends Value, T = {}>
  extends Omit<WithPlateOptions<V, T>, 'plugins'> {
  editor?: any;
  plugins?: PlatePlugin<V, T>[];
  components?: Record<string, PlatePluginComponent>;
  overrideByKey?: OverrideByKey<V, T>;
  normalizeInitialValue?: boolean;
}

/**
 * Create a plate editor with:
 * - `createEditor` or custom `editor`
 * - `withPlate`
 * - custom `components`
 */
export const createPlateEditor = <V extends Value, T = {}>({
  editor = createTEditor(),
  plugins = [],
  components,
  overrideByKey,
  normalizeInitialValue,
  ...withPlateOptions
}: CreatePlateEditorOptions<V, T> = {}): PlateEditor<V, T> => {
  plugins = createPlugins(plugins, {
    components,
    overrideByKey,
  });

  editor = withPlate(editor, {
    plugins,
    ...withPlateOptions,
  });

  if (normalizeInitialValue) {
    normalizeEditor(editor, { force: true });
  }

  return editor;
};
