'use client';

import * as React from 'react';

import type { SidebarNavItem } from '@/types/nav';

import { cn } from '@udecode/cn';
import { ChevronsUpDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { getDocIcon } from '@/config/docs-icons';
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
  category,
  combobox = true,
  emptyText = 'No results found.',
  items,
  placeholder = 'Search...',
  value,
}: {
  items: SidebarNavItem[];
  buttonClassName?: string;
  category?: string;
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
      <PopoverContent
        className={cn('w-[200px] p-0', category && 'w-[300px]')}
        align="start"
      >
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
                {group.items?.map((item) => {
                  const Icon = getDocIcon(item, category);

                  return (
                    <CommandItem
                      key={item.href}
                      className="flex items-center gap-2"
                      value={item.value ?? item.href}
                      onSelect={() => {
                        router.push(item.href!);
                        setOpen(false);
                      }}
                    >
                      {category && Icon && (
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-white">
                          <Icon className="size-4 text-neutral-800" />
                        </div>
                      )}
                      <div>
                        <div
                          className={cn(
                            'line-clamp-1',
                            category && 'font-medium'
                          )}
                        >
                          {item.title}
                        </div>
                        {category && item.description && (
                          <div className="line-clamp-1 text-xs text-muted-foreground">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
