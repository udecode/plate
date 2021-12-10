import { StateActions, StoreApi } from '@udecode/zustood';
import { createPlateStore } from '../stores/plate/createPlateStore';
import { platesStore } from '../stores/plate/platesStore';
import { TDescendant } from './slate/TDescendant';
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
  id: string;

  /**
   * Slate editor reference.
   * @default pipe(createEditor(), withPlate({ id, plugins, options, components }))
   */
  editor: PlateEditor<T> | null;

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
   * If true, plate will create the editor with `withPlate`.
   * If false, plate will remove the editor from the store.
   * @default true
   */
  enabled: boolean;

  /**
   * Editor value.
   * @default [{ children: [{ text: '' }]}]
   */
  value: TDescendant[] | null;
};

export type PlateStoreApi = ReturnType<typeof createPlateStore>;
export type PlatesStoreApi = typeof platesStore;

export type PlatesStoreState = Record<string, PlateStoreApi>;
