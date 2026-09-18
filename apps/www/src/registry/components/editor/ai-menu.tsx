'use client';

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
import {
  createEditorView,
  ElementApi,
  isHotkey,
  NodeApi,
  TextApi,
} from 'platejs';
import { BaseAIPlugin } from 'platejs/ai';
import { AIChatPlugin } from 'platejs/ai/react';
import { CommentsPlugin } from 'platejs/comments/react';
import {
  useEditorRuntimeState,
  useCreateEditor,
  useEditorSelector,
  useFocusedLast,
  usePluginStore,
  type Editor,
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
import { cn } from '@/lib/utils';
import {
  FloatingPopover,
  FloatingPopoverAnchor,
  FloatingPopoverContent,
} from '@/registry/components/editor/floating-popover';
import { BaseEditorKit } from '@/registry/components/editor/plugins-static';

import { EditorStatic } from './editor-static';

const PreviewAIPlugin = BaseAIPlugin.extend(({ editor }) => ({
  decorate: {
    read: ({ entry: [node, path] }) => {
      if (!TextApi.isText(node) || node.text.length === 0) return [];

      return [
        {
          key: 'ai-preview',
          range: {
            anchor: { path, offset: 0 },
            focus: { path, offset: node.text.length },
          },
          attributes: {
            className:
              'border-b-2 border-b-purple-100 bg-purple-50 text-purple-800',
            'data-editor-ai-end':
              NodeApi.last(
                { children: editor.read.children(), type: '' },
                []
              )[0] === node
                ? ''
                : undefined,
          },
        },
      ];
    },
  },
}));

const scrollAIPreviewEnd = (editor: Editor, draft: HTMLElement | null) => {
  const scrollElement = editor.api.dom.scroll();
  const target = draft?.querySelector<HTMLElement>('[data-editor-ai-end]');
  if (!scrollElement || !target) return;

  const scrollBounds = scrollElement.getBoundingClientRect();
  const targetBounds = target.getBoundingClientRect();

  scrollElement.scrollTop +=
    targetBounds.top +
    targetBounds.height / 2 -
    (scrollBounds.top + scrollBounds.height / 2);
};

export function AIChatEditor({ inline = false }: { inline?: boolean }) {
  const editor = useEditor();
  const draftRef = React.useRef<HTMLDivElement>(null);
  const aiEditor = useCreateEditor({
    plugins: [...BaseEditorKit, PreviewAIPlugin],
  });
  const document = usePluginStore(AIChatPlugin, 'previewValue');
  const streaming = usePluginStore(AIChatPlugin, 'streaming');

  const preview = useEditorRuntimeState(
    aiEditor,
    React.useCallback(
      () => createEditorView(aiEditor, { readOnly: true }),
      [aiEditor]
    )
  );

  React.useLayoutEffect(() => {
    aiEditor.update({ history: 'skip' }).value.replace({ children: document });
  }, [aiEditor, document]);

  React.useEffect(() => {
    if (!inline) return;

    scrollAIPreviewEnd(editor, draftRef.current);
  }, [editor, inline, preview]);

  React.useEffect(() => {
    const draft = draftRef.current;
    const Observer = draft?.ownerDocument.defaultView?.ResizeObserver;
    if (!inline || !draft || !Observer) return undefined;

    const observer = new Observer(() => scrollAIPreviewEnd(editor, draft));
    observer.observe(draft);

    return () => observer.disconnect();
  }, [editor, inline]);

  const last =
    document.length > 0
      ? NodeApi.last({ children: document, type: '' }, [])[0]
      : null;

  return (
    <div ref={draftRef} data-editor-ai-draft="">
      <EditorStatic
        variant={inline ? 'none' : 'aiChat'}
        editor={preview}
        className={cn(
          streaming &&
            '[&_[data-editor-ai-end]]:after:ml-1.5 [&_[data-editor-ai-end]]:after:inline-block [&_[data-editor-ai-end]]:after:size-3 [&_[data-editor-ai-end]]:after:rounded-full [&_[data-editor-ai-end]]:after:bg-purple-600 [&_[data-editor-ai-end]]:after:align-middle [&_[data-editor-ai-end]]:after:content-[""]'
        )}
      />
      {streaming && (!last || !TextApi.isText(last) || !last.text) && (
        <span
          data-editor-ai-end=""
          className="inline-block size-3 rounded-full bg-purple-600 align-middle"
        />
      )}
    </div>
  );
}

export function AIMenu() {
  const editor = useEditor();
  const { api, read } = useEditor().plugin(AIChatPlugin);
  const mode = usePluginStore(AIChatPlugin, 'mode');
  const toolName = usePluginStore(AIChatPlugin, 'toolName');

  const streaming = usePluginStore(AIChatPlugin, 'streaming');
  const editAnchorKey = useEditorSelector((innerEditor) => {
    const entry = innerEditor.read.selection.nodes().at(-1);

    return entry && ElementApi.isElement(entry[0])
      ? innerEditor.key(entry[0])
      : null;
  });
  const isFocusedLast = useFocusedLast();
  const chatOpen = usePluginStore(AIChatPlugin, 'open');
  const open = chatOpen && isFocusedLast;
  const [value, setValue] = React.useState('');

  const [input, setInput] = React.useState('');

  const chat = usePluginStore(AIChatPlugin, 'chat');
  const previewValue = usePluginStore(AIChatPlugin, 'previewValue');

  const messages = chat?.messages;
  const status = chat?.status ?? 'ready';
  const [anchorElement, setAnchorElement] = React.useState<HTMLElement | null>(
    null
  );

  React.useEffect(() => {
    if (!streaming && previewValue.length === 0) return undefined;

    const anchorEntry = read.node();
    if (!anchorEntry) return undefined;

    const anchorDom = editor.api.dom.resolveDOMNode(anchorEntry[0]);
    if (!anchorDom) return undefined;
    const animationFrame = window.requestAnimationFrame(() => {
      setAnchorElement(
        anchorDom.closest<HTMLElement>('[data-editor-ai-preview-wrapper]') ??
          anchorDom
      );
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [editor, previewValue, read, streaming]);

  const setOpen = (innerOpen: boolean) => {
    if (innerOpen) {
      if (!chatOpen) api.show();
    } else if (chatOpen) {
      api.hide({ focus: false });
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

    let nextAnchor: HTMLElement | null = null;
    const block =
      editor.read.nodes.blocks().at(-1) ?? editor.read.nodes.block();
    if (block && ElementApi.isElement(block[0])) {
      nextAnchor = editor.api.dom.resolveDOMNode(block[0]);
    }

    if (!nextAnchor) return undefined;
    const animationFrame = window.requestAnimationFrame(() => {
      setAnchorElement(nextAnchor);
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [chatOpen, editor]);

  const isLoading = status === 'streaming' || status === 'submitted';

  React.useEffect(() => {
    if (toolName !== 'edit' || mode !== 'chat' || isLoading) return undefined;

    let anchorNode = editAnchorKey
      ? editor.read.nodes.get(editAnchorKey, {
          match: ElementApi.isElement,
        })
      : undefined;

    if (!anchorNode) {
      anchorNode =
        editor.read.nodes.blocks().at(-1) ?? editor.read.nodes.block();
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
  }, [editAnchorKey, editor, isLoading, mode, toolName]);

  if (isLoading && mode === 'insert') return null;

  if (toolName === 'comment') return null;

  if (!anchorElement) return null;

  return (
    <FloatingPopover open={open} onOpenChange={setOpen} modal={false}>
      <FloatingPopoverAnchor element={anchorElement} />

      <FloatingPopoverContent
        className="w-(--floating-popover-anchor-width) max-w-[calc(100vw-16px)] border-none bg-transparent p-0 shadow-none ring-0"
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
          {mode === 'chat' && previewValue.length > 0 && <AIChatEditor />}

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
              data-editor-keep-selection-visible
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
      </FloatingPopoverContent>
    </FloatingPopover>
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
      editor.plugin(AIChatPlugin).api.accept();
      editor.api.dom.focus();
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
          : `<Block>
{block}
</Block>
Continue writing AFTER <Block> with ONLY ONE SENTENCE. DO NOT REPEAT THE TEXT.`,
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
      editor.plugin(AIChatPlugin).api.insertBelow({ format: 'none' });
      editor.api.dom.focus();
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
      editor.plugin(AIChatPlugin).api.replaceSelection();
      editor.api.dom.focus();
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
    onSelect?: ({ editor, input }: { editor: Editor; input: string }) => void;
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
  const comments = editor.plugin(CommentsPlugin);
  const messages = usePluginStore(AIChatPlugin, 'chat')?.messages;
  const mode = usePluginStore(AIChatPlugin, 'mode');
  const isSelecting = useEditorSelector(
    (innerEditor2) =>
      innerEditor2.read.selection.nodes().length > 0 ||
      innerEditor2.read.selection.isExpanded()
  );

  const menuState: EditorChatState =
    (messages?.length ?? 0) > 0
      ? mode === 'chat'
        ? 'selectionSuggestion'
        : 'cursorSuggestion'
      : isSelecting
        ? 'selectionCommand'
        : 'cursorCommand';
  const menuGroups = comments.installed
    ? menuStateItems[menuState]
    : menuStateItems[menuState].map((group) => ({
        ...group,
        items: group.items.filter((item) => item !== aiChatItems.comment),
      }));
  const firstItemValue = menuGroups[0]?.items[0]?.value;

  React.useEffect(() => {
    if (firstItemValue) setValue(firstItemValue);
  }, [firstItemValue, setValue]);

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
  const toolName = usePluginStore(AIChatPlugin, 'toolName');
  const chat = usePluginStore(AIChatPlugin, 'chat');
  const mode = usePluginStore(AIChatPlugin, 'mode');

  const status = chat?.status ?? 'ready';

  const { api } = useEditor().plugin(AIChatPlugin);

  const isLoading = status === 'streaming' || status === 'submitted';

  if (isLoading && (mode === 'insert' || toolName === 'comment')) {
    return (
      <div
        className={cn(
          'fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-md border border-border bg-muted px-3 py-1.5 text-muted-foreground text-sm shadow-md transition-all duration-300'
        )}
      >
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        <span>{status === 'submitted' ? 'Thinking...' : 'Writing...'}</span>
        <Button
          size="sm"
          variant="ghost"
          className="flex items-center gap-1 text-xs"
          onKeyDown={(event) => {
            if (event.key !== 'Escape' || event.nativeEvent.isComposing) return;
            event.preventDefault();
            event.stopPropagation();
            api.stop();
          }}
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

  if (toolName === 'comment' && status === 'error') {
    return (
      <div
        className="fixed bottom-4 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-wrap items-center gap-2 rounded-lg border bg-popover p-2 text-sm shadow-lg"
        data-ai-comment-error=""
        data-editor-keep-selection-visible
      >
        <p className="w-full px-1 text-destructive" role="alert">
          Could not generate comments.
        </p>
        <Button onClick={() => api.reload()} size="sm" variant="outline">
          Try again
        </Button>
        <Button onClick={() => api.hide()} size="sm" variant="outline">
          <X data-icon="inline-start" />
          Dismiss
        </Button>
      </div>
    );
  }

  return null;
}
