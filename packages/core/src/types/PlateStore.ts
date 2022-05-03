import { Nullable } from '../common/types/utility/Nullable';
import { TEditableProps } from '../slate/types/TEditableProps';
import { Value } from '../slate/types/TEditor';
import { createPlateStore } from '../stores/plate/createPlateStore';
import { PlatePlugin } from './plugins/PlatePlugin';
import { PlateEditor } from './PlateEditor';

/**
 * A unique id used to store the editor state by id.
 * Required if rendering multiple `Plate`.
 * Optional otherwise.
 * @default 'main'
 */
export type EditorId = string | null | undefined;

export type PlateChangeKey = 'keyEditor' | 'keyPlugins' | 'keySelection';

export type PlateStoreState<V extends Value, T = {}> = {
  /**
   * A unique id used to store the editor state by id.
   * Required if rendering multiple `Plate`. Optional otherwise.
   * Default is `'main'`.
   */
  id: string;

  plugins: PlatePlugin<V, T>[];
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
    editor: PlateEditor<V, T>;

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

class Helper<V extends Value, T = {}> {
  Return = createPlateStore<V, T>();
}

export type PlateStoreApi<V extends Value, T = {}> = Helper<V, T>['Return'];

export type PlatesStoreState<V extends Value> = Record<
  string,
  PlateStoreApi<V>
>;
