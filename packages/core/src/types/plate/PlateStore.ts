import { Value } from '../../slate/editor/TEditor';
import { TEditableProps } from '../../slate/index';
import { PlateId } from '../../stores/index';
import { Nullable } from '../misc/Nullable';
import {
  PlatePlugin,
  PluginOptions,
  WithPlatePlugin,
} from '../plugin/PlatePlugin';
import { PlateEditor } from './PlateEditor';

export type PlateChangeKey = 'keyEditor' | 'keySelection' | 'keyDecorate';

export type PlateStoreState<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> = {
  /**
   * A unique id used as a provider scope.
   * Use it if you have multiple `PlateProvider` in the same React tree.
   * @default PLATE_SCOPE
   */
  id: PlateId;

  /**
   * Slate editor reference.
   * @default pipe(createTEditor(), withPlate({ id, plugins, options, components }))
   */
  editor: E;

  /**
   * Plugins prop passed to `Plate`.
   */
  rawPlugins: PlatePlugin<PluginOptions, V, E>[];

  // Whether the editor is read-only.
  readOnly: boolean;

  /**
   * Flattened plugins.
   */
  plugins: WithPlatePlugin<PluginOptions, V, E>[];

  /**
   * Value of the editor.
   * @default [{ type: 'p', children: [{ text: '' }]}]
   */
  value: V;
} & Nullable<{
  /**
   * Whether `Editable` is rendered so slate DOM is resolvable.
   */
  isRendered: boolean;

  /**
   * A random key updated on each editor change.
   */
  keyEditor: string;

  /**
   * A random key updated on each editor.selection change.
   */
  keySelection: string;

  /**
   * A random key updated when calling `redecorate`.
   * This is a dependency of the `decorate` function.
   */
  keyDecorate: string;

  /**
   * Controlled callback called when the editor state changes.
   */
  onChange: { fn: (value: V) => void };

  decorate: { fn: NonNullable<TEditableProps<V>['decorate']> };
  renderElement: { fn: NonNullable<TEditableProps<V>['renderElement']> };
  renderLeaf: { fn: NonNullable<TEditableProps<V>['renderLeaf']> };
}>;
