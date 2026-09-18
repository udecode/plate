'use client';

import { WrapText } from 'lucide-react';
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
  const focusEditorRef = React.useRef(false);

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) focusEditorRef.current = false;
        setOpen(nextOpen);
      }}
      modal={false}
    >
      <DropdownMenuTrigger>
        <ToolbarButton pressed={open} tooltip="Line height" isDropdown>
          <WrapText />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="min-w-0"
        align="start"
        onFinalFocus={(event) => {
          if (!focusEditorRef.current) return;

          focusEditorRef.current = false;
          event.preventDefault();
          editor.api.dom.focus();
        }}
      >
        <DropdownMenuRadioGroup
          value={String(value)}
          onValueChange={(newValue) => {
            focusEditorRef.current = true;
            editor.plugin(LineHeightPlugin).update.set(Number(newValue));
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
