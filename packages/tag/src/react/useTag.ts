import React, { useMemo } from 'react';

import { useEditor, useEditorSelector } from '@platejs/core/react';
import { TextApi } from '@platejs/plite';
import type { TagItem } from '../lib/BaseTagPlugin';
import { useEditorString } from '@platejs/utils/react';

import { BaseTagPlugin } from '../lib';

export type NewTagItem = {
  isNew: true;
  value: string;
};

export const useSelectedItems = () =>
  useEditorSelector(
    (editor) => editor.plugin(BaseTagPlugin).read.getSelectedItems(),
    {
      equalityFn: (previous, next) =>
        !!previous &&
        previous.length === next.length &&
        previous.every((item, index) => item.value === next[index]?.value),
    }
  );

export const useSelectableItems = <
  T extends { value: string; isNew?: boolean },
>({
  allowNew = true,
  filter = (value, search) =>
    value.toLowerCase().includes(search.toLowerCase()),
  items = [],
  newItemFilter = (search) => search.trim().length >= 2,
  newItemPosition = 'end',
}: {
  allowNew?: boolean;
  filter?: (value: string, search: string) => boolean;
  items?: T[];
  newItemFilter?: (search: string) => boolean;
  newItemPosition?: 'end' | 'start';
}) => {
  const selectedItems = useSelectedItems();
  const search = useEditorString();

  return useMemo(() => {
    const uniqueItems = Array.from(new Set(items));
    const trimmedSearch = search?.trim().replaceAll(/\s+/g, ' ') || '';
    const searchItem: NewTagItem[] =
      allowNew &&
      trimmedSearch &&
      newItemFilter(trimmedSearch) &&
      !uniqueItems.some(
        (item) => item.value.toLowerCase() === trimmedSearch.toLowerCase()
      )
        ? [{ isNew: true, value: trimmedSearch }]
        : [];
    const orderedItems: (NewTagItem | T)[] =
      newItemPosition === 'start'
        ? [...searchItem, ...uniqueItems]
        : [...uniqueItems, ...searchItem];
    const availableItems = orderedItems.filter(
      (item) =>
        !selectedItems.some(
          (selected) =>
            selected.value.toLowerCase() === item.value.toLowerCase()
        )
    );

    return trimmedSearch
      ? availableItems.filter((item) => filter(item.value, trimmedSearch))
      : availableItems;
  }, [
    allowNew,
    filter,
    items,
    newItemFilter,
    newItemPosition,
    search,
    selectedItems,
  ]);
};

/**
 * Selects the first result while searching, clears search text when closing,
 * and reports the selected tags.
 */
export const useSelectEditorCombobox = ({
  open,
  selectFirstItem,
  onValueChange,
}: {
  open: boolean;
  selectFirstItem: () => void;
  onValueChange?: (items: TagItem[]) => void;
}) => {
  const editor = useEditor();
  const search = useEditorString();
  const selectedItems = useSelectedItems();

  React.useEffect(() => {
    if (!open) {
      editor.update((tx) => {
        tx.nodes.remove({
          at: [],
          match: (node) => TextApi.isText(node) && node.text.length > 0,
        });

        const end = tx.points.end([]);

        if (end) tx.selection.set(end);
      });
    }
  }, [editor, open]);

  React.useEffect(() => {
    if (search !== undefined) selectFirstItem();
  }, [search, selectFirstItem]);

  React.useEffect(() => {
    onValueChange?.(selectedItems);
  }, [onValueChange, selectedItems]);
};
