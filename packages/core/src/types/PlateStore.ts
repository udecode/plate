import { EditableProps } from 'slate-react/dist/components/editable';
import { createPlateStore } from '../stores/plate/createPlateStore';
import { platesStore } from '../stores/plate/platesStore';
import { PlatePlugin } from './plugins/PlatePlugin';
import { TDescendant } from './slate/TDescendant';
import { TNode } from './slate/TNode';
import { Nullable } from './utility/Nullable';
import { PlateEditor } from './PlateEditor';

/**
 * A unique id used to store the editor state by id.
 * Required if rendering multiple `Plate`.
 * Optional otherwise.
 * @default 'main'
 */
export type EditorId = string | null | undefined;

export type PlateChangeKey = 'keyEditor' | 'keyPlugins' | 'keySelection';

export type PlateStoreState<T = {}> = {
  /**
   * A unique id used to store the editor state by id.
   * Required if rendering multiple `Plate`. Optional otherwise.
   * Default is `'main'`.
   */
  id: string;

  plugins: PlatePlugin<T>[];
} & Required<
  Nullable<Pick<EditableProps, 'decorate' | 'renderElement' | 'renderLeaf'>>
> &
  Nullable<{
    /**
     * The props for the `Editable` component.
     */
    editableProps: EditableProps;

    /**
     * Slate editor reference.
     * @default pipe(createEditor(), withPlate({ id, plugins, options, components }))
     */
    editor: PlateEditor<T>;

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
    onChange: (value: TNode[]) => void;

    /**
     * Value of the editor.
     * @default [{ type: 'p', children: [{ text: '' }]}]
     */
    value: TDescendant[];
  }>;

export type PlateStoreApi = ReturnType<typeof createPlateStore>;
export type PlatesStoreApi = typeof platesStore;

export type PlatesStoreState = Record<string, PlateStoreApi>;
