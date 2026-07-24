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
} from '@/registry/components/editor/transforms';

import { ToolbarButton, ToolbarMenuGroup } from './toolbar';

const ACTION_THREE_COLUMNS = 'action_three_columns';

function getTurnIntoLabel(value: string) {
  switch (value) {
    case KEYS.ul:
      return 'Bulleted list';
    case KEYS.ol:
      return 'Numbered list';
    case KEYS.listTodo:
      return 'To-do list';
    case KEYS.h1:
      return 'Heading 1';
    case KEYS.h2:
      return 'Heading 2';
    case KEYS.h3:
      return 'Heading 3';
    case KEYS.h4:
      return 'Heading 4';
    case KEYS.h5:
      return 'Heading 5';
    case KEYS.h6:
      return 'Heading 6';
    case KEYS.toggle:
      return 'Toggle list';
    case KEYS.codeBlock:
      return 'Code';
    case KEYS.codeDrawing:
      return 'Code Drawing';
    case KEYS.blockquote:
      return 'Quote';
    case ACTION_THREE_COLUMNS:
      return '3 columns';
    default:
      return 'Text';
  }
}

function TurnIntoMenuItem({
  children,
  icon,
  value,
}: React.PropsWithChildren<{
  icon: React.ReactNode;
  value: string;
}>) {
  return (
    <DropdownMenuRadioItem
      className="min-w-[180px] pl-2 *:first:[span]:hidden"
      value={value}
    >
      <span className="pointer-events-none absolute right-2 flex size-3.5 items-center justify-center">
        <DropdownMenuItemIndicator>
          <CheckIcon />
        </DropdownMenuItemIndicator>
      </span>
      {icon}
      {children}
    </DropdownMenuRadioItem>
  );
}

export function TurnIntoToolbarButton(props: DropdownMenuProps) {
  const editor = useEditor();
  const [open, setOpen] = React.useState(false);
  const selectedValue = String(
    useSelectionFragmentProp({
      defaultValue: KEYS.p,
      getProp: (node) => getBlockType(node as Element),
    }) ?? KEYS.p
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
          {getTurnIntoLabel(selectedValue)}
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="ignore-click-outside/toolbar min-w-0"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
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
          <TurnIntoMenuItem icon={<PilcrowIcon />} value={KEYS.p}>
            Text
          </TurnIntoMenuItem>
          <TurnIntoMenuItem icon={<Heading1Icon />} value={KEYS.h1}>
            Heading 1
          </TurnIntoMenuItem>
          <TurnIntoMenuItem icon={<Heading2Icon />} value={KEYS.h2}>
            Heading 2
          </TurnIntoMenuItem>
          <TurnIntoMenuItem icon={<Heading3Icon />} value={KEYS.h3}>
            Heading 3
          </TurnIntoMenuItem>
          <TurnIntoMenuItem icon={<Heading4Icon />} value={KEYS.h4}>
            Heading 4
          </TurnIntoMenuItem>
          <TurnIntoMenuItem icon={<Heading5Icon />} value={KEYS.h5}>
            Heading 5
          </TurnIntoMenuItem>
          <TurnIntoMenuItem icon={<Heading6Icon />} value={KEYS.h6}>
            Heading 6
          </TurnIntoMenuItem>
          <TurnIntoMenuItem icon={<ListIcon />} value={KEYS.ul}>
            Bulleted list
          </TurnIntoMenuItem>
          <TurnIntoMenuItem icon={<ListOrderedIcon />} value={KEYS.ol}>
            Numbered list
          </TurnIntoMenuItem>
          <TurnIntoMenuItem icon={<SquareIcon />} value={KEYS.listTodo}>
            To-do list
          </TurnIntoMenuItem>
          <TurnIntoMenuItem icon={<ChevronRightIcon />} value={KEYS.toggle}>
            Toggle list
          </TurnIntoMenuItem>
          <TurnIntoMenuItem icon={<FileCodeIcon />} value={KEYS.codeBlock}>
            Code
          </TurnIntoMenuItem>
          <TurnIntoMenuItem icon={<Code2Icon />} value={KEYS.codeDrawing}>
            Code Drawing
          </TurnIntoMenuItem>
          <TurnIntoMenuItem icon={<QuoteIcon />} value={KEYS.blockquote}>
            Quote
          </TurnIntoMenuItem>
          <TurnIntoMenuItem
            icon={<Columns3Icon />}
            value={ACTION_THREE_COLUMNS}
          >
            3 columns
          </TurnIntoMenuItem>
        </ToolbarMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
