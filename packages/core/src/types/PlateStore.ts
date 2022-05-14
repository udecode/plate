import { Nullable } from '../common/types/utility/Nullable';
import { Value } from '../slate/editor/TEditor';
import { TEditableProps } from '../slate/types/TEditableProps';
import { createPlateStore } from '../stores/plate/createPlateStore';
import { PlatePlugin, PluginOptions } from './plugins/PlatePlugin';
import { PlateEditor } from './PlateEditor';

/**
 * A unique id used to store the editor state by id.
 * Required if rendering multiple `Plate`.
 * Optional otherwise.
 * @default 'main'
 */
export type EditorId = string | null | undefined;

export type PlateChangeKey = 'keyEditor' | 'keyPlugins' | 'keySelection';

export type PlateStoreState<
  V extends Value,
  E extends PlateEditor<V> = PlateEditor<V>
> = {
  /**
   * A unique id used to store the editor state by id.
   * Required if rendering multiple `Plate`. Optional otherwise.
   * Default is `'main'`.
   */
  id: string;

  plugins: PlatePlugin<PluginOptions, V, E>[];
} & Required<
  Nullable<Pick<TEditableProps<V>, 'decorate' | 'renderElement' | 'renderLeaf'>>
> &
  Nullable<{
    /**
     * The props for the `Editable` component.
     */
    editableProps: TEditableProps<V>;

    /**
     * Slate editor reference.
     * @default pipe(createTEditor(), withPlate({ id, plugins, options, components }))
     */
    editor: E;

    /**
     * If true, plate will create the editor with `withPlate`.
     * If false, plate will remove the editor from the store.
     * @default true
     */
    enabled: boolean;

    /**
     * A key that is incremented on each editor change.
     */
    keyEditor: number;

    /**
     * A key that is incremented on each editor.plugins change.
     */
    keyPlugins: number;

    /**
     * A key that is incremented on each editor.selection change.
     */
    keySelection: number;

    /**
     * Controlled callback called when the editor state changes.
     */
    onChange: (value: V) => void;

    /**
     * Value of the editor.
     * @default [{ type: 'p', children: [{ text: '' }]}]
     */
    value: V;
  }>;

class Helper<V extends Value, E extends PlateEditor<V> = PlateEditor<V>> {
  Return = createPlateStore<V, E>();
}

export type PlateStoreApi<
  V extends Value,
  E extends PlateEditor<V> = PlateEditor<V>
> = Helper<V, E>['Return'];

export type PlatesStoreState<V extends Value> = Record<
  string,
  PlateStoreApi<V>
>;
