'use client';

import type { PluginReference, Value } from 'platejs';
import {
  BoldPlugin,
  CodePlugin,
  EditorRoot,
  FontBackgroundColorPlugin,
  FontColorPlugin,
  HighlightPlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
  useCreateEditor,
} from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { IconPlaceholder } from './icon-placeholder';

type BooleanMarkPlugin =
  | typeof BoldPlugin
  | typeof CodePlugin
  | typeof HighlightPlugin
  | typeof ItalicPlugin
  | typeof StrikethroughPlugin
  | typeof UnderlinePlugin;

export type CreateSinkKit = {
  AIToolbarButton: React.ComponentType<{
    children?: React.ReactNode;
    tooltip?: React.ReactNode;
  }>;
  AlignToolbarButton: React.ComponentType;
  Avatar: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
    size?: 'default' | 'lg' | 'sm';
  }>;
  AvatarFallback: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
  }>;
  AvatarGroup: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
  }>;
  BulletedListToolbarButton: React.ComponentType;
  Button: React.ComponentType<{
    'aria-label'?: string;
    children?: React.ReactNode;
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
    size?:
      | 'default'
      | 'icon'
      | 'icon-lg'
      | 'icon-sm'
      | 'icon-xs'
      | 'lg'
      | 'sm'
      | 'xs';
    type?: 'button' | 'reset' | 'submit';
    variant?:
      | 'default'
      | 'destructive'
      | 'ghost'
      | 'link'
      | 'outline'
      | 'secondary';
  }>;
  codePlugins: readonly PluginReference[];
  Command: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
  }>;
  CommandEmpty: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
  }>;
  CommandGroup: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
    heading?: React.ReactNode;
  }>;
  CommandInput: React.ComponentType<{
    className?: string;
    placeholder?: string;
  }>;
  CommandItem: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
    onSelect?: (value: string) => void;
    value?: string;
  }>;
  CommandList: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
  }>;
  CommandShortcut: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
  }>;
  CommentToolbarButton: React.ComponentType;
  defaultColors: Array<{ isBrightColor: boolean; name: string; value: string }>;
  docPlugins: readonly PluginReference[];
  Editor: React.ComponentType<{
    className?: string;
    variant?: 'default' | 'demo' | 'fullWidth' | 'none' | 'select';
  }>;
  FixedToolbar: React.ComponentType<
    React.PropsWithChildren<{ className?: string }>
  >;
  FontColorToolbarButton: React.ComponentType<{
    children?: React.ReactNode;
    colors: Array<{ isBrightColor: boolean; name: string; value: string }>;
    plugin: typeof FontBackgroundColorPlugin | typeof FontColorPlugin;
    tooltip?: string;
  }>;
  FontSizeToolbarButton: React.ComponentType;
  Input: React.ComponentType<{
    'aria-label'?: string;
    className?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
    placeholder?: string;
    type?: string;
    value?: string;
  }>;
  InsertToolbarButton: React.ComponentType;
  LinkToolbarButton: React.ComponentType;
  MarkToolbarButton: React.ComponentType<{
    children?: React.ReactNode;
    plugin: BooleanMarkPlugin;
    tooltip?: React.ReactNode;
  }>;
  ModeToolbarButton: React.ComponentType;
  RedoToolbarButton: React.ComponentType;
  Separator: React.ComponentType<{
    className?: string;
    orientation?: 'horizontal' | 'vertical';
  }>;
  suggestionPlugins: readonly PluginReference[];
  tablePlugins: readonly PluginReference[];
  TableToolbarButton: React.ComponentType;
  TodoListToolbarButton: React.ComponentType;
  Toolbar: React.ComponentType<React.PropsWithChildren<{ className?: string }>>;
  ToolbarGroup: React.ComponentType<
    React.PropsWithChildren<{ className?: string }>
  >;
  TooltipProvider: React.ComponentType<{ children: React.ReactNode }>;
  TurnIntoToolbarButton: React.ComponentType;
  UndoToolbarButton: React.ComponentType;
};

const DOC_VALUE: Value = [
  {
    children: [{ text: 'Plate v2 architecture' }],
    level: 1,
    type: 'heading',
  },
  {
    children: [
      { text: 'Owner ' },
      {
        children: [{ text: '' }],
        label: 'Alice Chen',
        ref: 'alice',
        type: 'mention',
      },
      { text: ' · Target ' },
      {
        children: [{ text: '' }],
        type: 'date',
        value: '2026-11-27',
      },
      { text: ' · ' },
      {
        children: [{ text: 'platejs.org' }],
        type: 'link',
        url: 'https://platejs.org',
      },
    ],
    type: 'paragraph',
  },
  {
    children: [
      { text: 'Compose ' },
      { bold: true, text: 'headless plugins' },
      { text: ', ' },
      { highlight: true, text: 'token-driven UI' },
      { text: ', ' },
      { code: true, text: 'createEditor()' },
      { text: ', and ' },
      { kbd: true, text: '⌘J' },
      { text: ' without custom CSS.' },
    ],
    type: 'paragraph',
  },
  {
    children: [
      {
        children: [
          {
            text: 'Keep primitives composable so every theme, radius, and icon set flows through automatically.',
          },
        ],
        type: 'paragraph',
      },
    ],
    type: 'blockquote',
  },
  {
    checked: true,
    children: [{ text: 'Ship Base UI and Radix editor kits' }],
    indent: 1,
    listType: 'task',
    type: 'paragraph',
  },
  {
    checked: false,
    children: [{ text: 'Verify light, dark, and RTL contrast' }],
    indent: 1,
    listType: 'task',
    type: 'paragraph',
  },
  {
    children: [
      {
        text: 'Type / anywhere or click the toolbar above to format this document live.',
      },
    ],
    icon: '💡',
    type: 'callout',
    variant: 'info',
  },
];

const CODE_VALUE: Value = [
  {
    children: [
      {
        text: [
          "import { createEditor } from 'platejs';",
          '',
          'export const editor = createEditor({',
          '  plugins: [BlocksKit, AIKit],',
          "  userId: 'alice',",
          '});',
        ].join('\n'),
      },
    ],
    language: 'typescript',
    type: 'codeBlock',
  },
];

const SUGGESTION_VALUE: Value = [
  {
    children: [
      { text: 'Migrate ' },
      {
        authored: [{ at: 1, author: 'bob', change: 's-1', kind: 'delete' }],
        text: 'legacy ',
      },
      {
        authored: [{ at: 2, author: 'bob', change: 's-1', kind: 'insert' }],
        text: 'composable ',
      },
      { text: 'editor plugins with ' },
      {
        authored: [{ at: 3, author: 'alice', change: 's-2', kind: 'insert' }],
        text: 'multi-author review',
      },
      { text: ' built in.' },
    ],
    type: 'paragraph',
  },
];

const TABLE_VALUE: Value = [
  {
    children: [
      {
        children: [
          {
            children: [{ children: [{ text: 'Package' }], type: 'paragraph' }],
            header: true,
            type: 'tableCell',
          },
          {
            children: [{ children: [{ text: 'Role' }], type: 'paragraph' }],
            header: true,
            type: 'tableCell',
          },
          {
            children: [{ children: [{ text: 'Status' }], type: 'paragraph' }],
            header: true,
            type: 'tableCell',
          },
        ],
        type: 'tableRow',
      },
      {
        children: [
          {
            children: [
              {
                children: [{ code: true, text: 'plitejs' }],
                type: 'paragraph',
              },
            ],
            type: 'tableCell',
          },
          {
            children: [
              { children: [{ text: 'Core engine' }], type: 'paragraph' },
            ],
            type: 'tableCell',
          },
          {
            children: [{ children: [{ text: 'Stable' }], type: 'paragraph' }],
            type: 'tableCell',
          },
        ],
        type: 'tableRow',
      },
      {
        children: [
          {
            children: [
              {
                children: [{ code: true, text: 'platejs' }],
                type: 'paragraph',
              },
            ],
            type: 'tableCell',
          },
          {
            children: [
              { children: [{ text: 'Plugin kit' }], type: 'paragraph' },
            ],
            type: 'tableCell',
          },
          {
            children: [{ children: [{ text: 'Beta' }], type: 'paragraph' }],
            type: 'tableCell',
          },
        ],
        type: 'tableRow',
      },
      {
        children: [
          {
            children: [
              {
                children: [{ code: true, text: 'registry' }],
                type: 'paragraph',
              },
            ],
            type: 'tableCell',
          },
          {
            children: [
              { children: [{ text: 'Shadcn UI' }], type: 'paragraph' },
            ],
            type: 'tableCell',
          },
          {
            children: [{ children: [{ text: 'Ready' }], type: 'paragraph' }],
            type: 'tableCell',
          },
        ],
        type: 'tableRow',
      },
    ],
    columnWidths: [104, 126, 86],
    type: 'table',
  },
];

const SLASH_COMMANDS = [
  {
    icon: (
      <IconPlaceholder
        hugeicons="SparklesIcon"
        lucide="SparklesIcon"
        phosphor="SparkleIcon"
        remixicon="RiSparklingLine"
        tabler="IconSparkles"
      />
    ),
    label: 'Ask AI',
    shortcut: '⌘J',
  },
  {
    icon: (
      <IconPlaceholder
        hugeicons="Heading01Icon"
        lucide="Heading1Icon"
        phosphor="TextHOneIcon"
        remixicon="RiH1"
        tabler="IconH1"
      />
    ),
    label: 'Heading 1',
    shortcut: '#',
  },
  {
    icon: (
      <IconPlaceholder
        hugeicons="Menu01Icon"
        lucide="ListIcon"
        phosphor="ListIcon"
        remixicon="RiListUnordered"
        tabler="IconListDetails"
      />
    ),
    label: 'Bulleted list',
    shortcut: '-',
  },
  {
    icon: (
      <IconPlaceholder
        hugeicons="BulbIcon"
        lucide="LightbulbIcon"
        phosphor="LightbulbIcon"
        remixicon="RiLightbulbLine"
        tabler="IconBulb"
      />
    ),
    label: 'Callout',
    shortcut: '/cal',
  },
  {
    icon: (
      <IconPlaceholder
        hugeicons="TableIcon"
        lucide="Table"
        phosphor="TableIcon"
        remixicon="RiTableLine"
        tabler="IconTable"
      />
    ),
    label: 'Table',
    shortcut: '/tbl',
  },
  {
    icon: (
      <IconPlaceholder
        hugeicons="SourceCodeIcon"
        lucide="Code2"
        phosphor="CodeIcon"
        remixicon="RiCodeSSlashLine"
        tabler="IconCode"
      />
    ),
    label: 'Code block',
    shortcut: '```',
  },
] as const;

const TURN_INTO_OPTIONS = [
  {
    icon: (
      <IconPlaceholder
        className="size-4"
        hugeicons="ParagraphIcon"
        lucide="PilcrowIcon"
        phosphor="ParagraphIcon"
        remixicon="RiParagraph"
        tabler="IconPilcrow"
      />
    ),
    label: 'Text',
  },
  {
    icon: (
      <IconPlaceholder
        className="size-4"
        hugeicons="Heading01Icon"
        lucide="Heading1Icon"
        phosphor="TextHOneIcon"
        remixicon="RiH1"
        tabler="IconH1"
      />
    ),
    label: 'Heading 1',
  },
  {
    icon: (
      <IconPlaceholder
        className="size-4"
        hugeicons="QuoteDownIcon"
        lucide="Quote"
        phosphor="QuotesIcon"
        remixicon="RiDoubleQuotesL"
        tabler="IconQuote"
      />
    ),
    label: 'Blockquote',
  },
] as const;

const INITIAL_AI_DRAFT =
  'Plate compiles every editor primitive against your shadcn theme tokens so styles, icons, and radius stay in sync.';

function SinkFixedToolbarButtons({ kit }: { kit: CreateSinkKit }) {
  const {
    AIToolbarButton,
    AlignToolbarButton,
    BulletedListToolbarButton,
    CommentToolbarButton,
    defaultColors,
    FontColorToolbarButton,
    FontSizeToolbarButton,
    InsertToolbarButton,
    LinkToolbarButton,
    MarkToolbarButton,
    ModeToolbarButton,
    RedoToolbarButton,
    TableToolbarButton,
    TodoListToolbarButton,
    ToolbarGroup,
    TurnIntoToolbarButton,
    UndoToolbarButton,
  } = kit;

  return (
    <div className="flex w-full items-center">
      <ToolbarGroup>
        <UndoToolbarButton />
        <RedoToolbarButton />
      </ToolbarGroup>

      <ToolbarGroup>
        <AIToolbarButton tooltip="AI commands">
          <IconPlaceholder
            hugeicons="MagicWand01Icon"
            lucide="WandSparklesIcon"
            phosphor="MagicWandIcon"
            remixicon="RiMagicLine"
            tabler="IconWand"
          />
        </AIToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <InsertToolbarButton />
        <TurnIntoToolbarButton />
        <FontSizeToolbarButton />
      </ToolbarGroup>

      <ToolbarGroup>
        <MarkToolbarButton plugin={BoldPlugin} tooltip="Bold">
          <IconPlaceholder
            hugeicons="TextBoldIcon"
            lucide="BoldIcon"
            phosphor="TextBIcon"
            remixicon="RiBold"
            tabler="IconBold"
          />
        </MarkToolbarButton>
        <MarkToolbarButton plugin={ItalicPlugin} tooltip="Italic">
          <IconPlaceholder
            hugeicons="TextItalicIcon"
            lucide="ItalicIcon"
            phosphor="TextItalicIcon"
            remixicon="RiItalic"
            tabler="IconItalic"
          />
        </MarkToolbarButton>
        <MarkToolbarButton plugin={UnderlinePlugin} tooltip="Underline">
          <IconPlaceholder
            hugeicons="TextUnderlineIcon"
            lucide="UnderlineIcon"
            phosphor="TextUnderlineIcon"
            remixicon="RiUnderline"
            tabler="IconUnderline"
          />
        </MarkToolbarButton>
        <MarkToolbarButton plugin={StrikethroughPlugin} tooltip="Strikethrough">
          <IconPlaceholder
            hugeicons="TextStrikethroughIcon"
            lucide="StrikethroughIcon"
            phosphor="TextStrikethroughIcon"
            remixicon="RiStrikethrough"
            tabler="IconStrikethrough"
          />
        </MarkToolbarButton>
        <MarkToolbarButton plugin={CodePlugin} tooltip="Code">
          <IconPlaceholder
            hugeicons="SourceCodeIcon"
            lucide="Code2Icon"
            phosphor="CodeIcon"
            remixicon="RiCodeSSlashLine"
            tabler="IconCode"
          />
        </MarkToolbarButton>
        <FontColorToolbarButton
          colors={defaultColors}
          plugin={FontColorPlugin}
          tooltip="Text color"
        >
          <IconPlaceholder
            hugeicons="TextColorIcon"
            lucide="BaselineIcon"
            phosphor="TextAUnderlineIcon"
            remixicon="RiFontColor"
            tabler="IconBaseline"
          />
        </FontColorToolbarButton>
        <FontColorToolbarButton
          colors={defaultColors}
          plugin={FontBackgroundColorPlugin}
          tooltip="Background color"
        >
          <IconPlaceholder
            hugeicons="PaintBucketIcon"
            lucide="PaintBucketIcon"
            phosphor="PaintBucketIcon"
            remixicon="RiPaintLine"
            tabler="IconBucketDroplet"
          />
        </FontColorToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <AlignToolbarButton />
        <BulletedListToolbarButton />
        <TodoListToolbarButton />
      </ToolbarGroup>

      <ToolbarGroup>
        <LinkToolbarButton />
        <TableToolbarButton />
      </ToolbarGroup>

      <div className="grow" />

      <ToolbarGroup>
        <MarkToolbarButton plugin={HighlightPlugin} tooltip="Highlight">
          <IconPlaceholder
            hugeicons="HighlighterIcon"
            lucide="HighlighterIcon"
            phosphor="HighlighterIcon"
            remixicon="RiMarkPenLine"
            tabler="IconHighlight"
          />
        </MarkToolbarButton>
        <CommentToolbarButton />
      </ToolbarGroup>

      <ToolbarGroup>
        <ModeToolbarButton />
      </ToolbarGroup>
    </div>
  );
}

function SinkFloatingToolbarButtons({ kit }: { kit: CreateSinkKit }) {
  const {
    AIToolbarButton,
    CommentToolbarButton,
    LinkToolbarButton,
    MarkToolbarButton,
    ToolbarGroup,
  } = kit;

  return (
    <>
      <ToolbarGroup>
        <AIToolbarButton tooltip="AI commands">
          <IconPlaceholder
            hugeicons="MagicWand01Icon"
            lucide="WandSparklesIcon"
            phosphor="MagicWandIcon"
            remixicon="RiMagicLine"
            tabler="IconWand"
          />
          Ask AI
        </AIToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <MarkToolbarButton plugin={BoldPlugin} tooltip="Bold">
          <IconPlaceholder
            hugeicons="TextBoldIcon"
            lucide="BoldIcon"
            phosphor="TextBIcon"
            remixicon="RiBold"
            tabler="IconBold"
          />
        </MarkToolbarButton>
        <MarkToolbarButton plugin={ItalicPlugin} tooltip="Italic">
          <IconPlaceholder
            hugeicons="TextItalicIcon"
            lucide="ItalicIcon"
            phosphor="TextItalicIcon"
            remixicon="RiItalic"
            tabler="IconItalic"
          />
        </MarkToolbarButton>
        <MarkToolbarButton plugin={UnderlinePlugin} tooltip="Underline">
          <IconPlaceholder
            hugeicons="TextUnderlineIcon"
            lucide="UnderlineIcon"
            phosphor="TextUnderlineIcon"
            remixicon="RiUnderline"
            tabler="IconUnderline"
          />
        </MarkToolbarButton>
        <MarkToolbarButton plugin={StrikethroughPlugin} tooltip="Strikethrough">
          <IconPlaceholder
            hugeicons="TextStrikethroughIcon"
            lucide="StrikethroughIcon"
            phosphor="TextStrikethroughIcon"
            remixicon="RiStrikethrough"
            tabler="IconStrikethrough"
          />
        </MarkToolbarButton>
        <MarkToolbarButton plugin={CodePlugin} tooltip="Code">
          <IconPlaceholder
            hugeicons="SourceCodeIcon"
            lucide="Code2Icon"
            phosphor="CodeIcon"
            remixicon="RiCodeSSlashLine"
            tabler="IconCode"
          />
        </MarkToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <LinkToolbarButton />
        <CommentToolbarButton />
      </ToolbarGroup>
    </>
  );
}

function SlashCommandCard({
  kit,
  onPickCommand,
}: {
  kit: CreateSinkKit;
  onPickCommand: (label: string) => void;
}) {
  const {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandShortcut,
  } = kit;

  return (
    <div
      className="cn-popover-content cn-menu-target overflow-hidden rounded-xl border bg-popover p-0 text-popover-foreground shadow-sm"
      data-menu-translucent=""
      data-slot="sink-slash-menu"
    >
      <Command className="bg-transparent">
        <CommandInput placeholder="Filter commands..." />
        <CommandList className="max-h-none">
          <CommandEmpty>No matching commands.</CommandEmpty>
          <CommandGroup heading="Insert">
            {SLASH_COMMANDS.map((item) => (
              <CommandItem
                key={item.label}
                onSelect={() => onPickCommand(item.label)}
                value={item.label}
              >
                <span className="flex size-4 shrink-0 items-center justify-center">
                  {item.icon}
                </span>
                <span>{item.label}</span>
                <CommandShortcut>{item.shortcut}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}

function AIAssistantCard({
  kit,
  onInsert,
}: {
  kit: CreateSinkKit;
  onInsert: (text: string) => void;
}) {
  const { Button, Input } = kit;
  const [prompt, setPrompt] = React.useState('');
  const [draft, setDraft] = React.useState(INITIAL_AI_DRAFT);
  const [status, setStatus] = React.useState<'accepted' | 'ready'>('ready');

  const submitPrompt = () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    setDraft(trimmed);
    setStatus('ready');
    setPrompt('');
  };

  return (
    <section
      className="cn-card flex flex-col gap-3 bg-card p-4 text-card-foreground"
      data-slot="card"
    >
      <div className="flex items-center gap-2 text-xs font-medium">
        <IconPlaceholder
          className="size-3.5 text-primary"
          hugeicons="SparklesIcon"
          lucide="SparklesIcon"
          phosphor="SparkleIcon"
          remixicon="RiSparklingLine"
          tabler="IconSparkles"
        />
        <span>Rewrite concisely</span>
        <span
          className={cn(
            'cn-badge ms-auto inline-flex items-center',
            status === 'accepted'
              ? 'cn-badge-variant-default'
              : 'cn-badge-variant-secondary'
          )}
        >
          {status === 'accepted' ? 'Applied' : 'Ready'}
        </span>
      </div>

      <div className="rounded-lg bg-muted/50 px-3 py-2.5 text-sm leading-relaxed text-foreground">
        {draft}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          onClick={() => {
            onInsert(draft);
            setStatus('accepted');
          }}
          size="sm"
          type="button"
          variant="default"
        >
          <IconPlaceholder
            className="size-3.5"
            hugeicons="Tick02Icon"
            lucide="Check"
            phosphor="CheckIcon"
            remixicon="RiCheckLine"
            tabler="IconCheck"
          />
          Accept
        </Button>
        <Button
          onClick={() => onInsert(draft)}
          size="sm"
          type="button"
          variant="outline"
        >
          <IconPlaceholder
            className="size-3.5"
            hugeicons="PencilEdit02Icon"
            lucide="PenLine"
            phosphor="PencilLineIcon"
            remixicon="RiEditLine"
            tabler="IconWriting"
          />
          Insert below
        </Button>
        <Button
          onClick={() => {
            setDraft(INITIAL_AI_DRAFT);
            setStatus('ready');
          }}
          size="sm"
          type="button"
          variant="ghost"
        >
          Discard
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input
          aria-label="Ask AI prompt"
          className="h-8 text-sm"
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              submitPrompt();
            }
          }}
          placeholder="Ask AI anything..."
          type="text"
          value={prompt}
        />
        <Button
          onClick={submitPrompt}
          size="sm"
          type="button"
          variant="default"
        >
          Run
        </Button>
      </div>
    </section>
  );
}

function BlockMenuCard() {
  const [selectedBlock, setSelectedBlock] = React.useState('Heading 1');

  return (
    <div
      className="grid grid-cols-1 gap-2 sm:grid-cols-[1.05fr_0.95fr]"
      data-slot="sink-block-menu"
    >
      <div
        className="cn-dropdown-menu-content cn-menu-target flex flex-col gap-0.5"
        data-menu-translucent=""
      >
        <div className="cn-dropdown-menu-item flex items-center bg-accent text-accent-foreground">
          <IconPlaceholder
            className="size-4"
            hugeicons="MagicWand01Icon"
            lucide="Wand"
            phosphor="MagicWandIcon"
            remixicon="RiMagicLine"
            tabler="IconWand"
          />
          <span>Ask AI</span>
        </div>
        <div className="cn-dropdown-menu-sub-trigger flex items-center">
          <IconPlaceholder
            className="size-4"
            hugeicons="ParagraphIcon"
            lucide="PilcrowIcon"
            phosphor="ParagraphIcon"
            remixicon="RiParagraph"
            tabler="IconPilcrow"
          />
          <span>Turn into</span>
          <IconPlaceholder
            className="ms-auto size-4 rtl:rotate-180"
            hugeicons="ArrowRight01Icon"
            lucide="ChevronRightIcon"
            phosphor="CaretRightIcon"
            remixicon="RiArrowRightSLine"
            tabler="IconChevronRight"
          />
        </div>
        <div className="cn-dropdown-menu-item flex items-center">
          <IconPlaceholder
            className="size-4"
            hugeicons="PlayListAddIcon"
            lucide="ListPlus"
            phosphor="ListPlusIcon"
            remixicon="RiMenuAddLine"
            tabler="IconPlaylistAdd"
          />
          <span>Duplicate</span>
          <span className="cn-dropdown-menu-shortcut">⌘D</span>
        </div>
        <div className="cn-dropdown-menu-separator" />
        <div
          className="cn-dropdown-menu-item flex items-center text-destructive"
          data-variant="destructive"
        >
          <IconPlaceholder
            className="size-4"
            hugeicons="Cancel01Icon"
            lucide="X"
            phosphor="XIcon"
            remixicon="RiCloseLine"
            tabler="IconX"
          />
          <span>Delete</span>
          <span className="cn-dropdown-menu-shortcut">⌫</span>
        </div>
      </div>

      <div
        className="cn-dropdown-menu-sub-content cn-menu-target flex flex-col gap-0.5 self-start"
        data-menu-translucent=""
      >
        <div className="cn-dropdown-menu-label">Turn into</div>
        {TURN_INTO_OPTIONS.map((option) => {
          const active = selectedBlock === option.label;
          return (
            <button
              key={option.label}
              className={cn(
                'cn-dropdown-menu-item flex w-full items-center text-start',
                active && 'bg-accent text-accent-foreground'
              )}
              onClick={() => setSelectedBlock(option.label)}
              type="button"
            >
              {option.icon}
              <span>{option.label}</span>
              {active && (
                <IconPlaceholder
                  className="ms-auto size-3.5"
                  hugeicons="Tick02Icon"
                  lucide="Check"
                  phosphor="CheckIcon"
                  remixicon="RiCheckLine"
                  tabler="IconCheck"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ReviewCard({
  kit,
  suggestionEditor,
}: {
  kit: CreateSinkKit;
  suggestionEditor: ReturnType<typeof useCreateEditor>;
}) {
  const { Avatar, AvatarFallback, Button, Editor, Input, Separator } = kit;
  const [decision, setDecision] = React.useState<
    'accepted' | 'pending' | 'rejected'
  >('pending');
  const [replyText, setReplyText] = React.useState('');
  const [replies, setReplies] = React.useState<string[]>([]);

  const submitReply = () => {
    const trimmed = replyText.trim();
    if (!trimmed) return;

    setReplies((prev) => [...prev, trimmed]);
    setReplyText('');
  };

  return (
    <section
      className="cn-card flex flex-col gap-3 bg-card p-4 text-card-foreground"
      data-slot="card"
    >
      <EditorRoot editor={suggestionEditor} readOnly>
        <Editor className="min-h-0 px-0 py-0 text-sm" variant="none" />
      </EditorRoot>

      <Separator />

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            <AvatarFallback className="bg-primary/15 text-xs font-medium text-primary">
              BL
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-medium text-foreground">Bob Lee</span>
              <span className="text-muted-foreground">2m ago</span>
            </div>
          </div>
          {decision === 'pending' ? (
            <div className="flex items-center gap-1">
              <Button
                aria-label="Accept suggestion"
                onClick={() => setDecision('accepted')}
                size="icon-xs"
                type="button"
                variant="ghost"
              >
                <IconPlaceholder
                  className="size-3.5"
                  hugeicons="Tick02Icon"
                  lucide="Check"
                  phosphor="CheckIcon"
                  remixicon="RiCheckLine"
                  tabler="IconCheck"
                />
              </Button>
              <Button
                aria-label="Reject suggestion"
                onClick={() => setDecision('rejected')}
                size="icon-xs"
                type="button"
                variant="ghost"
              >
                <IconPlaceholder
                  className="size-3.5"
                  hugeicons="Cancel01Icon"
                  lucide="X"
                  phosphor="XIcon"
                  remixicon="RiCloseLine"
                  tabler="IconX"
                />
              </Button>
            </div>
          ) : (
            <button
              className={cn(
                'cn-badge cursor-pointer',
                decision === 'accepted'
                  ? 'cn-badge-variant-default'
                  : 'cn-badge-variant-secondary'
              )}
              onClick={() => setDecision('pending')}
              type="button"
            >
              {decision === 'accepted' ? 'Accepted' : 'Rejected'}
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="rounded-sm bg-editor-delete/15 px-1.5 py-0.5 text-editor-delete line-through">
            legacy
          </span>
          <span className="text-muted-foreground">to</span>
          <span className="rounded-sm bg-editor-insert/15 px-1.5 py-0.5 text-editor-insert">
            composable
          </span>
        </div>

        {replies.map((reply, index) => (
          <div
            key={`${reply}-${index}`}
            className="rounded-md bg-muted/50 px-2.5 py-1.5 text-xs text-foreground"
          >
            <span className="font-medium">You: </span>
            {reply}
          </div>
        ))}

        <div className="flex items-center gap-2">
          <Input
            aria-label="Reply to thread"
            className="h-8 text-xs"
            onChange={(event) => setReplyText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                submitReply();
              }
            }}
            placeholder="Reply..."
            type="text"
            value={replyText}
          />
          <Button
            onClick={submitReply}
            size="xs"
            type="button"
            variant="default"
          >
            Reply
          </Button>
        </div>
      </div>
    </section>
  );
}

export function CreateSink({ kit }: { kit: CreateSinkKit }) {
  const {
    Avatar,
    AvatarFallback,
    AvatarGroup,
    Button,
    codePlugins,
    docPlugins,
    Editor,
    FixedToolbar,
    suggestionPlugins,
    tablePlugins,
    Toolbar,
    TooltipProvider,
  } = kit;

  const [published, setPublished] = React.useState(false);

  const docEditor = useCreateEditor({
    initialValue: DOC_VALUE,
    plugins: [...docPlugins],
    userId: 'alice',
  });
  const codeEditor = useCreateEditor({
    initialValue: CODE_VALUE,
    plugins: [...codePlugins],
  });
  const suggestionEditor = useCreateEditor({
    initialValue: SUGGESTION_VALUE,
    plugins: [...suggestionPlugins],
    userId: 'alice',
  });
  const tableEditor = useCreateEditor({
    initialValue: TABLE_VALUE,
    plugins: [...tablePlugins],
  });

  const appendParagraph = React.useCallback(
    (text: string) => {
      docEditor.update.nodes.insert(
        { children: [{ text }], type: 'paragraph' },
        { at: [docEditor.read.children().length] }
      );
    },
    [docEditor]
  );

  const handlePickCommand = React.useCallback(
    (label: string) => {
      if (label === 'Heading 1') {
        docEditor.update.nodes.insert(
          { children: [{ text: 'New section' }], level: 2, type: 'heading' },
          { at: [docEditor.read.children().length] }
        );
        return;
      }

      if (label === 'Callout') {
        docEditor.update.nodes.insert(
          {
            children: [{ text: 'Inserted from the Slash command menu.' }],
            icon: '✨',
            type: 'callout',
            variant: 'info',
          },
          { at: [docEditor.read.children().length] }
        );
        return;
      }

      appendParagraph(`Inserted ${label.toLowerCase()} block.`);
    },
    [appendParagraph, docEditor]
  );

  return (
    <TooltipProvider>
      <div
        className="min-h-screen bg-muted/40 p-4 pb-16 sm:p-5 sm:pb-16 dark:bg-background"
        data-slot="create-sink"
      >
        <EditorRoot editor={docEditor}>
          <div className="mx-auto flex max-w-[1440px] flex-col gap-4">
            <div
              className="cn-card gap-0 overflow-hidden bg-card py-0 text-card-foreground"
              data-slot="card"
            >
              <FixedToolbar className="rounded-none border-b-0 bg-transparent px-1.5 py-1">
                <SinkFixedToolbarButtons kit={kit} />
              </FixedToolbar>
            </div>

            <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-4">
                <section
                  className="cn-card flex flex-col gap-0 overflow-hidden bg-card py-0 text-card-foreground"
                  data-slot="card"
                >
                  <div className="flex items-center justify-between gap-2 border-b px-4 py-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <AvatarGroup>
                        <Avatar size="sm">
                          <AvatarFallback className="bg-primary/15 text-xs font-medium text-primary">
                            A
                          </AvatarFallback>
                        </Avatar>
                        <Avatar size="sm">
                          <AvatarFallback className="text-xs font-medium">
                            B
                          </AvatarFallback>
                        </Avatar>
                      </AvatarGroup>
                      <span className="truncate text-xs font-medium text-muted-foreground">
                        Q4 Release Spec
                      </span>
                    </div>
                    <Button
                      onClick={() => setPublished((prev) => !prev)}
                      size="xs"
                      type="button"
                      variant={published ? 'secondary' : 'default'}
                    >
                      {published ? 'Published' : 'Publish'}
                    </Button>
                  </div>
                  <div className="px-5 py-4">
                    <Editor
                      className="min-h-0 px-0 py-0 text-sm [&_h1]:mt-0 [&_h1]:text-xl [&_h1]:font-semibold"
                      variant="none"
                    />
                  </div>
                </section>

                <section
                  className="cn-card gap-0 overflow-hidden bg-card p-2 text-card-foreground"
                  data-slot="card"
                >
                  <EditorRoot editor={codeEditor} readOnly>
                    <Editor
                      className="min-h-0 px-0 py-0 text-xs [&_pre]:my-0"
                      variant="none"
                    />
                  </EditorRoot>
                </section>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex justify-center">
                  <Toolbar className="no-scrollbar max-w-full overflow-x-auto rounded-lg border bg-popover p-1 whitespace-nowrap shadow-md">
                    <SinkFloatingToolbarButtons kit={kit} />
                  </Toolbar>
                </div>

                <AIAssistantCard kit={kit} onInsert={appendParagraph} />

                <SlashCommandCard kit={kit} onPickCommand={handlePickCommand} />
              </div>

              <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-1">
                <ReviewCard kit={kit} suggestionEditor={suggestionEditor} />

                <BlockMenuCard />

                <section
                  className="cn-card gap-0 overflow-hidden bg-card px-3 py-2 text-card-foreground"
                  data-slot="card"
                >
                  <EditorRoot editor={tableEditor} readOnly>
                    <Editor
                      className="min-h-0 px-0 py-0 text-xs"
                      variant="none"
                    />
                  </EditorRoot>
                </section>
              </div>
            </div>
          </div>
        </EditorRoot>
      </div>
    </TooltipProvider>
  );
}
