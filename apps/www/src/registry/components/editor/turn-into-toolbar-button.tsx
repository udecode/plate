'use client';
import { ElementApi } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';
import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
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
import { useEditor, useSelectionFragmentProp } from 'platejs/react';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  getBlockType,
  applyBlockAction,
} from '@/registry/components/editor/transforms';

import { ToolbarButton, ToolbarMenuGroup } from './toolbar';

const ACTION_THREE_COLUMNS = 'action_three_columns';

function getTurnIntoLabel(value: string) {
  switch (value) {
    case 'disc': {
      return 'Bulleted list';
    }
    case 'decimal': {
      return 'Numbered list';
    }
    case 'todo': {
      return 'To-do list';
    }
    case 'heading-1': {
      return 'Heading 1';
    }
    case 'heading-2': {
      return 'Heading 2';
    }
    case 'heading-3': {
      return 'Heading 3';
    }
    case 'heading-4': {
      return 'Heading 4';
    }
    case 'heading-5': {
      return 'Heading 5';
    }
    case 'heading-6': {
      return 'Heading 6';
    }
    case PLUGINS.toggle: {
      return 'Toggle list';
    }
    case PLUGINS.codeBlock: {
      return 'Code';
    }
    case PLUGINS.codeDrawing: {
      return 'Code Drawing';
    }
    case PLUGINS.blockquote: {
      return 'Quote';
    }
    case ACTION_THREE_COLUMNS: {
      return '3 columns';
    }
    default: {
      return 'Text';
    }
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
  const documentValue = useSelectionFragmentProp({
    defaultValue: editor.plugin(PLUGINS.paragraph).schema.type,
    getProp: (node) =>
      ElementApi.isElement(node) ? getBlockType(node) : undefined,
  });
  const selectedDocumentValue =
    typeof documentValue === 'string' ? documentValue : PLUGINS.paragraph;
  const selectedValue =
    [
      PLUGINS.paragraph,
      'heading-1',
      'heading-2',
      'heading-3',
      'heading-4',
      'heading-5',
      'heading-6',
      PLUGINS.toggle,
      PLUGINS.codeBlock,
      PLUGINS.codeDrawing,
      PLUGINS.blockquote,
    ].find((name) => name === selectedDocumentValue) ?? selectedDocumentValue;

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
        <DropdownMenuRadioGroup
          value={selectedValue}
          onValueChange={(action) => {
            applyBlockAction(editor, action);
          }}
        >
          <ToolbarMenuGroup label="Turn into">
            <TurnIntoMenuItem icon={<PilcrowIcon />} value={PLUGINS.paragraph}>
              Text
            </TurnIntoMenuItem>
            <TurnIntoMenuItem icon={<Heading1Icon />} value="heading-1">
              Heading 1
            </TurnIntoMenuItem>
            <TurnIntoMenuItem icon={<Heading2Icon />} value="heading-2">
              Heading 2
            </TurnIntoMenuItem>
            <TurnIntoMenuItem icon={<Heading3Icon />} value="heading-3">
              Heading 3
            </TurnIntoMenuItem>
            <TurnIntoMenuItem icon={<Heading4Icon />} value="heading-4">
              Heading 4
            </TurnIntoMenuItem>
            <TurnIntoMenuItem icon={<Heading5Icon />} value="heading-5">
              Heading 5
            </TurnIntoMenuItem>
            <TurnIntoMenuItem icon={<Heading6Icon />} value="heading-6">
              Heading 6
            </TurnIntoMenuItem>
            <TurnIntoMenuItem icon={<ListIcon />} value="disc">
              Bulleted list
            </TurnIntoMenuItem>
            <TurnIntoMenuItem icon={<ListOrderedIcon />} value="decimal">
              Numbered list
            </TurnIntoMenuItem>
            <TurnIntoMenuItem icon={<SquareIcon />} value="todo">
              To-do list
            </TurnIntoMenuItem>
            <TurnIntoMenuItem
              icon={<ChevronRightIcon />}
              value={PLUGINS.toggle}
            >
              Toggle list
            </TurnIntoMenuItem>
            <TurnIntoMenuItem icon={<FileCodeIcon />} value={PLUGINS.codeBlock}>
              Code
            </TurnIntoMenuItem>
            <TurnIntoMenuItem icon={<Code2Icon />} value={PLUGINS.codeDrawing}>
              Code Drawing
            </TurnIntoMenuItem>
            <TurnIntoMenuItem icon={<QuoteIcon />} value={PLUGINS.blockquote}>
              Quote
            </TurnIntoMenuItem>
            <TurnIntoMenuItem
              icon={<Columns3Icon />}
              value={ACTION_THREE_COLUMNS}
            >
              3 columns
            </TurnIntoMenuItem>
          </ToolbarMenuGroup>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
