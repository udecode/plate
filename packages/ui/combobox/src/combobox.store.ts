import { createStore, StateActions, StoreApi } from '@udecode/zustood';
import { UseComboboxReturnValue } from 'downshift';
import { Range } from 'slate';
import { IComboboxItem } from './components/Combobox.types';
import { UsePopperOptions } from './popper/usePopperPosition';
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
   * Called when an item is selected
   */
  onSelectItem: ComboboxOnSelectItem | null;
};

export type ComboboxState = {
  // Combobox key
  activeId: string | null;

  byId: Record<
    string,
    StoreApi<string, ComboboxStateById, StateActions<ComboboxStateById>>
  >;

  combobox: UseComboboxReturnValue<IComboboxItem> | null;

  // Fetched tags
  items: IComboboxItem[];

  // Highlighted index
  itemIndex: number;

  /**
   * Parent element of the popper element (the one that has the scroll).
   * @default document
   */
  popperContainer: Document | HTMLElement | null;

  /**
   * Overrides `usePopper` options
   */
  popperOptions: UsePopperOptions | null;

  // Search value
  search: string | null;

  // Range from the trigger to the cursor
  targetRange: Range | null;
};

const createComboboxStore = (state: ComboboxStateById) =>
  createStore(`combobox-${state.id}`)(state);

export const comboboxStore = createStore('combobox')<ComboboxState>({
  activeId: null,
  byId: {},
  combobox: null,
  itemIndex: 0,
  items: [],
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
