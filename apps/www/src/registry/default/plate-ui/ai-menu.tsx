import * as React from 'react';

import { AIChatPlugin, useEditorChat } from '@udecode/plate-ai/react';
import {
  toDOMNode,
  useEditorPlugin,
  useHotkeys,
} from '@udecode/plate-common/react';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';
import { type TElement, type TNodeEntry, isElementEmpty } from '@udecode/slate';
import {
  getAncestorNode,
  getBlocks,
  isSelectionAtBlockEnd,
} from '@udecode/slate-utils';
import { useChat } from 'ai/react';
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
} from 'lucide-react';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './command';
import { Popover, PopoverAnchor, PopoverContent } from './popover';

export function AIMenu() {
  const { api, editor, useOption } = useEditorPlugin(AIChatPlugin);
  const open = useOption('open');

  const chat = useChat({
    id: 'editor',
    api: 'https://pro.platejs.org/api/ai/command',
  });
  const { input, isLoading, messages, setInput } = chat;
  const [anchorElement, setAnchorElement] = React.useState<HTMLElement | null>(
    null
  );

  const setOpen = (open: boolean) => {
    if (open) {
      api.aiChat.show();
    } else {
      api.aiChat.hide();
    }
  };

  const show = (anchorElement: HTMLElement) => {
    setAnchorElement(anchorElement);
    setOpen(true);
  };

  useEditorChat({
    chat,
    onOpenBlockSelection: (blocks: TNodeEntry[]) => {
      show(toDOMNode(editor, blocks.at(-1)![0])!);
    },
    onOpenChange: (open) => {
      if (!open) {
        setAnchorElement(null);
        setInput('');
      }
    },
    onOpenCursor: () => {
      const ancestor = getAncestorNode(editor)?.[0] as TElement;

      if (!isSelectionAtBlockEnd(editor) && !isElementEmpty(editor, ancestor)) {
        editor
          .getApi(BlockSelectionPlugin)
          .blockSelection.addSelectedRow(ancestor.id as string);
      }

      show(toDOMNode(editor, ancestor)!);
    },
    onOpenSelection: () => {
      show(toDOMNode(editor, getBlocks(editor).at(-1)![0])!);
    },
  });

  useHotkeys(
    'meta+j',
    () => {
      api.aiChat.show();
    },
    { enableOnContentEditable: true, enableOnFormTags: true }
  );

  useHotkeys('escape', () => {
    if (isLoading) {
      api.aiChat.stop();
    } else {
      api.aiChat.hide();
    }
  });

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverAnchor virtualRef={{ current: anchorElement }} />

      <PopoverContent
        className="w-[200px] bg-popover p-0"
        align="start"
        avoidCollisions={false}
        contentEditable={false}
        side="bottom"
      >
        <Command className="rounded-lg border shadow-md md:min-w-[450px]">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>
                <Calendar className="mr-2 size-4" />
                <span>Calendar</span>
              </CommandItem>
              <CommandItem>
                <Smile className="mr-2 size-4" />
                <span>Search Emoji</span>
              </CommandItem>
              <CommandItem disabled>
                <Calculator className="mr-2 size-4" />
                <span>Calculator</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem>
                <User className="mr-2 size-4" />
                <span>Profile</span>
                <CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <CreditCard className="mr-2 size-4" />
                <span>Billing</span>
                <CommandShortcut>⌘B</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <Settings className="mr-2 size-4" />
                <span>Settings</span>
                <CommandShortcut>⌘S</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
