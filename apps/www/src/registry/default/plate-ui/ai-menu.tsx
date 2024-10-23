import * as React from 'react';

import {
  type NodeWrapperComponent,
  useEditorPlugin,
  useElement,
} from '@udecode/plate-common/react';

export const renderAIAboveNodes: NodeWrapperComponent<any> = () => AIPopover;

import { AIChatPlugin, useEditorChat } from '@udecode/plate-ai/react';
import { getAncestorNode } from '@udecode/plate-common';
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from 'cmdk';
import {
  Calculator,
  Calendar,
  Command,
  CreditCard,
  Settings,
  Smile,
  User,
} from 'lucide-react';

import { CommandShortcut } from './command';
import { Popover, PopoverAnchor, PopoverContent } from './popover';

const AIPopover = ({ children, element }: { children: React.ReactNode, element: any }) => {
  const { api, editor, useOption } = useEditorPlugin(AIChatPlugin);
  const isOpen = useOption('open');
  console.log("🚀 ~ AIPopover ~ isOpen:", isOpen)


  // const chat = useChat({
  //   id: 'editor',
  //   api: '/api/ai/command',
  // });
  // const { input, isLoading, messages, setInput } = chat;


  // useEditorChat({
  //   chat,
  //   onOpenBlockSelection: (blocks: TNodeEntry[]) => {
  //   },
  //   onOpenChange: (open) => {
  //   },
  //   onOpenCursor: () => {
  //   },
  //   onOpenSelection: () => {
  //   },
  // });


  const anchorId = React.useMemo(() => {
    if (!isOpen) return null;

    const ancestorNode = getAncestorNode(editor)!;
    // console.log('🚀 ~ anchorId ~ ancestorNode:', ancestorNode);

    return ancestorNode?.[0]?.id;
  }, [editor, isOpen]);

  console.log('🚀 ~ anchorId:', anchorId);

  if (anchorId !== element.id) return children;

  return (
    <Popover open={isOpen} modal={false}>
      <PopoverAnchor>{children}</PopoverAnchor>
      <PopoverContent
        className="w-[200px] p-0"
        onEscapeKeyDown={() => {
          // api.ai.dismiss();
        }}
        onFocusOutside={() => {
          // api.ai.dismiss();
        }}
        align="start"
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
};
