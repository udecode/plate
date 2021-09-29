import { createStore, StateActions, StoreApi } from '@udecode/zustood';
import { UseComboboxReturnValue } from 'downshift';
import { Range } from 'slate';
import { IComboboxItem } from './components/Combobox.types';
import { ComboboxOnSelectItem } from './types/ComboboxPlatePlugin';

export type ComboboxStateById = {
  // Combobox id
  id: string;

  trigger: string;

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

  // Maximum number of suggestions
  maxSuggestions: number;

  // Tag search value
  search: string | null;

  // Range from the tag trigger to the cursor
  targetRange: Range | null;
};

const createComboboxStore = (state: ComboboxStateById) =>
  createStore(`combobox-${state.id}`)(state);

export const comboboxStore = createStore('combobox')<ComboboxState>({
  combobox: null,
  itemIndex: 0,
  items: [],
  activeId: null,
  maxSuggestions: 12,
  search: null,
  targetRange: null,
  byId: {},
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
