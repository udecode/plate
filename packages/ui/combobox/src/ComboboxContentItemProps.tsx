import {
  ComboboxControls,
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
} from '@udecode/plate-core';
import { ComboboxContentProps } from './PlateCombobox';

export type ComboboxContentItemProps<
  TData extends Data = NoData
> = HTMLPropsAs<'div'> &
  ComboboxContentProps<TData> & {
    index: number;
    text: string;
    item: TComboboxItem<TData>;
    combobox: ComboboxControls;
  };
export const useComboboxContentItemProps = <TData extends Data = NoData>(
  props: ComboboxContentItemProps<TData>
): HTMLPropsAs<'div'> => {
  const { index, text, item, onRenderItem, combobox } = props;
  const editor = usePlateEditorRef();

  const Item = onRenderItem
    ? onRenderItem({ search: text, item: item as TComboboxItem<TData> })
    : item.text;

  return {
    key: item.key,

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
export const useComboboxContentItemState = (props: { index: number }) => {
  const { index } = props;

  const highlightedIndex = useComboboxSelectors.highlightedIndex();

  return { highlighted: index === highlightedIndex };
};

export const ComboboxContentItem = createComponentAs<ComboboxContentItemProps>(
  (props) => {
    const htmlProps = useComboboxContentItemProps(props);

    return createElementAs('div', htmlProps);
  }
);
