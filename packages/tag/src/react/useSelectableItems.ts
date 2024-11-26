import { useMemo } from 'react';

import { useEditorString } from '@udecode/plate-common/react';

import { useSelectedItems } from './useSelectedItems';

type Filter = (value: string, search: string) => boolean;
type NewItemFilter = (search: string) => boolean;

const defaultFilter: Filter = (value, search) =>
  value.toLowerCase().includes(search.toLowerCase());

const defaultNewItemFilter: NewItemFilter = (search: string) => {
  const trimmed = search.trim();

  return trimmed.length >= 2;
};

export const useSelectableItems = <
  T extends { value: string; isNew?: boolean },
>({
  allowNew = true,
  filter = defaultFilter,
  items = [],
  newItemFilter = defaultNewItemFilter,
  newItemPosition = 'end',
}: {
  allowNew?: boolean;
  filter?: Filter;
  items?: T[];
  newItemFilter?: NewItemFilter;
  newItemPosition?: 'end' | 'start';
}) => {
  const selectedItems = useSelectedItems();
  const search = useEditorString();

  return useMemo(() => {
    const uniqueItems = Array.from(new Set(items));
    const trimmedSearch = search?.trim().replace(/\s+/g, ' ') || '';

    const searchItem =
      allowNew &&
      trimmedSearch &&
      newItemFilter(trimmedSearch) &&
      !uniqueItems.some(
        (item) => item.value.toLowerCase() === trimmedSearch.toLowerCase()
      )
        ? [{ isNew: true, value: trimmedSearch } as T]
        : [];

    const orderedItems =
      newItemPosition === 'start'
        ? [...searchItem, ...uniqueItems]
        : [...uniqueItems, ...searchItem];

    const availableItems = orderedItems.filter(
      (item) =>
        !selectedItems.some(
          (s) => s.value.toLowerCase() === item.value.toLowerCase()
        )
    );

    if (!trimmedSearch) return availableItems;

    return availableItems.filter((item) => filter(item.value, trimmedSearch));
  }, [
    items,
    selectedItems,
    search,
    filter,
    allowNew,
    newItemPosition,
    newItemFilter,
  ]);
};
