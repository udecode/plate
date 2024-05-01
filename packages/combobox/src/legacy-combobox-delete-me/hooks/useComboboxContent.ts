import React from 'react';

import {
  comboboxActions,
  ComboboxControls,
  Data,
  NoData,
  useActiveComboboxStore,
  useComboboxSelectors,
} from '..';
import { ComboboxProps } from '../types/ComboboxProps';

export type ComboboxContentProps<TData extends Data = NoData> = Omit<
  ComboboxProps<TData>,
  | 'id'
  | 'trigger'
  | 'searchPattern'
  | 'onSelectItem'
  | 'controlled'
  | 'maxSuggestions'
  | 'filter'
  | 'sort'
> & { combobox: ComboboxControls };

export type ComboboxContentRootProps<TData extends Data = NoData> =
  ComboboxContentProps<TData> & { combobox: ComboboxControls };

export const useComboboxContentState = <TData extends Data = NoData>({
  items,
  combobox,
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
