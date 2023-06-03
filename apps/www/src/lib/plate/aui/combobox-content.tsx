import React from 'react';
import {
  Data,
  NoData,
  TComboboxItem,
  useActiveComboboxStore,
  useComboboxSelectors,
} from '@udecode/plate-combobox';
import { PortalBody } from '@udecode/plate-common';

import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ComboboxContentProps,
  useComboboxContent,
  useComboboxContentState,
} from '@/lib/@/useComboboxContent';
import {
  ComboboxContentItemProps,
  useComboboxItem,
} from '@/lib/@/useComboboxItem';
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
          'z-[500] m-0 max-h-[288px] w-[300px] overflow-scroll rounded-b-[2px] bg-background p-0 shadow-[rgba(0,0,0,0.133)_0_3.2px_7.2px_0,rgba(0,0,0,0.11)_0_0.6px_1.8px_0]'
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
