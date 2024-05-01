import {
  type TEditor,
  type Value,
  createTEditor,
  normalizeEditor,
} from '@udecode/slate';

import type {
  OverrideByKey,
  PlatePlugin,
  PlatePluginComponent,
} from '../../shared/types';
import type { PlateEditor } from '../../shared/types/PlateEditor';

import { createPlugins } from '../../shared/utils/createPlugins';
import { type WithPlateOptions, withPlate } from '../plugins/withPlate';

export interface CreatePlateEditorOptions<
  V extends Value = Value,
  E extends TEditor<V> = TEditor<V>,
> extends Omit<WithPlateOptions<V, E & PlateEditor<V>>, 'plugins'> {
  /** Inject components into plugins. */
  components?: Record<string, PlatePluginComponent>;

  /** Initial editor (without `withPlate`). */
  editor?: E;

  /** Normalize editor. */
  normalizeInitialValue?: boolean;

  /** Override plugins by key. */
  overrideByKey?: OverrideByKey;

  /** Editor plugins. */
  plugins?: PlatePlugin[];
}

/**
 * Create a plate editor with:
 *
 * - `createTEditor` or custom `editor`
 * - `withPlate`
 * - Custom `components`
 */
export const createPlateEditor = <
  V extends Value = Value,
  E extends TEditor<V> = TEditor<V>,
>({
  components,
  editor = createTEditor() as E,
  normalizeInitialValue: shouldNormalizeInitialValue,
  overrideByKey,
  plugins = [],
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
