import { useCallback, useEffect } from 'react';
import {
  comboboxActions,
  Data,
  NoData,
  useActiveComboboxStore,
  useComboboxControls,
  useComboboxSelectors,
} from '@udecode/plate-combobox';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  useComposedRef,
  usePlateEditorState,
} from '@udecode/plate-core';
import {
  flip,
  getRangeBoundingClientRect,
  offset,
  shift,
  useVirtualFloating,
} from '@udecode/plate-floating';
import { ComboboxContentProps } from './PlateCombobox';

export type ComboboxContentRootProps<
  TData extends Data = NoData
> = HTMLPropsAs<'ul'> & ComboboxContentProps<TData>;

export const useComboboxContentRootProps = <TData extends Data = NoData>(
  props: ComboboxContentRootProps<TData>
): HTMLPropsAs<'ul'> => {
  const { items } = props;

  const targetRange = useComboboxSelectors.targetRange();
  const floatingOptions = useComboboxSelectors.floatingOptions();
  const editor = usePlateEditorState();
  const combobox = useComboboxControls();
  const activeComboboxStore = useActiveComboboxStore()!;
  const text = useComboboxSelectors.text() ?? '';
  const storeItems = useComboboxSelectors.items();
  const filter = activeComboboxStore.use.filter?.();
  const sort = activeComboboxStore.use.sort?.();
  const maxSuggestions =
    activeComboboxStore.use.maxSuggestions?.() ?? storeItems.length;

  // Update items
  useEffect(() => {
    items && comboboxActions.items(items);
  }, [items]);

  // Filter items
  useEffect(() => {
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

  // Get target range rect
  const getBoundingClientRect = useCallback(
    () => getRangeBoundingClientRect(editor, targetRange),
    [editor, targetRange]
  );

  // Update popper position
  const { style, floating } = useVirtualFloating({
    placement: 'bottom-start',
    getBoundingClientRect,
    middleware: [offset(4), shift(), flip()],
    ...floatingOptions,
  });

  const menuProps = combobox
    ? combobox.getMenuProps({}, { suppressRefError: true })
    : { ref: null };

  return {
    ...menuProps,
    ...props,
    ref: useComposedRef<HTMLUListElement>(props.ref, floating),
    style: { ...style, ...props.style },
  };
};

export const ComboboxContentRoot = createComponentAs<ComboboxContentRootProps>(
  (props) => {
    const htmlProps = useComboboxContentRootProps(props);

    return createElementAs('ul', htmlProps);
  }
);
