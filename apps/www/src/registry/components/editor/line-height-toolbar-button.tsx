'use client';

import { WrapText } from 'lucide-react';
import { ElementApi } from 'platejs';
import {
  LineHeightPlugin,
  useEditor,
  useSelectionFragmentProp,
} from 'platejs/react';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/registry/components/editor/dropdown-menu';
import { ToolbarButton } from '@/registry/components/editor/toolbar';

const presets = [1, 1.2, 1.5, 2, 3];

export function LineHeightToolbarButton() {
  const editor = useEditor();
  const value = useSelectionFragmentProp({
    getProp: (node) =>
      ElementApi.isElement(node) ? (node.lineHeight ?? 'default') : undefined,
  });

  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger>
        <ToolbarButton pressed={open} tooltip="Line height" isDropdown>
          <WrapText />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-0" align="start">
        <DropdownMenuRadioGroup
          value={
            typeof value === 'number' || value === 'default'
              ? String(value)
              : ''
          }
          onValueChange={(newValue) => {
            const lineHeight = editor.plugin(LineHeightPlugin);

            if (newValue === 'default') lineHeight.update.clear();
            else lineHeight.update.set(Number(newValue));
          }}
        >
          <DropdownMenuRadioItem
            className="min-w-[180px] pl-2 *:first:[span]:hidden"
            finalFocus={() => editor.api.dom.focus()}
            value="default"
          >
            Default
          </DropdownMenuRadioItem>
          {presets.map((preset) => (
            <DropdownMenuRadioItem
              key={preset}
              className="min-w-[180px] pl-2 *:first:[span]:hidden"
              finalFocus={() => editor.api.dom.focus()}
              value={String(preset)}
            >
              {preset}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
