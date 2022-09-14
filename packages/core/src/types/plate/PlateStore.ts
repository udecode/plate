import { Value } from '../../slate/editor/TEditor';
import { TEditableProps } from '../../slate/types/TEditableProps';
import { PlateId } from '../../stores/index';
import { Nullable } from '../misc/Nullable';
import { PlatePlugin, PluginOptions } from '../plugin/PlatePlugin';
import { PlateEditor } from './PlateEditor';

export type PlateChangeKey =
  | 'keyEditor'
  | 'keyPlugins'
  | 'keySelection'
  | 'keyDecorate';

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

  plugins: PlatePlugin<PluginOptions, V, E>[];

  /**
   * Value of the editor.
   * @default [{ type: 'p', children: [{ text: '' }]}]
   */
  value: V;
} & Required<
  Nullable<Pick<TEditableProps<V>, 'decorate' | 'renderElement' | 'renderLeaf'>>
> &
  Nullable<{
    /**
     * Whether `Editable` is rendered so slate DOM is resolvable.
     */
    isRendered: boolean;

    /**
     * A random key updated on each editor change.
     */
    keyEditor: string;

    /**
     * A random key updated on each editor.plugins change.
     */
    keyPlugins: string;

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
    onChange: (value: V) => void;
  }>;
