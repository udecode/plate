import React, { useCallback, useEffect } from 'react';
import { isDefined } from '@udecode/plate-common';
import { useEditorState, useEventEditorId } from '@udecode/plate-core';
import {
  getRangeBoundingClientRect,
  usePopperPosition,
  virtualReference,
} from '@udecode/plate-popper';
import { PortalBody } from '@udecode/plate-styled-components';
import {
  comboboxStore,
  getComboboxStoreById,
  useActiveComboboxStore,
} from '../combobox.store';
import { useComboboxControls } from '../hooks/useComboboxControls';
import { ComboboxItem, ComboboxRoot } from './Combobox.styles';
import { ComboboxProps } from './Combobox.types';

const ComboboxContent = ({
  id,
  component: Component,
  items,
  onRenderItem,
}: Pick<ComboboxProps, 'id' | 'component' | 'onRenderItem' | 'items'>) => {
  const targetRange = comboboxStore.use.targetRange();
  const filteredItems = comboboxStore.use.filteredItems();
  const highlightedIndex = comboboxStore.use.highlightedIndex();
  const popperContainer = comboboxStore.use.popperContainer();
  const popperOptions = comboboxStore.use.popperOptions();
  const editor = useEditorState();
  const combobox = useComboboxControls();
  const activeComboboxStore = useActiveComboboxStore()!;
  const text = comboboxStore.use.text();
  const storeItems = comboboxStore.use.items();
  const filter = activeComboboxStore.use.filter?.();
  const maxSuggestions =
    activeComboboxStore.use.maxSuggestions?.() ?? storeItems.length;

  const popperRef = React.useRef<any>(null);

  // Update items
  useEffect(() => {
    items && comboboxStore.set.items(items);
  }, [items]);

  // Filter items
  useEffect(() => {
    if (!isDefined(text)) return;

    if (text.length === 0) {
      return comboboxStore.set.filteredItems(
        storeItems.slice(0, maxSuggestions)
      );
    }

    const _filteredItems = storeItems
      .filter(
        filter
          ? filter(text)
          : (value) => value.text.toLowerCase().startsWith(text.toLowerCase())
      )
      .slice(0, maxSuggestions);

    comboboxStore.set.filteredItems(_filteredItems);
  }, [filter, storeItems, maxSuggestions, text]);

  // Get target range rect
  const getBoundingClientRect = useCallback(
    () => getRangeBoundingClientRect(editor, targetRange) ?? virtualReference,
    [editor, targetRange]
  );

  // Update popper position
  const { styles: popperStyles, attributes } = usePopperPosition({
    popperElement: popperRef.current,
    popperContainer,
    popperOptions,
    placement: 'bottom-start',
    getBoundingClientRect,
    offset: [0, 4],
  });

  const menuProps = combobox
    ? combobox.getMenuProps({}, { suppressRefError: true })
    : { ref: null };

  return (
    <PortalBody>
      <ComboboxRoot
        {...menuProps}
        ref={popperRef}
        style={{ ...popperStyles.popper, maxHeight: 288, overflow: 'scroll' }}
        {...attributes.popper}
      >
        {Component ? Component({ store: activeComboboxStore }) : null}

        {filteredItems.map((item, index) => {
          const Item = onRenderItem ? onRenderItem({ item }) : item.text;

          return (
            <ComboboxItem
              key={item.key}
              highlighted={index === highlightedIndex}
              {...combobox.getItemProps({
                item,
                index,
              })}
              onMouseDown={(e) => {
                e.preventDefault();

                const onSelectItem = getComboboxStoreById(
                  id
                )?.get.onSelectItem();
                onSelectItem?.(editor, item);
              }}
            >
              {Item}
            </ComboboxItem>
          );
        })}
      </ComboboxRoot>
    </PortalBody>
  );
};

/**
 * Register the combobox id, trigger, onSelectItem
 * Renders the combobox if active.
 */
export const Combobox = (props: ComboboxProps) => {
  const { component, onRenderItem, items, ...comboboxProps } = props;
  const activeId = comboboxStore.use.activeId();
  const editor = useEditorState();
  const focusedEditorId = useEventEditorId('focus');

  const combobox = useComboboxControls();

  useEffect(() => {
    comboboxStore.set.setComboboxById(comboboxProps);
  }, [comboboxProps]);

  if (
    activeId !== comboboxProps.id ||
    !combobox ||
    !editor.selection ||
    focusedEditorId !== editor.id
  ) {
    return null;
  }

  return (
    <ComboboxContent
      id={comboboxProps.id}
      items={items}
      component={component}
      onRenderItem={onRenderItem}
    />
  );
};
