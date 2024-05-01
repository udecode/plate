import {
  createZustandStore,
  ZustandStateActions,
  ZustandStoreApi,
} from '@udecode/plate-common';
import { Range } from 'slate';

import { ComboboxOnSelectItem, NoData, TComboboxItem } from './types';

export type ComboboxStateById<TData = NoData> = {
  /**
   * Combobox id.
   */
  id: string;

  /**
   * Items filter function by text.
   * @default (value) => value.text.toLowerCase().startsWith(search.toLowerCase())
   */
  filter?: (search: string) => (item: TComboboxItem<TData>) => boolean;

  /**
   * Sort filtered items before applying maxSuggestions.
   */
  sort?: (
    search: string
  ) => (a: TComboboxItem<TData>, b: TComboboxItem<TData>) => number;

  /**
   * Max number of items.
   * @default items.length
   */
  maxSuggestions?: number;

  /**
   * Trigger that activates the combobox.
   */
  trigger: string;

  /**
   * Regular expression for search, for example to allow whitespace
   */
  searchPattern?: string;

  /**
   * Called when an item is selected.
   */
  onSelectItem: ComboboxOnSelectItem<TData> | null;

  /**
   * Is opening/closing the combobox controlled by the client.
   */
  controlled?: boolean;
};

export type ComboboxStoreById<TData = NoData> = ZustandStoreApi<
  string,
  ComboboxStateById<TData>,
  ZustandStateActions<ComboboxStateById<TData>>
>;

export type ComboboxState<TData = NoData> = {
  /**
   * Active id (combobox id which is opened).
   */
  activeId: string | null;

  /**
   * Object whose keys are combobox ids and values are config stores
   * (e.g. one for tag, one for mention,...).
   */
  byId: Record<string, ComboboxStoreById>;

  /**
   * Unfiltered items.
   */
  items: TComboboxItem<TData>[];

  /**
   * Filtered items
   */
  filteredItems: TComboboxItem<TData>[];

  /**
   * Highlighted index.
   */
  highlightedIndex: number;

  /**
   * Range from the trigger to the cursor.
   */
  targetRange: Range | null;

  /**
   * Text after the trigger.
   */
  text: string | null;
};

const createComboboxStore = (state: ComboboxStateById) =>
  createZustandStore(`combobox-${state.id}`)(state);

export const comboboxStore = createZustandStore('combobox')<ComboboxState>({
  activeId: null,
  byId: {},
  highlightedIndex: 0,
  items: [],
  filteredItems: [],
  targetRange: null,
  text: null,
})
  .extendActions((set, get) => ({
    setComboboxById: <TData = NoData>(state: ComboboxStateById<TData>) => {
      if (get.byId()[state.id]) return;

      set.state((draft) => {
        draft.byId[state.id] = createComboboxStore(
          state as unknown as ComboboxStateById
        );
      });
    },
    open: (state: Pick<ComboboxState, 'activeId' | 'targetRange' | 'text'>) => {
      set.mergeState(state);
    },
    reset: () => {
      set.state((draft) => {
        draft.activeId = null;
        draft.highlightedIndex = 0;
        draft.filteredItems = [];
        draft.items = [];
        draft.text = null;
        draft.targetRange = null;
      });
    },
  }))
  .extendSelectors((state) => ({
    isOpen: () => !!state.activeId,
  }));

export const useComboboxSelectors = comboboxStore.use;
export const comboboxSelectors = comboboxStore.get;
export const comboboxActions = comboboxStore.set;

export const getComboboxStoreById = (id: string | null) =>
  id ? comboboxSelectors.byId()[id] : null;

export const useActiveComboboxStore = () => {
  const activeId = useComboboxSelectors.activeId();
  const comboboxes = useComboboxSelectors.byId();

  return activeId ? comboboxes[activeId] : null;
};
