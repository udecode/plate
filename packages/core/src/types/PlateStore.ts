import { Editor } from 'slate';
import { PlatePlugin } from './PlatePlugin/PlatePlugin';
import { PlateEditor } from './PlateEditor';
import { TDescendant } from './TDescendant';

/**
 * A unique id used to store the editor state by id.
 * Required if rendering multiple `Plate`.
 * Optional otherwise.
 * @default 'main'
 */
export type EditorId = string | null | undefined;

export type PlateState<T = {}> = {
  /**
   * Slate editor reference.
   * @default pipe(createEditor(), withPlate({ id, plugins, options, components }))
   */
  editor?: PlateEditor<T>;

  /**
   * A key that is incremented on each editor change.
   */
  keyChange?: number;

  /**
   * If true, plate will create the editor with `withPlate`.
   * If false, plate will remove the editor from the store.
   * @default true
   */
  enabled?: boolean;

  /**
   * Plate plugins.
   * @default [createReactPlugin(), createHistoryPlugin()]
   */
  plugins: PlatePlugin<T>[];

  /**
   * Element keys used by the plugins
   */
  pluginKeys: string[];

  selection: Editor['selection'];

  /**
   * Editor value.
   * @default [{ children: [{ text: '' }]}]
   */
  value: TDescendant[];
};

/**
 * @see {@link EditorId}
 */
export type PlateStates<T = {}> = Record<string, PlateState<T>>;

export type PlateActions<T = {}> = {
  /**
   * Remove state by id. Called by `Plate` on unmount.
   */
  clearState: (id?: string) => void;

  /**
   * Set initial state by id. Called by `Plate` on mount.
   */
  setInitialState: (value?: Partial<PlateState<T>>, id?: string) => void;

  /**
   * Set a new editor with plate.
   */
  resetEditor: (id?: string) => void;

  setEditor: (value: PlateState<T>['editor'], id?: string) => void;
  setSelection: (value: PlateState<T>['selection'], id?: string) => void;
  incrementKeyChange: (id?: string) => void;
  setEnabled: (value: PlateState<T>['enabled'], id?: string) => void;
  setPlugins: (value: PlateState<T>['plugins'], id?: string) => void;
  setPluginKeys: (value: PlateState<T>['pluginKeys'], id?: string) => void;
  setValue: (value: PlateState<T>['value'], id?: string) => void;
};
