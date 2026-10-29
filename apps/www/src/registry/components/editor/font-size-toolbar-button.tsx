'use client';

import { Minus, Plus } from 'lucide-react';
import {
  FontSizePlugin,
  HeadingPlugin,
  useEditor,
  useEditorReadOnly,
  useEditorSelector,
} from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  FloatingPopover,
  FloatingPopoverContent,
  FloatingPopoverAnchor,
} from '@/registry/components/editor/floating-popover';
import { ToolbarButton } from '@/registry/components/editor/toolbar';

import { useToolbarOverlayTrigger } from './toolbar-overlay';

const DEFAULT_FONT_SIZE = '16';

const FONT_SIZE_MAP: Record<number, string | undefined> = {
  1: '36',
  2: '24',
  3: '20',
  4: '18',
  5: '18',
  6: '16',
};

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

const toPixels = (value: string) => {
  const match = /^(\d+(?:\.\d+)?)(px|pt)?$/.exec(value.trim());

  if (!match) return undefined;

  const size = Number(match[1]);

  return Math.round((match[2] === 'pt' ? (size * 4) / 3 : size) * 10) / 10;
};

export function FontSizeToolbarButton() {
  const [inputValue, setInputValue] = React.useState(DEFAULT_FONT_SIZE);
  const [isFocused, setIsFocused] = React.useState(false);
  const inputDirtyRef = React.useRef(false);
  const editor = useEditor();
  const readOnly = useEditorReadOnly();
  const { installed } = editor.plugin(FontSizePlugin);
  const { opening: beginInteraction } = useToolbarOverlayTrigger({
    'aria-haspopup': 'dialog',
    'aria-expanded': isFocused,
  });

  const cursorFontSize = useEditorSelector((innerEditor) => {
    const portal = innerEditor.plugin(FontSizePlugin);
    const fontSize = portal.installed ? portal.read.value() : undefined;

    if (fontSize) {
      return String(toPixels(fontSize) ?? fontSize);
    }

    const [block] = innerEditor.read.nodes.block() ?? [];

    if (!block?.type) return DEFAULT_FONT_SIZE;

    const heading = innerEditor.plugin(HeadingPlugin);
    const level = heading.installed ? heading.read.level(block) : undefined;

    return level
      ? (FONT_SIZE_MAP[level] ?? DEFAULT_FONT_SIZE)
      : DEFAULT_FONT_SIZE;
  });

  const displayValue = isFocused ? inputValue : cursorFontSize;

  const setFontSize = (size: number) => {
    inputDirtyRef.current = false;
    if (
      editor.read.view.isReadOnly() ||
      !editor.plugin(FontSizePlugin).installed ||
      !Number.isFinite(size) ||
      size < 1 ||
      size > 100 ||
      size === toPixels(cursorFontSize)
    ) {
      return;
    }
    editor.plugin(FontSizePlugin).update.set(`${size}px`);
  };

  const handleInputChange = () => {
    if (inputDirtyRef.current) {
      setFontSize(toPixels(inputValue) ?? Number.NaN);
    }
  };

  return (
    <div className="flex h-7 items-center gap-1 rounded-md bg-muted/60 p-0">
      <ToolbarButton
        disabled={readOnly || !installed}
        aria-label="Decrease font size"
        onClick={() => {
          setFontSize((toPixels(displayValue) ?? Number.NaN) - 1);
        }}
      >
        <Minus />
      </ToolbarButton>

      <FloatingPopover open={isFocused} modal={false}>
        <FloatingPopoverAnchor
          element={
            <Input
              disabled={readOnly || !installed}
              aria-label="Font size"
              className={cn(
                'h-full w-10 shrink-0 border-none bg-transparent px-1 text-center hover:bg-muted focus-visible:ring-transparent'
              )}
              value={displayValue}
              onBlur={() => {
                setIsFocused(false);
                handleInputChange();
              }}
              onChange={(e) => {
                inputDirtyRef.current = true;
                setInputValue(e.target.value);
              }}
              onFocus={() => {
                beginInteraction();
                inputDirtyRef.current = false;
                setIsFocused(true);
                setInputValue(cursorFontSize);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleInputChange();
                  editor.api.dom.focus();
                }
              }}
              data-editor-keep-selection-visible="true"
              type="text"
            />
          }
        />
        <FloatingPopoverContent
          className="w-10 px-px py-1"
          onInitialFocus={(e) => {
            e.preventDefault();
          }}
        >
          {FONT_SIZES.map((size) => (
            <Button
              disabled={readOnly || !installed}
              key={size}
              className={cn('h-8 w-full data-[highlighted=true]:bg-accent')}
              onClick={() => {
                setFontSize(Number(size));
                editor.api.dom.focus();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
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
        disabled={readOnly || !installed}
        aria-label="Increase font size"
        onClick={() => {
          setFontSize((toPixels(displayValue) ?? Number.NaN) + 1);
        }}
      >
        <Plus />
      </ToolbarButton>
    </div>
  );
}
