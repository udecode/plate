'use client';

import React, { useEffect } from 'react';
import {
  comboboxActions,
  ComboboxContentItemProps,
  ComboboxContentProps,
  ComboboxProps,
  Data,
  NoData,
  TComboboxItem,
  useActiveComboboxStore,
  useComboboxContent,
  useComboboxContentState,
  useComboboxControls,
  useComboboxItem,
  useComboboxSelectors,
} from '@udecode/plate-combobox';
import {
  PortalBody,
  useEventEditorSelectors,
  usePlateEditorState,
} from '@udecode/plate-common';
import { ScrollArea } from './scroll-area';

import { cn } from '@/lib/utils';

export function ComboboxItem<TData extends Data = NoData>({
  combobox,
  index,
  item,
  onRenderItem,
}: ComboboxContentItemProps<TData>) {
  const { props } = useComboboxItem({ item, index, combobox, onRenderItem });

  return (
    <div
      className={cn(
        'relative flex h-9 cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
        'hover:bg-accent hover:text-accent-foreground data-[highlighted=true]:bg-accent data-[highlighted=true]:text-accent-foreground'
      )}
      {...props}
    />
  );
}

export function ComboboxContent<TData extends Data = NoData>(
  props: ComboboxContentProps<TData>
) {
  const {
    component: Component,
    items,
    portalElement,
    combobox,
    onRenderItem,
  } = props;

  const filteredItems =
    useComboboxSelectors.filteredItems() as TComboboxItem<TData>[];
  const activeComboboxStore = useActiveComboboxStore()!;

  const state = useComboboxContentState({ items, combobox });
  const { menuProps, menuRef } = useComboboxContent(state);

  return (
    <PortalBody element={portalElement}>
      <ScrollArea
        {...menuProps}
        ref={menuRef}
        className={cn(
          'z-[500] m-0 max-h-[288px] w-[300px] overflow-scroll rounded-md bg-popover p-0 shadow-md'
        )}
      >
        {Component ? Component({ store: activeComboboxStore }) : null}

        {filteredItems.map((item, index) => (
          <ComboboxItem
            key={item.key}
            item={item}
            combobox={combobox}
            index={index}
            onRenderItem={onRenderItem}
          />
        ))}
      </ScrollArea>
    </PortalBody>
  );
}

/**
 * Register the combobox id, trigger, onSelectItem
 * Renders the combobox if active.
 */
export function Combobox<TData extends Data = NoData>({
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
}: ComboboxProps<TData>) {
  const storeItems = useComboboxSelectors.items();
  const disabled =
    _disabled ?? (storeItems.length === 0 && !props.items?.length);

  const focusedEditorId = useEventEditorSelectors.focus?.();
  const combobox = useComboboxControls();
  const activeId = useComboboxSelectors.activeId();
  const editor = usePlateEditorState();

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

  return <ComboboxContent combobox={combobox} {...props} />;
}
