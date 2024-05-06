import React from 'react';

import type { ComboboxProps } from '../types/ComboboxProps';

import {
  type ComboboxControls,
  type Data,
  type NoData,
  comboboxActions,
  useActiveComboboxStore,
  useComboboxSelectors,
} from '..';

export type ComboboxContentProps<TData extends Data = NoData> = {
  combobox: ComboboxControls;
} & Omit<
  ComboboxProps<TData>,
  | 'controlled'
  | 'filter'
  | 'id'
  | 'maxSuggestions'
  | 'onSelectItem'
  | 'searchPattern'
  | 'sort'
  | 'trigger'
>;

export type ComboboxContentRootProps<TData extends Data = NoData> = {
  combobox: ComboboxControls;
} & ComboboxContentProps<TData>;

export const useComboboxContentState = <TData extends Data = NoData>({
  combobox,
  items,
}: ComboboxContentRootProps<TData>) => {
  const targetRange = useComboboxSelectors.targetRange();
  const activeComboboxStore = useActiveComboboxStore()!;
  const text = useComboboxSelectors.text() ?? '';
  const storeItems = useComboboxSelectors.items();
  const filter = activeComboboxStore.use.filter?.();
  const sort = activeComboboxStore.use.sort?.();
  const maxSuggestions =
    activeComboboxStore.use.maxSuggestions?.() ?? storeItems.length;

  // Update items
  React.useEffect(() => {
    items && comboboxActions.items(items);
  }, [items]);

  // Filter items
  React.useEffect(() => {
    comboboxActions.filteredItems(
      storeItems
        .filter(
          filter
            ? filter(text)
            : (value) => value.text.toLowerCase().startsWith(text.toLowerCase())
        )
        .sort(sort?.(text))
        .slice(0, maxSuggestions)
    );
  }, [filter, sort, storeItems, maxSuggestions, text]);

  return {
    combobox,
    targetRange,
  };
};

export const useComboboxContent = (
  state: ReturnType<typeof useComboboxContentState>
) => {
  const menuProps = state.combobox
    ? state.combobox.getMenuProps({}, { suppressRefError: true })
    : { ref: null };

  return {
    menuProps,
    targetRange: state.targetRange,
  };
};
