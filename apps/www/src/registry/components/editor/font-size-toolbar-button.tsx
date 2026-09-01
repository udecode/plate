'use client';

import { Minus, Plus } from 'lucide-react';
import { toUnitLess } from 'platejs';
import { FontSizePlugin, useEditor, useEditorSelector } from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  FloatingPopover,
  FloatingPopoverContent,
  FloatingPopoverTrigger,
} from '@/registry/components/editor/floating-popover';
import { ToolbarButton } from '@/registry/components/editor/toolbar';

const DEFAULT_FONT_SIZE = '16';

const FONT_SIZE_MAP = {
  h1: '36',
  h2: '24',
  h3: '20',
} as const;

const FONT_SIZES = [
  '8',
  '9',
  '10',
  '12',
  '14',
  '16',
  '18',
  '24',
  '30',
  '36',
  '48',
  '60',
  '72',
  '96',
] as const;

export function FontSizeToolbarButton() {
  const [inputValue, setInputValue] = React.useState(DEFAULT_FONT_SIZE);
  const [isFocused, setIsFocused] = React.useState(false);
  const editor = useEditor();

  const cursorFontSize = useEditorSelector((innerEditor) => {
    const fontSize = innerEditor.plugin(FontSizePlugin).read.value();

    if (fontSize) {
      return toUnitLess(fontSize);
    }

    const [block] = innerEditor.read.nodes.block() ?? [];

    if (!block?.type) return DEFAULT_FONT_SIZE;

    return block.type in FONT_SIZE_MAP
      ? FONT_SIZE_MAP[block.type as keyof typeof FONT_SIZE_MAP]
      : DEFAULT_FONT_SIZE;
  });

  const handleInputChange = () => {
    const newSize = toUnitLess(inputValue);

    if (
      Number.parseInt(newSize, 10) < 1 ||
      Number.parseInt(newSize, 10) > 100
    ) {
      return;
    }
    if (newSize !== toUnitLess(cursorFontSize)) {
      editor.plugin(FontSizePlugin).update.set(`${newSize}px`);
    }
  };

  const handleFontSizeChange = (delta: number) => {
    const newSize = Number(displayValue) + delta;
    editor.plugin(FontSizePlugin).update.set(`${newSize}px`);
  };

  const displayValue = isFocused ? inputValue : cursorFontSize;

  return (
    <div className="flex h-7 items-center gap-1 rounded-md bg-muted/60 p-0">
      <ToolbarButton
        onClick={() => {
          handleFontSizeChange(-1);
        }}
      >
        <Minus />
      </ToolbarButton>

      <FloatingPopover open={isFocused} modal={false}>
        <FloatingPopoverTrigger>
          <Input
            className={cn(
              'h-full w-10 shrink-0 border-none bg-transparent px-1 text-center hover:bg-muted focus-visible:ring-transparent'
            )}
            value={displayValue}
            onBlur={() => {
              setIsFocused(false);
              handleInputChange();
            }}
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
            onFocus={() => {
              setIsFocused(true);
              setInputValue(toUnitLess(cursorFontSize));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleInputChange();
              }
            }}
            data-plite-keep-selection-visible="true"
            type="text"
          />
        </FloatingPopoverTrigger>
        <FloatingPopoverContent
          className="w-10 px-px py-1"
          onInitialFocus={(e) => {
            e.preventDefault();
          }}
        >
          {FONT_SIZES.map((size) => (
            <Button
              key={size}
              className={cn('h-8 w-full data-[highlighted=true]:bg-accent')}
              onClick={() => {
                editor.plugin(FontSizePlugin).update.set(`${size}px`);
                setIsFocused(false);
              }}
              data-highlighted={size === displayValue}
              size="sm"
              type="button"
              variant="ghost"
            >
              {size}
            </Button>
          ))}
        </FloatingPopoverContent>
      </FloatingPopover>

      <ToolbarButton
        onClick={() => {
          handleFontSizeChange(1);
        }}
      >
        <Plus />
      </ToolbarButton>
    </div>
  );
}
