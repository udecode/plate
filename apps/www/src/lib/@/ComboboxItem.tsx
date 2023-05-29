import { ComboboxControls } from '@udecode/plate';
import {
  comboboxSelectors,
  Data,
  getComboboxStoreById,
  NoData,
  TComboboxItem,
  useComboboxSelectors,
} from '@udecode/plate-combobox';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  usePlateEditorRef,
} from '@udecode/plate-common';
import { ComboboxContentProps } from './useComboboxContentProps';

export type ComboboxContentItemProps<TData extends Data = NoData> =
  HTMLPropsAs<'div'> &
    ComboboxContentProps<TData> & {
      index: number;
      item: TComboboxItem<TData>;
      combobox: ComboboxControls;
    };

export interface ComboboxItemProps<TData> {
  item: TComboboxItem<TData>;
  search: string;
}

export const useComboboxItemProps = <TData extends Data = NoData>({
  index,
  item,
  onRenderItem,
  combobox,
  ...props
}: ComboboxContentItemProps<TData>) => {
  const editor = usePlateEditorRef();
  const text = useComboboxSelectors.text() ?? '';
  const highlightedIndex = useComboboxSelectors.highlightedIndex();

  const Item = onRenderItem
    ? onRenderItem({ search: text, item: item as TComboboxItem<TData> })
    : item.text;

  const highlighted = index === highlightedIndex;

  return {
    'data-highlighted': highlighted,
    ...combobox.getItemProps({
      item,
      index,
    }),
    onMouseDown: (e) => {
      e.preventDefault();

      const onSelectItem = getComboboxStoreById(
        comboboxSelectors.activeId()
      )?.get.onSelectItem();
      onSelectItem?.(editor, item);
    },
    children: Item,
    ...props,
  };
};

export const ComboboxItem = createComponentAs<ComboboxContentItemProps>(
  (props) => {
    const htmlProps = useComboboxItemProps(props);

    return createElementAs('div', htmlProps);
  }
);
