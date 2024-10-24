import * as React from 'react';

import { AIChatPlugin, useEditorChat } from '@udecode/plate-ai/react';
import {
  type PlateEditor,
  toDOMNode,
  useEditorPlugin,
  useHotkeys,
} from '@udecode/plate-common/react';
import {
  BlockSelectionPlugin,
  useIsSelecting,
} from '@udecode/plate-selection/react';
import { type TElement, type TNodeEntry, isElementEmpty } from '@udecode/slate';
import {
  getAncestorNode,
  getBlocks,
  isSelectionAtBlockEnd,
} from '@udecode/slate-utils';
import { useChat } from 'ai/react';

import { AIChatEditor } from './ai-chat-editor';
import { AIMenuItems } from './ai-menu-items';
import { Command, CommandInput, CommandList } from './command';
import { Popover, PopoverAnchor, PopoverContent } from './popover';

export function AIMenu() {
  const { api, editor, useOption } = useEditorPlugin(AIChatPlugin);
  const open = useOption('open');
  const mode = useOption('mode');
  const isSelecting = useIsSelecting();

  const aiEditorRef = React.useRef<PlateEditor | null>(null);

  const chat = useChat({
    id: 'editor',
    api: 'api/ai',
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
        className="w-fit border-none p-0"
        onEscapeKeyDown={() => {
          api.aiChat.hide();
        }}
        onFocusOutside={() => {
          api.aiChat.hide();
        }}
        align="start"
        avoidCollisions={false}
        contentEditable={false}
        side="bottom"
      >
        <Command className="rounded-lg border shadow-md md:min-w-[450px]">
          {mode === 'chat' && isSelecting && messages.length > 0 && (
            <AIChatEditor aiEditorRef={aiEditorRef} />
          )}

          {isLoading ? (
            <div className="flex grow select-none items-center gap-2 py-2 text-muted-foreground">
              {messages.length > 1 ? 'Editing' : 'Thinking'}
            </div>
          ) : (
            <CommandInput placeholder="Type a command or search..." />
          )}

          {!isLoading && (
            <CommandList>
              <AIMenuItems aiEditorRef={aiEditorRef} />
            </CommandList>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
