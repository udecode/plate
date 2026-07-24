'use client';

import * as React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import type { Element } from '@platejs/plite';

import { DropdownMenuItemIndicator } from '@radix-ui/react-dropdown-menu';
import {
  CheckIcon,
  ChevronRightIcon,
  Code2Icon,
  Columns3Icon,
  FileCodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  Heading5Icon,
  Heading6Icon,
  ListIcon,
  ListOrderedIcon,
  PilcrowIcon,
  QuoteIcon,
  SquareIcon,
} from 'lucide-react';
import { KEYS } from 'platejs';
import { useEditor, useSelectionFragmentProp } from 'platejs/react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  getBlockType,
  setBlockType,
} from '@/registry/components/editor/transforms-classic';

import { ToolbarButton, ToolbarMenuGroup } from './toolbar';

const turnIntoItems = [
  {
    icon: <PilcrowIcon />,
    label: 'Text',
    value: KEYS.p,
  },
  {
    icon: <Heading1Icon />,
    label: 'Heading 1',
    value: KEYS.h1,
  },
  {
    icon: <Heading2Icon />,
    label: 'Heading 2',
    value: KEYS.h2,
  },
  {
    icon: <Heading3Icon />,
    label: 'Heading 3',
    value: KEYS.h3,
  },
  {
    icon: <Heading4Icon />,
    label: 'Heading 4',
    value: KEYS.h4,
  },
  {
    icon: <Heading5Icon />,
    label: 'Heading 5',
    value: KEYS.h5,
  },
  {
    icon: <Heading6Icon />,
    label: 'Heading 6',
    value: KEYS.h6,
  },
  {
    icon: <ListIcon />,
    label: 'Bulleted list',
    value: KEYS.ulClassic,
  },
  {
    icon: <ListOrderedIcon />,
    label: 'Numbered list',
    value: KEYS.olClassic,
  },
  {
    icon: <SquareIcon />,
    label: 'To-do list',
    value: KEYS.taskList,
  },
  {
    icon: <ChevronRightIcon />,
    label: 'Toggle list',
    value: KEYS.toggle,
  },
  {
    icon: <FileCodeIcon />,
    label: 'Code',
    value: KEYS.codeBlock,
  },
  {
    icon: <Code2Icon />,
    label: 'Code Drawing',
    value: KEYS.codeDrawing,
  },
  {
    icon: <QuoteIcon />,
    label: 'Quote',
    value: KEYS.blockquote,
  },
  {
    icon: <Columns3Icon />,
    label: '3 columns',
    value: 'action_three_columns',
  },
];

export function TurnIntoToolbarButton(props: DropdownMenuProps) {
  const editor = useEditor();
  const [open, setOpen] = React.useState(false);

  const value = useSelectionFragmentProp({
    defaultValue: KEYS.p,
    getProp: (node) => getBlockType(node as Element),
  });
  const selectedValue = String(value ?? KEYS.p);
  const selectedItem = React.useMemo(
    () =>
      turnIntoItems.find((item) => item.value === selectedValue) ??
      turnIntoItems[0],
    [selectedValue]
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          className="min-w-[125px]"
          pressed={open}
          tooltip="Turn into"
          isDropdown
        >
          {selectedItem.label}
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="ignore-click-outside/toolbar min-w-0"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          editor.api.dom.focus();
        }}
        align="start"
      >
        <ToolbarMenuGroup
          value={selectedValue}
          onValueChange={(type) => {
            setBlockType(editor, type);
          }}
          label="Turn into"
        >
          {turnIntoItems.map(({ icon, label, value: itemValue }) => (
            <DropdownMenuRadioItem
              key={itemValue}
              className="min-w-[180px] pl-2 *:first:[span]:hidden"
              value={itemValue}
            >
              <span className="pointer-events-none absolute right-2 flex size-3.5 items-center justify-center">
                <DropdownMenuItemIndicator>
                  <CheckIcon />
                </DropdownMenuItemIndicator>
              </span>
              {icon}
              {label}
            </DropdownMenuRadioItem>
          ))}
        </ToolbarMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
