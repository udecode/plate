import { useEditorRef } from '@udecode/plate-common';

import {
  ComboboxControls,
  comboboxSelectors,
  Data,
  getComboboxStoreById,
  NoData,
  TComboboxItem,
  useComboboxSelectors,
} from '..';
import { ComboboxContentProps } from './useComboboxContent';

export type ComboboxContentItemProps<TData extends Data = NoData> = {
  index: number;
  item: TComboboxItem<TData>;
  combobox: ComboboxControls;
} & Pick<ComboboxContentProps<TData>, 'onRenderItem'>;

export interface ComboboxItemProps<TData extends Data = NoData> {
  item: TComboboxItem<TData>;
  search: string;
}

export const useComboboxItem = <TData extends Data = NoData>({
  index,
  item,
  onRenderItem,
  combobox,
}: ComboboxContentItemProps<TData>) => {
  const editor = useEditorRef();
  const text = useComboboxSelectors.text() ?? '';
  const highlightedIndex = useComboboxSelectors.highlightedIndex();

  const Item = onRenderItem
    ? onRenderItem({ search: text, item: item as TComboboxItem<TData> })
    : item.text;

  const highlighted = index === highlightedIndex;

  return {
    props: {
      'data-highlighted': highlighted,
      ...combobox.getItemProps({
        item,
        index,
      }),
      onMouseDown: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();

        const onSelectItem = getComboboxStoreById(
          comboboxSelectors.activeId()
        )?.get.onSelectItem();
        onSelectItem?.(editor, item);
      },
      children: Item,
    },
  };
};
