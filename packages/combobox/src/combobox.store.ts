import type { Range } from 'slate';

import {
  type ZustandStateActions,
  type ZustandStoreApi,
  createZustandStore,
} from '@udecode/plate-common';

import type { ComboboxOnSelectItem, NoData, TComboboxItem } from './types';

export type ComboboxStateById<TData = NoData> = {
  /** Is opening/closing the combobox controlled by the client. */
  controlled?: boolean;

  /**
   * Items filter function by text.
   *
   * @default (value) => value.text.toLowerCase().startsWith(search.toLowerCase())
   */
  filter?: (search: string) => (item: TComboboxItem<TData>) => boolean;

  /** Combobox id. */
  id: string;

  /**
   * Max number of items.
   *
   * @default items.length
   */
  maxSuggestions?: number;

  /** Called when an item is selected. */
  onSelectItem: ComboboxOnSelectItem<TData> | null;

  /** Regular expression for search, for example to allow whitespace */
  searchPattern?: string;

  /** Sort filtered items before applying maxSuggestions. */
  sort?: (
    search: string
  ) => (a: TComboboxItem<TData>, b: TComboboxItem<TData>) => number;

  /** Trigger that activates the combobox. */
  trigger: string;
};

export type ComboboxStoreById<TData = NoData> = ZustandStoreApi<
  string,
  ComboboxStateById<TData>,
  ZustandStateActions<ComboboxStateById<TData>>
>;

export type ComboboxState<TData = NoData> = {
  /** Active id (combobox id which is opened). */
  activeId: null | string;

  /**
   * Object whose keys are combobox ids and values are config stores (e.g. one
   * for tag, one for mention,...).
   */
  byId: Record<string, ComboboxStoreById>;

  /** Filtered items */
  filteredItems: TComboboxItem<TData>[];

  /** Highlighted index. */
  highlightedIndex: number;

  /** Unfiltered items. */
  items: TComboboxItem<TData>[];

  /** Range from the trigger to the cursor. */
  targetRange: Range | null;

  /** Text after the trigger. */
  text: null | string;
};

const createComboboxStore = (state: ComboboxStateById) =>
  createZustandStore(`combobox-${state.id}`)(state);

export const comboboxStore = createZustandStore('combobox')<ComboboxState>({
  activeId: null,
  byId: {},
  filteredItems: [],
  highlightedIndex: 0,
  items: [],
  targetRange: null,
  text: null,
})
  .extendActions((set, get) => ({
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
    setComboboxById: <TData = NoData>(state: ComboboxStateById<TData>) => {
      if (get.byId()[state.id]) return;

      set.state((draft) => {
        draft.byId[state.id] = createComboboxStore(
          state as unknown as ComboboxStateById
        );
      });
    },
  }))
  .extendSelectors((state) => ({
    isOpen: () => !!state.activeId,
  }));

export const useComboboxSelectors = comboboxStore.use;

export const comboboxSelectors = comboboxStore.get;

export const comboboxActions = comboboxStore.set;

export const getComboboxStoreById = (id: null | string) =>
  id ? comboboxSelectors.byId()[id] : null;

export const useActiveComboboxStore = () => {
  const activeId = useComboboxSelectors.activeId();
  const comboboxes = useComboboxSelectors.byId();

  return activeId ? comboboxes[activeId] : null;
};
