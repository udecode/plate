import React from 'react';
import { Check } from 'lucide-react';
import { Button } from './ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Icons } from './icons';

import { settingValues } from '@/config/setting-values';
import { cn } from '@/lib/utils';

const categories = [
  {
    value: 'root',
    label: '',
    items: [settingValues.playground],
  },
  {
    value: 'plugins',
    label: 'Plugins',
    items: [
      settingValues.font,
      settingValues.highlight,
      settingValues.link,
      settingValues.mention,
      settingValues.emoji,
      settingValues.align,
      settingValues.lineheight,
      settingValues.indent,
      settingValues.liststyletype,
      settingValues.hr,
      settingValues.list,
      settingValues.media,
      settingValues.table,
      settingValues.action_item,
      settingValues.autoformat,
      settingValues.softbreak,
      settingValues.exitbreak,
      settingValues.dragovercursor,
      settingValues.tabbable,
      settingValues.comment,
      settingValues.deserializehtml,
      settingValues.deserializemd,
      settingValues.deserializedocx,
      settingValues.deserializecsv,
      settingValues.trailingblock,
      settingValues.excalidraw,
    ],
  },
];

export function SettingsCombobox() {
  const [open, setOpen] = React.useState(false);
  const [id, setId] = React.useState(settingValues.playground.id);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {id !== settingValues.playground.id
            ? settingValues[id]?.label
            : 'Select a value...'}
          <Icons.chevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command defaultValue="playground">
          <CommandInput placeholder="Search value..." />
          <CommandEmpty>No value found.</CommandEmpty>

          <CommandList>
            {categories.map((category) => (
              <CommandGroup key={category.value} heading={category.label}>
                {category.items.map((item) => {
                  return (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={(newId) => {
                        setId(newId);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          id === item.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {item.label}
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
