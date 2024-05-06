import { useEditorRef } from '@udecode/plate-common';

import type { ComboboxContentProps } from './useComboboxContent';

import {
  type ComboboxControls,
  type Data,
  type NoData,
  type TComboboxItem,
  comboboxSelectors,
  getComboboxStoreById,
  useComboboxSelectors,
} from '..';

export type ComboboxContentItemProps<TData extends Data = NoData> = {
  combobox: ComboboxControls;
  index: number;
  item: TComboboxItem<TData>;
} & Pick<ComboboxContentProps<TData>, 'onRenderItem'>;

export interface ComboboxItemProps<TData extends Data = NoData> {
  item: TComboboxItem<TData>;
  search: string;
}

export const useComboboxItem = <TData extends Data = NoData>({
  combobox,
  index,
  item,
  onRenderItem,
}: ComboboxContentItemProps<TData>) => {
  const editor = useEditorRef();
  const text = useComboboxSelectors.text() ?? '';
  const highlightedIndex = useComboboxSelectors.highlightedIndex();

  const Item = onRenderItem
    ? onRenderItem({ item: item as TComboboxItem<TData>, search: text })
    : item.text;

  const highlighted = index === highlightedIndex;

  return {
    props: {
      'data-highlighted': highlighted,
      ...combobox.getItemProps({
        index,
        item,
      }),
      children: Item,
      onMouseDown: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();

        const onSelectItem = getComboboxStoreById(
          comboboxSelectors.activeId()
        )?.get.onSelectItem();
        onSelectItem?.(editor, item);
      },
    },
  };
};
