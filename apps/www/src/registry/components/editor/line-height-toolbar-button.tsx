'use client';

import { LineHeightPlugin } from '@platejs/basic-styles/react';
import { WrapText } from 'lucide-react';
import { useEditor, useSelectionFragmentProp } from 'platejs/react';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ToolbarButton } from '@/registry/components/editor/toolbar';

export function LineHeightToolbarButton() {
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
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
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
              {innerValue}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
