'use client';

import { LineHeightPlugin } from '@platejs/basic-styles/react';
import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import { DropdownMenuItemIndicator } from '@radix-ui/react-dropdown-menu';
import { CheckIcon, WrapText } from 'lucide-react';
import { useEditor, useSelectionFragmentProp } from 'platejs/react';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { ToolbarButton } from './toolbar';

export function LineHeightToolbarButton(props: DropdownMenuProps) {
  const editor = useEditor();
  const { nodeProps } = editor.plugin(LineHeightPlugin).inject;

  if (!nodeProps) {
    throw new Error('Line height node properties are not configured.');
  }
  const { defaultNodeValue, nodeKey, validNodeValues = [] } = nodeProps;
  const values = validNodeValues.filter((value) => typeof value === 'number');

  const value = useSelectionFragmentProp({
    defaultValue: defaultNodeValue,
    key: nodeKey,
  });

  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip="Line height" isDropdown>
          <WrapText />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-0" align="start">
        <DropdownMenuRadioGroup
          value={String(value)}
          onValueChange={(newValue) => {
            editor.plugin(LineHeightPlugin).update.set(Number(newValue));
            editor.api.dom.focus();
          }}
        >
          {values.map((innerValue) => (
            <DropdownMenuRadioItem
              key={innerValue}
              className="min-w-[180px] pl-2 *:first:[span]:hidden"
              value={String(innerValue)}
            >
              <span className="pointer-events-none absolute right-2 flex size-3.5 items-center justify-center">
                <DropdownMenuItemIndicator>
                  <CheckIcon />
                </DropdownMenuItemIndicator>
              </span>
              {innerValue}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
