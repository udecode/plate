'use client';

import { AIChatPlugin, AIPlugin } from '@platejs/ai/react';
import { CommentPlugin } from '@platejs/comment/react';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { SuggestionPlugin } from '@platejs/suggestion/react';
import { Command as CommandPrimitive } from 'cmdk';
import {
  Album,
  BadgeHelp,
  BookOpenCheck,
  Check,
  CornerUpLeft,
  FeatherIcon,
  ListEnd,
  ListMinus,
  ListPlus,
  Loader2Icon,
  PauseIcon,
  PenLine,
  SmileIcon,
  Wand,
  X,
} from 'lucide-react';
import { ElementApi, isHotkey, NodeApi } from 'platejs';
import {
  useEditorPlugin,
  useEditorRuntimeState,
  usePlateEditor,
  useEditorSelector,
  useFocusedLast,
  useHotkeys,
  usePluginStore,
  type PlateEditor,
  useEditor,
} from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { BaseEditorKit } from '@/registry/components/editor/plugins-static';

import { EditorStatic } from './editor-static';

export const AIChatEditor = React.memo(({ content }: { content: string }) => {
  const aiEditor = usePlateEditor({
    plugins: BaseEditorKit,
  });
  const { store } = useEditorPlugin(AIChatPlugin);
  const document = React.useMemo(
    () => aiEditor.api.markdown.deserialize(content),
    [aiEditor, content]
  );

  useEditorRuntimeState(aiEditor, (state) => state.children());

  React.useEffect(() => {
    aiEditor.update({ history: 'skip' }).value.replace(document);
    store.set({ previewValue: aiEditor.read.children() });
  }, [aiEditor, document, store]);

  return <EditorStatic variant="aiChat" editor={aiEditor} />;
});

AIChatEditor.displayName = 'AIChatEditor';

export function AIMenu() {
  const editor = useEditor();
  const { api, read } = useEditorPlugin(AIChatPlugin);
  const mode = usePluginStore(AIChatPlugin, 'mode');
  const toolName = usePluginStore(AIChatPlugin, 'toolName');

  const streaming = usePluginStore(AIChatPlugin, 'streaming');
  const isSelectingSome = usePluginStore(
    BlockSelectionPlugin,
    'isSelectingSome'
  );
  const selectionExpanded = useEditorSelector((innerEditor) =>
    innerEditor.read.selection.isExpanded()
  );
  const isSelecting = selectionExpanded || isSelectingSome;
  const isFocusedLast = useFocusedLast();
  const chatOpen = usePluginStore(AIChatPlugin, 'open');
  const open = chatOpen && isFocusedLast;
  const [value, setValue] = React.useState('');

  const [input, setInput] = React.useState('');

  const chat = usePluginStore(AIChatPlugin, 'chat');
  const lastAssistantMessage = usePluginStore(
    AIChatPlugin,
    'lastAssistantMessage'
  );

  const messages = chat?.messages;
  const status = chat?.status ?? 'ready';
  const [anchorElement, setAnchorElement] = React.useState<HTMLElement | null>(
    null
  );

  const content = lastAssistantMessage?.parts.find(
    (part) => part.type === 'text'
  )?.text;

  React.useEffect(() => {
    if (!streaming) return undefined;

    const anchorEntry = read.node({ anchor: true });
    if (!anchorEntry) return undefined;

    const anchorDom = editor.api.dom.resolveDOMNode(anchorEntry[0]);
    if (!anchorDom) return undefined;
    const animationFrame = window.requestAnimationFrame(() => {
      setAnchorElement(anchorDom);
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [editor, read, streaming]);

  const setOpen = (innerOpen: boolean) => {
    if (innerOpen) {
      api.show();
    } else {
      api.hide();
    }
  };

  React.useEffect(() => {
    if (!chatOpen) {
      const animationFrame = window.requestAnimationFrame(() => {
        setAnchorElement(null);
        setInput('');
      });

      return () => {
        window.cancelAnimationFrame(animationFrame);
      };
    }

    const blockSelection = editor.plugin(BlockSelectionPlugin);
    let nextAnchor: HTMLElement | null = null;

    if (blockSelection.store.get('isSelectingSome')) {
      const block = blockSelection.read.getNodes({}).at(-1);

      if (!block || !ElementApi.isElement(block[0])) return undefined;

      nextAnchor = editor.api.dom.resolveDOMNode(block[0]);
    } else if (editor.read.selection.isCollapsed()) {
      const ancestorEntry = editor.read.nodes.block();

      if (!ancestorEntry) return undefined;

      const [ancestor] = ancestorEntry;

      if (
        !editor.read.selection.isAtBlockEnd() &&
        ElementApi.isElement(ancestor) &&
        !editor.read.nodes.isEmpty(ancestor)
      ) {
        editor.plugin(BlockSelectionPlugin).api.set(editor.key(ancestor));
      }

      nextAnchor = editor.api.dom.resolveDOMNode(ancestor);
    } else if (editor.read.selection.isExpanded()) {
      const block = editor
        .read((state) =>
          state.nodes.toArray({
            match: (node) =>
              ElementApi.isElement(node) && state.schema.isBlock(node),
          })
        )
        .at(-1);
      nextAnchor = block ? editor.api.dom.resolveDOMNode(block[0]) : null;
    }

    if (!nextAnchor) return undefined;
    const animationFrame = window.requestAnimationFrame(() => {
      setAnchorElement(nextAnchor);
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [chatOpen, editor]);

  useHotkeys('esc', () => {
    api.stop();
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  React.useEffect(() => {
    if (toolName !== 'edit' || mode !== 'chat' || isLoading) return undefined;

    let anchorNode = editor
      .plugin(SuggestionPlugin)
      .read.nodes({ transient: true })
      .at(-1);

    if (!anchorNode) {
      anchorNode = editor
        .plugin(BlockSelectionPlugin)
        .read.getNodes({ selectionFallback: true, sort: true })
        .at(-1);
    }

    if (!anchorNode) return undefined;

    const block = editor.read.nodes.block({ at: anchorNode[1] });
    const domNode = block ? editor.api.dom.resolveDOMNode(block[0]) : null;

    if (!domNode) return undefined;

    const animationFrame = window.requestAnimationFrame(() => {
      setAnchorElement(domNode);
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [editor, isLoading, mode, toolName]);

  if (isLoading && mode === 'insert') return null;

  if (toolName === 'comment') return null;

  if (toolName === 'edit' && mode === 'chat' && isLoading) return null;

  if (!anchorElement) return null;

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

          api.hide();
        }}
        align="center"
        side="bottom"
      >
        <Command
          className="w-full rounded-lg border shadow-md"
          value={value}
          onValueChange={setValue}
        >
          {mode === 'chat' &&
            isSelecting &&
            content &&
            toolName === 'generate' && <AIChatEditor content={content} />}

          {isLoading ? (
            <div className="flex grow items-center gap-2 p-2 text-sm text-muted-foreground select-none">
              <Loader2Icon className="size-4 animate-spin" />
              {(messages?.length ?? 0) > 1 ? 'Editing...' : 'Thinking...'}
            </div>
          ) : (
            <CommandPrimitive.Input
              className={cn(
                'flex h-9 w-full min-w-0 border-input bg-transparent px-3 py-1 text-base outline-none transition-[color,box-shadow] placeholder:text-muted-foreground md:text-sm dark:bg-input/30',
                'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
                'border-b focus-visible:ring-transparent'
              )}
              value={input}
              onKeyDown={(e) => {
                if (isHotkey('backspace')(e) && input.length === 0) {
                  e.preventDefault();
                  api.hide();
                }
                if (isHotkey('enter')(e) && !e.shiftKey && !value) {
                  e.preventDefault();
                  api.submit(input);
                  setInput('');
                }
              }}
              onValueChange={setInput}
              placeholder="Ask AI anything..."
              data-plate-focus
              autoFocus
            />
          )}

          {!isLoading && (
            <CommandList>
              <AIMenuItems
                input={input}
                setInput={setInput}
                setValue={setValue}
              />
            </CommandList>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}

type EditorChatState =
  | 'cursorCommand'
  | 'cursorSuggestion'
  | 'selectionCommand'
  | 'selectionSuggestion';

const AICommentIcon = () => (
  <svg
    fill="none"
    height="24"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M0 0h24v24H0z" fill="none" stroke="none" />
    <path d="M8 9h8" />
    <path d="M8 13h4.5" />
    <path d="M10 19l-1 -1h-3a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v4.5" />
    <path d="M17.8 20.817l-2.172 1.138a.392 .392 0 0 1 -.568 -.41l.415 -2.411l-1.757 -1.707a.389 .389 0 0 1 .217 -.665l2.428 -.352l1.086 -2.193a.392 .392 0 0 1 .702 0l1.086 2.193l2.428 .352a.39 .39 0 0 1 .217 .665l-1.757 1.707l.414 2.41a.39 .39 0 0 1 -.567 .411l-2.172 -1.138z" />
  </svg>
);

const aiChatItems = {
  accept: {
    icon: <Check />,
    label: 'Accept',
    value: 'accept',
    onSelect: ({ editor }) => {
      const { mode, toolName } = editor.plugin(AIChatPlugin).store.get();

      if (mode === 'chat' && toolName === 'generate') {
        editor.plugin(AIChatPlugin).update.replaceSelection();
        return;
      }

      editor.plugin(AIChatPlugin).update.accept();
      editor.update((tx) => {
        const end = tx.points.end([]);

        if (!end) return;

        tx.selection.set({ anchor: end, focus: end });
      });
      editor.api.dom.focus({ retries: 5 });
    },
  },
  comment: {
    icon: <AICommentIcon />,
    label: 'Comment',
    value: 'comment',
    onSelect: ({ editor, input }) => {
      editor.plugin(AIChatPlugin).api.submit(input, {
        mode: 'insert',
        prompt:
          'Please comment on the following content and provide reasonable and meaningful feedback.',
        toolName: 'comment',
      });
    },
  },
  continueWrite: {
    icon: <PenLine />,
    label: 'Continue writing',
    value: 'continueWrite',
    onSelect: ({ editor, input }) => {
      const ancestorNode = editor.read.nodes.block();

      if (!ancestorNode) return;

      const isEmpty = NodeApi.string(ancestorNode[0]).trim().length === 0;

      editor.plugin(AIChatPlugin).api.submit(input, {
        mode: 'insert',
        prompt: isEmpty
          ? `<Document>
{editor}
</Document>
Start writing a new paragraph AFTER <Document> ONLY ONE SENTENCE`
          : 'Continue writing AFTER <Block> ONLY ONE SENTENCE. DONT REPEAT THE TEXT.',
        toolName: 'generate',
      });
    },
  },
  discard: {
    icon: <X />,
    label: 'Discard',
    shortcut: 'Escape',
    value: 'discard',
    onSelect: ({ editor }) => {
      editor.plugin(AIPlugin).update.undo();
      editor.plugin(AIChatPlugin).api.hide();
    },
  },
  emojify: {
    icon: <SmileIcon />,
    label: 'Emojify',
    value: 'emojify',
    onSelect: ({ editor, input }) => {
      editor.plugin(AIChatPlugin).api.submit(input, {
        prompt:
          'Add a small number of contextually relevant emojis within each block only. You may insert emojis, but do not remove, replace, or rewrite existing text, and do not modify Markdown syntax, links, or line breaks.',
        toolName: 'edit',
      });
    },
  },
  explain: {
    icon: <BadgeHelp />,
    label: 'Explain',
    value: 'explain',
    onSelect: ({ editor, input }) => {
      editor.plugin(AIChatPlugin).api.submit(input, {
        prompt: {
          default: 'Explain {editor}',
          selecting: 'Explain',
        },
        toolName: 'generate',
      });
    },
  },
  fixSpelling: {
    icon: <Check />,
    label: 'Fix spelling & grammar',
    value: 'fixSpelling',
    onSelect: ({ editor, input }) => {
      editor.plugin(AIChatPlugin).api.submit(input, {
        prompt:
          'Fix spelling, grammar, and punctuation errors within each block only, without changing meaning, tone, or adding new information.',
        toolName: 'edit',
      });
    },
  },
  generateMarkdownSample: {
    icon: <BookOpenCheck />,
    label: 'Generate Markdown sample',
    value: 'generateMarkdownSample',
    onSelect: ({ editor, input }) => {
      editor.plugin(AIChatPlugin).api.submit(input, {
        prompt: 'Generate a markdown sample',
        toolName: 'generate',
      });
    },
  },
  generateMdxSample: {
    icon: <BookOpenCheck />,
    label: 'Generate MDX sample',
    value: 'generateMdxSample',
    onSelect: ({ editor, input }) => {
      editor.plugin(AIChatPlugin).api.submit(input, {
        prompt: 'Generate a mdx sample',
        toolName: 'generate',
      });
    },
  },
  improveWriting: {
    icon: <Wand />,
    label: 'Improve writing',
    value: 'improveWriting',
    onSelect: ({ editor, input }) => {
      editor.plugin(AIChatPlugin).api.submit(input, {
        prompt:
          'Improve the writing for clarity and flow, without changing meaning or adding new information.',
        toolName: 'edit',
      });
    },
  },
  insertBelow: {
    icon: <ListEnd />,
    label: 'Insert below',
    value: 'insertBelow',
    onSelect: ({ editor }) => {
      /** Format: 'none' Fix insert table */
      editor.plugin(AIChatPlugin).update.insertBelow({ format: 'none' });
    },
  },
  makeLonger: {
    icon: <ListPlus />,
    label: 'Make longer',
    value: 'makeLonger',
    onSelect: ({ editor, input }) => {
      editor.plugin(AIChatPlugin).api.submit(input, {
        prompt:
          'Make the content longer by elaborating on existing ideas within each block only, without changing meaning or adding new information.',
        toolName: 'edit',
      });
    },
  },
  makeShorter: {
    icon: <ListMinus />,
    label: 'Make shorter',
    value: 'makeShorter',
    onSelect: ({ editor, input }) => {
      editor.plugin(AIChatPlugin).api.submit(input, {
        prompt:
          'Make the content shorter by reducing verbosity within each block only, without changing meaning or removing essential information.',
        toolName: 'edit',
      });
    },
  },
  replace: {
    icon: <Check />,
    label: 'Replace selection',
    value: 'replace',
    onSelect: ({ editor }) => {
      editor.plugin(AIChatPlugin).update.replaceSelection();
    },
  },
  simplifyLanguage: {
    icon: <FeatherIcon />,
    label: 'Simplify language',
    value: 'simplifyLanguage',
    onSelect: ({ editor, input }) => {
      editor.plugin(AIChatPlugin).api.submit(input, {
        prompt:
          'Simplify the language by using clearer and more straightforward wording within each block only, without changing meaning or adding new information.',
        toolName: 'edit',
      });
    },
  },
  summarize: {
    icon: <Album />,
    label: 'Add a summary',
    value: 'summarize',
    onSelect: ({ editor, input }) => {
      editor.plugin(AIChatPlugin).api.submit(input, {
        mode: 'insert',
        prompt: {
          default: 'Summarize {editor}',
          selecting: 'Summarize',
        },
        toolName: 'generate',
      });
    },
  },
  tryAgain: {
    icon: <CornerUpLeft />,
    label: 'Try again',
    value: 'tryAgain',
    onSelect: ({ editor }) => {
      editor.plugin(AIChatPlugin).api.reload();
    },
  },
} satisfies Record<
  string,
  {
    icon: React.ReactNode;
    label: string;
    value: string;
    component?: React.ComponentType<{ menuState: EditorChatState }>;
    filterItems?: boolean;
    items?: Array<{ label: string; value: string }>;
    shortcut?: string;
    onSelect?: ({
      editor,
      input,
    }: {
      editor: PlateEditor;
      input: string;
    }) => void;
  }
>;

const menuStateItems: Record<
  EditorChatState,
  Array<{
    items: Array<(typeof aiChatItems)[keyof typeof aiChatItems]>;
    heading?: string;
  }>
> = {
  cursorCommand: [
    {
      items: [
        aiChatItems.comment,
        aiChatItems.generateMdxSample,
        aiChatItems.generateMarkdownSample,
        aiChatItems.continueWrite,
        aiChatItems.summarize,
        aiChatItems.explain,
      ],
    },
  ],
  cursorSuggestion: [
    {
      items: [aiChatItems.accept, aiChatItems.discard, aiChatItems.tryAgain],
    },
  ],
  selectionCommand: [
    {
      items: [
        aiChatItems.improveWriting,
        aiChatItems.comment,
        aiChatItems.emojify,
        aiChatItems.makeLonger,
        aiChatItems.makeShorter,
        aiChatItems.fixSpelling,
        aiChatItems.simplifyLanguage,
      ],
    },
  ],
  selectionSuggestion: [
    {
      items: [
        aiChatItems.accept,
        aiChatItems.discard,
        aiChatItems.insertBelow,
        aiChatItems.tryAgain,
      ],
    },
  ],
};

export const AIMenuItems = ({
  input,
  setInput,
  setValue,
}: {
  input: string;
  setInput: (value: string) => void;
  setValue: (value: string) => void;
}) => {
  const editor = useEditor();
  const messages = usePluginStore(AIChatPlugin, 'chat')?.messages;
  const isSelectingSome = usePluginStore(
    BlockSelectionPlugin,
    'isSelectingSome'
  );
  const selectionExpanded = useEditorSelector((innerEditor2) =>
    innerEditor2.read.selection.isExpanded()
  );
  const isSelecting = selectionExpanded || isSelectingSome;

  const menuState: EditorChatState =
    (messages?.length ?? 0) > 0
      ? isSelecting
        ? 'selectionSuggestion'
        : 'cursorSuggestion'
      : isSelecting
        ? 'selectionCommand'
        : 'cursorCommand';
  const menuGroups = menuStateItems[menuState];

  React.useEffect(() => {
    const firstItem = menuStateItems[menuState][0]?.items[0];

    if (firstItem) {
      setValue(firstItem.value);
    }
  }, [menuState, setValue]);

  return (
    <>
      {menuGroups.map((group) => (
        <CommandGroup
          key={group.heading ?? group.items[0]?.value}
          heading={group.heading}
        >
          {group.items.map((menuItem) => (
            <CommandItem
              key={menuItem.value}
              className="[&_svg]:text-muted-foreground"
              value={menuItem.value}
              onSelect={() => {
                menuItem.onSelect?.({ editor, input });
                setInput('');
              }}
            >
              {menuItem.icon}
              <span>{menuItem.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      ))}
    </>
  );
};

export function AILoadingBar() {
  const editor = useEditor();

  const toolName = usePluginStore(AIChatPlugin, 'toolName');
  const chat = usePluginStore(AIChatPlugin, 'chat');
  const mode = usePluginStore(AIChatPlugin, 'mode');

  const status = chat?.status ?? 'ready';

  const { api } = useEditorPlugin(AIChatPlugin);

  const isLoading = status === 'streaming' || status === 'submitted';

  const handleComments = (type: 'accept' | 'reject') => {
    if (type === 'accept') {
      editor.plugin(CommentPlugin).update.clearTransient();
    }

    if (type === 'reject') {
      editor.plugin(CommentPlugin).update.unsetMark({ transient: true });
    }

    api.hide();
  };

  useHotkeys('esc', () => {
    api.stop();
  });

  if (
    isLoading &&
    (mode === 'insert' ||
      toolName === 'comment' ||
      (toolName === 'edit' && mode === 'chat'))
  ) {
    return (
      <div
        className={cn(
          '-translate-x-1/2 absolute bottom-4 left-1/2 z-20 flex items-center gap-3 rounded-md border border-border bg-muted px-3 py-1.5 text-muted-foreground text-sm shadow-md transition-all duration-300'
        )}
      >
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        <span>{status === 'submitted' ? 'Thinking...' : 'Writing...'}</span>
        <Button
          size="sm"
          variant="ghost"
          className="flex items-center gap-1 text-xs"
          onClick={() => {
            api.stop();
          }}
        >
          <PauseIcon className="h-4 w-4" />
          Stop
          <kbd className="ml-1 rounded bg-border px-1 font-mono text-[10px] text-muted-foreground shadow-sm">
            Esc
          </kbd>
        </Button>
      </div>
    );
  }

  if (toolName === 'comment' && status === 'ready') {
    return (
      <div
        className={cn(
          '-translate-x-1/2 absolute bottom-4 left-1/2 z-50 flex flex-col items-center gap-0 rounded-xl border border-border/50 bg-popover p-1 text-muted-foreground text-sm shadow-xl backdrop-blur-sm',
          'p-3'
        )}
      >
        {/* Header with controls */}
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex items-center gap-5">
            <Button
              size="sm"
              disabled={isLoading}
              onClick={() => {
                handleComments('accept');
              }}
            >
              Accept
            </Button>

            <Button
              size="sm"
              disabled={isLoading}
              onClick={() => {
                handleComments('reject');
              }}
            >
              Reject
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
