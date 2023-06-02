import React from 'react';
import {
  Data,
  NoData,
  useActiveComboboxStore,
  useComboboxSelectors,
} from '@udecode/plate-combobox';
import { PortalBody } from '@udecode/plate-common';
import { cn } from '@udecode/plate-tailwind';

import { ScrollArea } from '@/components/ui/scroll-area';
import { ComboboxItem } from '@/lib/@/ComboboxItem';
import {
  ComboboxContentProps,
  useComboboxContentProps,
} from '@/lib/@/useComboboxContentProps';

export function ComboboxContent<TData extends Data = NoData>(
  props: ComboboxContentProps<TData>
) {
  const { component: Component, items, portalElement, combobox } = props;

  const filteredItems = useComboboxSelectors.filteredItems();
  const activeComboboxStore = useActiveComboboxStore()!;

  const comboboxContentProps = useComboboxContentProps({ items, combobox });

  return (
    <PortalBody element={portalElement}>
      <ScrollArea
        {...comboboxContentProps}
        className={cn(
          'z-[500] m-0 max-h-[288px] w-[300px] overflow-scroll rounded-b-[2px] bg-background p-0 shadow-[rgba(0,0,0,0.133)_0_3.2px_7.2px_0,rgba(0,0,0,0.11)_0_0.6px_1.8px_0]'
        )}
      >
        {Component ? Component({ store: activeComboboxStore }) : null}

        {filteredItems.map((item, index) => {
          return (
            <ComboboxItem
              key={item.key}
              className={cn(
                'relative flex h-9 cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
                'hover:bg-accent hover:text-accent-foreground data-[highlighted=true]:bg-accent data-[highlighted=true]:text-accent-foreground'
              )}
              item={item}
              index={index}
              combobox={combobox}
            />
          );
        })}
      </ScrollArea>
    </PortalBody>
  );
}
