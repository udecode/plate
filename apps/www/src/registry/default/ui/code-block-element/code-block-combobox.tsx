'use client';

import React, { useState } from 'react';
import {
  CODE_BLOCK_LANGUAGES,
  CODE_BLOCK_LANGUAGES_POPULAR,
  useCodeBlockCombobox,
  useCodeBlockComboboxState,
} from '@udecode/plate-code-block';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/registry/default/ui/button';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/registry/default/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/registry/default/ui/popover';

const languages: { value: string; label: string }[] = [
  { value: 'text', label: 'Plain Text' },
  ...Object.entries({
    ...CODE_BLOCK_LANGUAGES_POPULAR,
    ...CODE_BLOCK_LANGUAGES,
  }).map(([key, val]) => ({
    value: key,
    label: val as string,
  })),
];

export function CodeBlockCombobox() {
  const state = useCodeBlockComboboxState();
  const { commandProps, commandItemProps } = useCodeBlockCombobox(state);

  const [open, setOpen] = useState(false);

  if (state.readOnly) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="h-5 justify-between px-1 text-xs"
          size="xs"
        >
          {state.value
            ? languages.find((language) => language.value === state.value)
                ?.label
            : 'Plain Text'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search language..." />
          <CommandEmpty>No language found.</CommandEmpty>

          <CommandList>
            {languages.map((language) => (
              <CommandItem
                key={language.value}
                value={language.value}
                className="cursor-pointer"
                onSelect={(_value) => {
                  commandItemProps.onSelect(_value);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    state.value === language.value ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {language.label}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
