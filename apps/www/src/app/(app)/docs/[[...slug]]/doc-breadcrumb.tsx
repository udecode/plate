'use client';

import * as React from 'react';

import type { SidebarNavItem } from '@/types/nav';

import { cn } from '@udecode/cn';
import { ChevronsUpDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/registry/default/plate-ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/registry/default/plate-ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/registry/default/plate-ui/popover';

export function DocBreadcrumb({
  buttonClassName,
  combobox = true,
  emptyText = 'No results found.',
  items,
  placeholder = 'Search...',
  value,
}: {
  items: SidebarNavItem[];
  buttonClassName?: string;
  combobox?: boolean;
  emptyText?: string;
  placeholder?: string;
  value?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const flatItems = React.useMemo(() => items.flatMap((g) => g.items), [items]);

  const selectedItem = flatItems.find(
    (item) => (item?.value ?? item?.href) === value
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {combobox ? (
          <Button
            size="sm"
            variant="outline"
            className={cn(
              'min-w-32 justify-between focus:outline-none',
              buttonClassName
            )}
          >
            {selectedItem?.title ?? placeholder}
            <ChevronsUpDown className="shrink-0 opacity-50" />
          </Button>
        ) : (
          <Button size="sm" variant="ghost">
            {selectedItem?.title ?? placeholder}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          {combobox && (
            <CommandInput className="h-9" placeholder={placeholder} />
          )}
          <CommandEmpty>{emptyText}</CommandEmpty>
          <CommandList className={cn('max-h-[70vh]', !combobox && 'min-h-0')}>
            {items.map((group, index) => (
              <CommandGroup
                key={group.title ?? index}
                className="px-2"
                heading={group.title}
              >
                {group.items?.map((item) => (
                  <CommandItem
                    key={item.href}
                    value={item.value ?? item.href}
                    onSelect={() => {
                      router.push(item.href!);
                      setOpen(false);
                    }}
                  >
                    {item.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
