import { createTEditor, normalizeEditor, TEditor, Value } from '@udecode/slate';

import {
  OverrideByKey,
  PlatePlugin,
  PlatePluginComponent,
} from '../../shared/types';
import { PlateEditor } from '../../shared/types/PlateEditor';
import { createPlugins } from '../../shared/utils/createPlugins';
import { withPlate, WithPlateOptions } from '../plugins/withPlate';

export interface CreatePlateEditorOptions<
  V extends Value = Value,
  E extends TEditor<V> = TEditor<V>,
> extends Omit<WithPlateOptions<V, E & PlateEditor<V>>, 'plugins'> {
  /**
   * Initial editor (without `withPlate`).
   */
  editor?: E;

  /**
   * Editor plugins.
   */
  plugins?: PlatePlugin[];

  /**
   * Inject components into plugins.
   */
  components?: Record<string, PlatePluginComponent>;

  /**
   * Override plugins by key.
   */
  overrideByKey?: OverrideByKey;

  /**
   * Normalize editor.
   */
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
  E extends TEditor<V> = TEditor<V>,
>({
  editor = createTEditor() as E,
  plugins = [],
  components,
  overrideByKey,
  normalizeInitialValue: shouldNormalizeInitialValue,
  ...withPlateOptions
}: CreatePlateEditorOptions<V, E> = {}): E & PlateEditor<V> => {
  plugins = createPlugins(plugins, {
    components,
    overrideByKey,
  });

  const e = withPlate<V>(editor, {
    plugins,
    ...withPlateOptions,
  }) as E & PlateEditor<V>;

  if (shouldNormalizeInitialValue) {
    normalizeEditor(e, { force: true });
  }

  return e;
};
