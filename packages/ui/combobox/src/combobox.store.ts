import { UsePopperOptions } from '@udecode/plate-popper';
import { createStore, StateActions, StoreApi } from '@udecode/zustood';
import { UseComboboxReturnValue } from 'downshift';
import { Range } from 'slate';
import { ComboboxItemData } from './components/Combobox.types';
import { ComboboxOnSelectItem } from './types/ComboboxOnSelectItem';

export type ComboboxStateById = {
  /**
   * Combobox id
   */
  id: string;

  maxSuggestions?: number;

  /**
   * Trigger that activates the combobox
   */
  trigger: string;

  /**
   * Items filtering function from search
   */
  filter?: (search: string) => (item: ComboboxItemData) => boolean;

  /**
   * Called when an item is selected
   */
  onSelectItem: ComboboxOnSelectItem | null;
};

export type ComboboxStoreById = StoreApi<
  string,
  ComboboxStateById,
  StateActions<ComboboxStateById>
>;

export type ComboboxState = {
  /**
   * Active id (open).
   */
  activeId: string | null;

  /**
   * Object whose keys are ids and values are config stores
   * (e.g. one for tag, one for mention,...).
   */
  byId: Record<string, ComboboxStoreById>;

  /**
   * Unfiltered items.
   */
  items: ComboboxItemData[];

  /**
   * Filtered items
   */
  filteredItems: ComboboxItemData[];

  /**
   * Highlighted index.
   */
  itemIndex: number;

  /**
   * Parent element of the popper element (the one that has the scroll).
   * @default document
   */
  popperContainer: Document | HTMLElement | null;

  /**
   * Overrides `usePopper` options.
   */
  popperOptions: UsePopperOptions | null;

  /**
   * Search text after the trigger.
   */
  search: string | null;

  // Range from the trigger to the cursor
  targetRange: Range | null;
};

const createComboboxStore = (state: ComboboxStateById) =>
  createStore(`combobox-${state.id}`)(state);

export const comboboxStore = createStore('combobox')<ComboboxState>({
  activeId: null,
  byId: {},
  itemIndex: 0,
  items: [],
  filteredItems: [],
  popperContainer: null,
  popperOptions: null,
  search: null,
  targetRange: null,
})
  .extendActions((set, get) => ({
    setComboboxById: (state: ComboboxStateById) => {
      if (get.byId()[state.id]) return;

      set.state((draft) => {
        draft.byId[state.id] = createComboboxStore(state);
      });
    },
    open: (
      state: Pick<ComboboxState, 'activeId' | 'targetRange' | 'search'>
    ) => {
      set.mergeState(state);
    },
    reset: () => {
      set.state((draft) => {
        draft.activeId = null;
        draft.itemIndex = 0;
        draft.items = [];
        draft.search = null;
        draft.targetRange = null;
      });
    },
  }))
  .extendSelectors((state) => ({
    isOpen: () => !!state.activeId,
  }));

export const getComboboxStoreById = (id: string | null) =>
  id ? comboboxStore.get.byId()[id] : null;

export const useActiveComboboxStore = () => {
  const activeId = comboboxStore.use.activeId();
  const comboboxes = comboboxStore.use.byId();

  return activeId ? comboboxes[activeId] : null;
};
