import { withPlate, WithPlateOptions } from '../plugins/withPlate';
import { normalizeEditor } from '../slate/editor/normalizeEditor';
import { TEditor, Value } from '../slate/editor/TEditor';
import { OverrideByKey } from '../types/OverrideByKey';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin, PluginOptions } from '../types/plugins/PlatePlugin';
import { PlatePluginComponent } from '../types/plugins/PlatePluginComponent';
import { createPlugins } from './createPlugins';
import { createTEditor } from './createTEditor';

export interface CreatePlateEditorOptions<
  V extends Value,
  E extends TEditor<V> = TEditor<V>
> extends Omit<WithPlateOptions<V, E & PlateEditor<V>>, 'plugins'> {
  editor?: E;
  plugins?: PlatePlugin<PluginOptions, V>[];
  components?: Record<string, PlatePluginComponent>;
  overrideByKey?: OverrideByKey<V>;
  normalizeInitialValue?: boolean;
}

/**
 * Create a plate editor with:
 * - `createTEditor` or custom `editor`
 * - `withPlate`
 * - custom `components`
 */
export const createPlateEditor = <
  V extends Value = Value,
  E extends TEditor<V> = TEditor<V>
>({
  editor = createTEditor() as E,
  plugins = [],
  components,
  overrideByKey,
  normalizeInitialValue,
  ...withPlateOptions
}: CreatePlateEditorOptions<V, E> = {}): E & PlateEditor<V> => {
  plugins = createPlugins<V>(plugins, {
    components,
    overrideByKey,
  });

  const e = withPlate<V>(editor, {
    plugins,
    ...withPlateOptions,
  }) as E & PlateEditor<V>;

  if (normalizeInitialValue) {
    normalizeEditor(e, { force: true });
  }

  return e;
};
