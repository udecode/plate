'use client';

import React, { useState } from 'react';

import type { TCodeBlockElement } from '@udecode/plate-code-block';

import { cn } from '@udecode/cn';
import { useEditorRef, useElement, useReadOnly } from '@udecode/plate/react';
import { Check } from 'lucide-react';

import { Button } from './button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

const languages: { label: string; value: string }[] = [
  { label: 'Auto', value: 'auto' },
  { label: 'Plain Text', value: 'plaintext' },
  { label: 'Bash', value: 'bash' },
  { label: 'C', value: 'c' },
  { label: 'C++', value: 'cpp' },
  { label: 'C#', value: 'csharp' },
  { label: 'CSS', value: 'css' },
  { label: 'Diff', value: 'diff' },
  { label: 'Go', value: 'go' },
  { label: 'GraphQL', value: 'graphql' },
  { label: 'HTML', value: 'html' },
  { label: 'Java', value: 'java' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'JSON', value: 'json' },
  { label: 'JSX', value: 'jsx' },
  { label: 'Kotlin', value: 'kotlin' },
  { label: 'Less', value: 'less' },
  { label: 'Lua', value: 'lua' },
  { label: 'Makefile', value: 'makefile' },
  { label: 'Markdown', value: 'markdown' },
  { label: 'Objective-C', value: 'objectivec' },
  { label: 'PHP', value: 'php' },
  { label: 'Python', value: 'python' },
  { label: 'R', value: 'r' },
  { label: 'Ruby', value: 'ruby' },
  { label: 'Rust', value: 'rust' },
  { label: 'SCSS', value: 'scss' },
  { label: 'Shell', value: 'shell' },
  { label: 'SQL', value: 'sql' },
  { label: 'Swift', value: 'swift' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'TSX', value: 'tsx' },
  { label: 'XML', value: 'xml' },
  { label: 'YAML', value: 'yaml' },
];

export function CodeBlockCombobox() {
  const [open, setOpen] = useState(false);
  const readOnly = useReadOnly();
  const editor = useEditorRef();
  const element = useElement<TCodeBlockElement>();
  const value = element.lang ?? 'plaintext';
  const [searchValue, setSearchValue] = React.useState('');

  const items = React.useMemo(
    () =>
      languages.filter(
        (language) =>
          !searchValue ||
          language.label.toLowerCase().includes(searchValue.toLowerCase())
      ),
    [searchValue]
  );

  if (readOnly) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="xs"
          variant="ghost"
          className="h-6 justify-between text-muted-foreground gap-1 px-2 text-xs select-none"
          aria-expanded={open}
          role="combobox"
        >
          {languages.find((language) => language.value === value)?.label ??
            'Plain Text'}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[200px] p-0"
        onCloseAutoFocus={() => setSearchValue('')}
      >
        <Command shouldFilter={false}>
          <CommandInput
            className="h-9"
            value={searchValue}
            onValueChange={(value) => setSearchValue(value)}
            placeholder="Search language..."
          />
          <CommandEmpty>No language found.</CommandEmpty>

          <CommandList className="h-[344px] overflow-y-auto">
            <CommandGroup>
              {items.map((language) => (
                <CommandItem
                  key={language.value}
                  className="cursor-pointer"
                  value={language.value}
                  onSelect={(value) => {
                    editor.tf.setNodes<TCodeBlockElement>(
                      { lang: value },
                      { at: element }
                    );
                    setSearchValue(value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      value === language.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {language.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
