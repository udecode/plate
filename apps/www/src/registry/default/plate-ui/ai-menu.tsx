import * as React from 'react';

import { faker } from '@faker-js/faker';
import { AIChatPlugin, useEditorChat } from '@udecode/plate-ai/react';
import {
  type TElement,
  type TNodeEntry,
  getAncestorNode,
  getBlocks,
  isElementEmpty,
  isHotkey,
  isSelectionAtBlockEnd,
} from '@udecode/plate-common';
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
import { useChat } from 'ai/react';
import { Loader2Icon } from 'lucide-react';

import { AIChatEditor } from './ai-chat-editor';
import { AIMenuItems } from './ai-menu-items';
import { Command, CommandList, InputCommand } from './command';
import { Popover, PopoverAnchor, PopoverContent } from './popover';

export function AIMenu() {
  const { api, editor, useOption } = useEditorPlugin(AIChatPlugin);
  const open = useOption('open');
  const mode = useOption('mode');
  const isSelecting = useIsSelecting();

  const aiEditorRef = React.useRef<PlateEditor | null>(null);
  const [value, setValue] = React.useState('');

  const chat = useChat({
    id: 'editor',
    // API to be implemented
    api: '/api/ai',
    // Mock the API response. Remove it when you implement the route /api/ai
    fetch: async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));

      const stream = fakeStreamText();

      return new Response(stream, {
        headers: {
          Connection: 'keep-alive',
          'Content-Type': 'text/plain',
        },
      });
    },
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

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverAnchor virtualRef={{ current: anchorElement }} />

      <PopoverContent
        className="border-none bg-transparent p-0 shadow-none"
        style={{
          width: anchorElement?.offsetWidth,
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();

          if (isLoading) {
            api.aiChat.stop();
          } else {
            api.aiChat.hide();
          }
        }}
        align="center"
        avoidCollisions={false}
        side="bottom"
      >
        <Command
          className="w-full rounded-lg border shadow-md"
          value={value}
          onValueChange={setValue}
        >
          {mode === 'chat' && isSelecting && messages.length > 0 && (
            <AIChatEditor aiEditorRef={aiEditorRef} />
          )}

          {isLoading ? (
            <div className="flex grow select-none items-center gap-2 p-2 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" />
              {messages.length > 1 ? 'Editing...' : 'Thinking...'}
            </div>
          ) : (
            <InputCommand
              variant="ghost"
              className="rounded-none border-b border-solid border-border [&_svg]:hidden"
              value={input}
              onKeyDown={(e) => {
                if (isHotkey('backspace')(e) && input.length === 0) {
                  e.preventDefault();
                  api.aiChat.hide();
                }
                if (isHotkey('enter')(e) && !e.shiftKey && !value) {
                  e.preventDefault();
                  void api.aiChat.submit();
                }
              }}
              onValueChange={setInput}
              placeholder="Ask AI anything..."
              autoFocus
            />
          )}

          {!isLoading && (
            <CommandList>
              <AIMenuItems aiEditorRef={aiEditorRef} setValue={setValue} />
            </CommandList>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Used for testing. Remove it after implementing useChat api.
const fakeStreamText = ({
  chunkCount = 10,
  streamProtocol = 'data',
}: {
  chunkCount?: number;
  streamProtocol?: 'data' | 'text';
} = {}) => {
  const chunks = Array.from({ length: chunkCount }, () => ({
    delay: faker.number.int({ max: 150, min: 50 }),
    texts: faker.lorem.words({ max: 3, min: 1 }) + ' ',
  }));
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        await new Promise((resolve) => setTimeout(resolve, chunk.delay));

        if (streamProtocol === 'text') {
          controller.enqueue(encoder.encode(chunk.texts));
        } else {
          controller.enqueue(
            encoder.encode(`0:${JSON.stringify(chunk.texts)}\n`)
          );
        }
      }

      if (streamProtocol === 'data') {
        controller.enqueue(
          `d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":${chunks.length}}}\n`
        );
      }

      controller.close();
    },
  });
};
