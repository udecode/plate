import React from 'react';
import { Check } from 'lucide-react';
import { Button } from './ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Icons } from './icons';

import { cn } from '@/lib/utils';

const items = {
  playground: {
    value: 'playground',
    label: 'Playground',
  },
  sveltekit: {
    value: 'sveltekit',
    label: 'SvelteKit',
  },
  nuxt: {
    value: 'nuxt',
    label: 'Nuxt.js',
  },
  remix: {
    value: 'remix',
    label: 'Remix',
  },
  astro: {
    value: 'astro',
    label: 'Astro',
  },
};

const categories = [
  {
    value: 'root',
    label: '',
    items: [items.playground],
  },
  {
    value: 'plugins',
    label: 'Plugins',
    items: [items.nuxt, items.remix, items.astro],
  },
];

export function SettingsCombobox() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(items.playground.value);
  console.log(items[value]);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value !== items.playground.value
            ? items[value]?.label
            : 'Select a value...'}
          <Icons.chevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command defaultValue="playground">
          <CommandInput placeholder="Search value..." />
          <CommandEmpty>No value found.</CommandEmpty>

          {categories.map((category) => (
            <CommandGroup key={category.value} heading={category.label}>
              {category.items.map((item) => (
                <CommandItem
                  key={item.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === item.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
