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

const categories = [
  {
    value: 'root',
    label: '',
    items: [
      {
        value: 'playground',
        label: 'Playground',
      },
    ],
  },
  {
    value: 'plugins',
    label: 'Plugins',
    items: [
      {
        value: 'sveltekit',
        label: 'SvelteKit',
      },
      {
        value: 'nuxt.js',
        label: 'Nuxt.js',
      },
      {
        value: 'remix',
        label: 'Remix',
      },
      {
        value: 'astro',
        label: 'Astro',
      },
    ],
  },
];

export function SettingsCombobox() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? categories.find((framework) => framework.value === value)?.label
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
