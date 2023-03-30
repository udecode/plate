import React, { useCallback, useEffect } from 'react';
import {
  comboboxActions,
  comboboxSelectors,
  Data,
  getComboboxStoreById,
  NoData,
  TComboboxItem,
  useActiveComboboxStore,
  useComboboxControls,
  useComboboxSelectors,
} from '@udecode/plate-combobox';
import {
  useEventEditorSelectors,
  usePlateEditorState,
} from '@udecode/plate-common';
import {
  flip,
  getRangeBoundingClientRect,
  offset,
  shift,
  useVirtualFloating,
} from '@udecode/plate-floating';
import { PortalBody } from '@udecode/plate-styled-components';
import { getComboboxStyles } from './Combobox.styles';
import { ComboboxProps } from './Combobox.types';

const ComboboxContent = <TData extends Data = NoData>(
  props: Omit<
    ComboboxProps<TData>,
    | 'id'
    | 'trigger'
    | 'searchPattern'
    | 'onSelectItem'
    | 'controlled'
    | 'maxSuggestions'
    | 'filter'
    | 'sort'
  >
) => {
  const { component: Component, items, portalElement, onRenderItem } = props;

  const targetRange = useComboboxSelectors.targetRange();
  const filteredItems = useComboboxSelectors.filteredItems();
  const highlightedIndex = useComboboxSelectors.highlightedIndex();
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
  const { style, refs } = useVirtualFloating({
    placement: 'bottom-start',
    getBoundingClientRect,
    middleware: [offset(4), shift(), flip()],
    ...floatingOptions,
  });

  const menuProps = combobox
    ? combobox.getMenuProps({}, { suppressRefError: true })
    : { ref: null };

  const { root, item: styleItem, highlightedItem } = getComboboxStyles(
    props as any
  );

  return (
    <PortalBody element={portalElement}>
      <ul
        {...menuProps}
        ref={refs.setFloating}
        style={style}
        css={root.css}
        className={root.className}
      >
        {Component ? Component({ store: activeComboboxStore }) : null}

        {filteredItems.map((item, index) => {
          const Item = onRenderItem
            ? onRenderItem({ search: text, item: item as TComboboxItem<TData> })
            : item.text;

          const highlighted = index === highlightedIndex;

          return (
            <div
              key={item.key}
              css={!highlighted ? styleItem?.css : highlightedItem?.css}
              className={
                !highlighted ? styleItem?.className : highlightedItem?.className
              }
              {...combobox.getItemProps({
                item,
                index,
              })}
              onMouseDown={(e) => {
                e.preventDefault();

                const onSelectItem = getComboboxStoreById(
                  comboboxSelectors.activeId()
                )?.get.onSelectItem();
                onSelectItem?.(editor, item);
              }}
            >
              {Item}
            </div>
          );
        })}
      </ul>
    </PortalBody>
  );
};

/**
 * Register the combobox id, trigger, onSelectItem
 * Renders the combobox if active.
 */
export const Combobox = <TData extends Data = NoData>({
  id,
  trigger,
  searchPattern,
  onSelectItem,
  controlled,
  maxSuggestions,
  filter,
  sort,
  floatingOptions,
  disabled: _disabled,
  ...props
}: ComboboxProps<TData>) => {
  const storeItems = useComboboxSelectors.items();
  const disabled = _disabled ?? (!storeItems.length && !props.items?.length);

  const editor = usePlateEditorState();
  const focusedEditorId = useEventEditorSelectors.focus?.();
  const combobox = useComboboxControls();
  const activeId = useComboboxSelectors.activeId();

  useEffect(() => {
    if (floatingOptions) {
      comboboxActions.floatingOptions(floatingOptions);
    }
  }, [floatingOptions]);

  useEffect(() => {
    comboboxActions.setComboboxById({
      id,
      trigger,
      searchPattern,
      controlled,
      onSelectItem,
      maxSuggestions,
      filter,
      sort,
    });
  }, [
    id,
    trigger,
    searchPattern,
    controlled,
    onSelectItem,
    maxSuggestions,
    filter,
    sort,
  ]);

  if (
    !combobox ||
    !editor.selection ||
    focusedEditorId !== editor.id ||
    activeId !== id ||
    disabled
  ) {
    return null;
  }

  return <ComboboxContent {...props} />;
};
