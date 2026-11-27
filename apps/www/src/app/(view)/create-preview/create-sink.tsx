'use client';

import type { PluginReference, Value } from 'platejs';
import { EditorRoot, useCreateEditor } from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { IconPlaceholder } from './icon-placeholder';

export type CreateSinkKit = {
  codePlugins: readonly PluginReference[];
  docPlugins: readonly PluginReference[];
  Editor: React.ComponentType<{
    className?: string;
    variant?: 'default' | 'demo' | 'fullWidth' | 'none' | 'select';
  }>;
  FixedToolbar: React.ComponentType<
    React.PropsWithChildren<{ className?: string }>
  >;
  FixedToolbarButtons: React.ComponentType;
  FloatingToolbarButtons: React.ComponentType;
  suggestionPlugins: readonly PluginReference[];
  tablePlugins: readonly PluginReference[];
  Toolbar: React.ComponentType<React.PropsWithChildren<{ className?: string }>>;
  TooltipProvider: React.ComponentType<{ children: React.ReactNode }>;
};

const DOC_VALUE: Value = [
  {
    children: [{ text: 'Design your Plate editor' }],
    level: 1,
    type: 'heading',
  },
  {
    children: [
      { text: 'Edit live prose with ' },
      { bold: true, text: 'marks' },
      { text: ', ' },
      { highlight: true, text: 'highlights' },
      { text: ', ' },
      { code: true, text: 'inline code' },
      { text: ', ' },
      { kbd: true, text: '⌘J' },
      { text: ', and ' },
      {
        children: [{ text: 'theme links' }],
        type: 'link',
        url: 'https://platejs.org',
      },
      { text: '.' },
    ],
    type: 'paragraph',
  },
  {
    children: [{ text: 'Typography & blocks' }],
    level: 2,
    type: 'heading',
  },
  {
    children: [
      {
        children: [
          {
            text: 'Headings, body text, and UI chrome react immediately to every picker on the left.',
          },
        ],
        type: 'paragraph',
      },
    ],
    type: 'blockquote',
  },
  {
    checked: true,
    children: [{ text: 'Switch styles, fonts, radius, and icon sets' }],
    indent: 1,
    listType: 'task',
    type: 'paragraph',
  },
  {
    checked: false,
    children: [{ text: 'Flip light, dark, and RTL direction live' }],
    indent: 1,
    listType: 'task',
    type: 'paragraph',
  },
  {
    children: [
      {
        text: 'Tip: click the toolbar buttons above to format text directly inside this card.',
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
          "import { createEditor } from 'platejs/react';",
          '',
          '// Semantic syntax tokens adapt to light & dark',
          'export const editor = createEditor({',
          '  plugins: [BasicBlocksKit, AIKit],',
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
      { text: 'Ship ' },
      {
        authored: [{ at: 1, author: 'alice', change: 's-1', kind: 'insert' }],
        text: 'accessible ',
      },
      { text: 'rich-text ' },
      {
        authored: [{ at: 2, author: 'bob', change: 's-2', kind: 'delete' }],
        text: 'widgets ',
      },
      {
        authored: [{ at: 3, author: 'bob', change: 's-2', kind: 'insert' }],
        text: 'editors ',
      },
      { text: 'with ' },
      {
        authored: [{ at: 4, author: 'charlie', change: 's-3', kind: 'insert' }],
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
            children: [{ children: [{ text: 'Token' }], type: 'paragraph' }],
            header: true,
            type: 'tableCell',
          },
          {
            children: [{ children: [{ text: 'Surface' }], type: 'paragraph' }],
            header: true,
            type: 'tableCell',
          },
          {
            children: [{ children: [{ text: 'AA' }], type: 'paragraph' }],
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
                children: [{ code: true, text: '--primary' }],
                type: 'paragraph',
              },
            ],
            type: 'tableCell',
          },
          {
            children: [
              { children: [{ text: 'Links & buttons' }], type: 'paragraph' },
            ],
            type: 'tableCell',
          },
          {
            children: [{ children: [{ text: 'Pass' }], type: 'paragraph' }],
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
                children: [{ code: true, text: '--highlight' }],
                type: 'paragraph',
              },
            ],
            type: 'tableCell',
          },
          {
            children: [
              { children: [{ text: 'Mark & flash' }], type: 'paragraph' },
            ],
            type: 'tableCell',
          },
          {
            children: [{ children: [{ text: 'Pass' }], type: 'paragraph' }],
            type: 'tableCell',
          },
        ],
        type: 'tableRow',
      },
    ],
    type: 'table',
  },
];

const SLASH_MENU_ITEMS = [
  {
    active: true,
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
    active: false,
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
    active: false,
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
    active: false,
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
    active: false,
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
    active: false,
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

function SinkCard({
  children,
  className,
  description,
  title,
}: React.PropsWithChildren<{
  className?: string;
  description?: string;
  title: string;
}>) {
  return (
    <section
      className={cn(
        'cn-card flex flex-col overflow-hidden bg-card text-card-foreground',
        className
      )}
      data-slot="card"
    >
      <div
        className="cn-card-header flex flex-col border-b pb-3"
        data-slot="card-header"
      >
        <h3
          className="cn-card-title text-sm font-medium"
          data-slot="card-title"
        >
          {title}
        </h3>
        {description && (
          <p
            className="cn-card-description text-xs text-muted-foreground"
            data-slot="card-description"
          >
            {description}
          </p>
        )}
      </div>
      <div
        className="cn-card-content flex flex-col gap-3"
        data-slot="card-content"
      >
        {children}
      </div>
    </section>
  );
}

function SlashMenuCard() {
  return (
    <SinkCard
      description="Menu color, translucency, accent, and icons."
      title="Slash command"
    >
      <div className="relative rounded-lg bg-[radial-gradient(color-mix(in_oklab,var(--primary)_22%,transparent)_1px,transparent_1px)] bg-[length:12px_12px] p-2.5">
        <div
          className="cn-dropdown-menu-content cn-menu-target flex flex-col gap-0.5"
          data-menu-translucent=""
          data-slot="sink-slash-menu"
        >
          <div className="flex items-center gap-2 border-b border-border/60 px-2 py-1.5 text-xs text-muted-foreground">
            <span className="font-mono text-foreground">/</span>
            <span>Filter blocks or ask AI...</span>
          </div>
          <div className="cn-dropdown-menu-label">Suggested</div>
          {SLASH_MENU_ITEMS.map((item) => (
            <div
              key={item.label}
              className={cn(
                'cn-dropdown-menu-item flex cursor-default items-center select-none',
                item.active && 'bg-accent text-accent-foreground'
              )}
            >
              <span className="flex size-4 shrink-0 items-center justify-center">
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
              <span
                className={cn(
                  'cn-dropdown-menu-shortcut',
                  item.active && 'text-accent-foreground/80'
                )}
              >
                {item.shortcut}
              </span>
            </div>
          ))}
        </div>
      </div>
    </SinkCard>
  );
}

function BlockMenuCard() {
  return (
    <SinkCard
      description="Context menu, sub-menu, and destructive actions."
      title="Block menu"
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_0.9fr]">
        <div
          className="cn-dropdown-menu-content cn-menu-target flex flex-col gap-0.5"
          data-menu-translucent=""
          data-slot="sink-block-menu"
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
          <div className="cn-dropdown-menu-item flex items-center">
            <IconPlaceholder
              className="size-4"
              hugeicons="ParagraphIcon"
              lucide="PilcrowIcon"
              phosphor="ParagraphIcon"
              remixicon="RiParagraph"
              tabler="IconPilcrow"
            />
            <span>Text</span>
          </div>
          <div className="cn-dropdown-menu-item flex items-center bg-accent text-accent-foreground">
            <IconPlaceholder
              className="size-4"
              hugeicons="Heading01Icon"
              lucide="Heading1Icon"
              phosphor="TextHOneIcon"
              remixicon="RiH1"
              tabler="IconH1"
            />
            <span>Heading 1</span>
            <IconPlaceholder
              className="ms-auto size-3.5"
              hugeicons="Tick02Icon"
              lucide="Check"
              phosphor="CheckIcon"
              remixicon="RiCheckLine"
              tabler="IconCheck"
            />
          </div>
          <div className="cn-dropdown-menu-item flex items-center">
            <IconPlaceholder
              className="size-4"
              hugeicons="QuoteDownIcon"
              lucide="Quote"
              phosphor="QuotesIcon"
              remixicon="RiDoubleQuotesL"
              tabler="IconQuote"
            />
            <span>Blockquote</span>
          </div>
        </div>
      </div>
    </SinkCard>
  );
}

function AIAssistantCard() {
  return (
    <SinkCard
      description="Prompt input, streaming suggestion, and action bar."
      title="AI assistant"
    >
      <div className="rounded-lg border bg-muted/40 p-2.5 text-sm leading-relaxed text-foreground">
        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <IconPlaceholder
            className="size-3.5 text-primary"
            hugeicons="SparklesIcon"
            lucide="SparklesIcon"
            phosphor="SparkleIcon"
            remixicon="RiSparklingLine"
            tabler="IconSparkles"
          />
          <span>Rewritten concisely</span>
          <span className="cn-badge cn-badge-variant-secondary ms-auto inline-flex items-center px-1.5 py-0 text-xs">
            Ready
          </span>
        </div>
        Plate adapts to your shadcn theme, radius, icons, and direction with
        zero custom CSS overrides.
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          className="cn-button cn-button-variant-default cn-button-size-sm inline-flex items-center"
          type="button"
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
        </button>
        <button
          className="cn-button cn-button-variant-outline cn-button-size-sm inline-flex items-center"
          type="button"
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
        </button>
        <button
          className="cn-button cn-button-variant-ghost cn-button-size-sm inline-flex items-center"
          type="button"
        >
          <IconPlaceholder
            className="size-3.5"
            hugeicons="UndoIcon"
            lucide="CornerUpLeft"
            phosphor="ArrowBendUpLeftIcon"
            remixicon="RiCornerUpLeftLine"
            tabler="IconCornerUpLeft"
          />
          Discard
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input
          aria-label="Ask AI prompt"
          className="cn-input h-8 min-w-0 flex-1 bg-transparent px-2.5 text-sm outline-none"
          defaultValue=""
          placeholder="Ask AI anything..."
          readOnly
          type="text"
        />
        <button
          className="cn-button cn-button-variant-default cn-button-size-sm shrink-0"
          type="button"
        >
          Run
        </button>
      </div>
    </SinkCard>
  );
}

function DiffCard() {
  return (
    <SinkCard
      description="Insert and delete tokens across light and dark."
      title="Version diff"
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-editor-delete/25 bg-editor-delete/10 p-2.5 text-xs">
          <div className="mb-1 font-medium text-[color-mix(in_oklab,var(--editor-delete)_85%,var(--foreground))]">
            Before
          </div>
          <p className="leading-relaxed text-foreground">
            Static themes lock every editor to{' '}
            <mark className="rounded-xs bg-editor-delete/22 px-0.5 text-inherit">
              fixed yellow and green
            </mark>{' '}
            colors.
          </p>
        </div>
        <div className="rounded-lg border border-editor-insert/25 bg-editor-insert/10 p-2.5 text-xs">
          <div className="mb-1 font-medium text-[color-mix(in_oklab,var(--editor-insert)_85%,var(--foreground))]">
            After
          </div>
          <p className="leading-relaxed text-foreground">
            Semantic tokens adapt every editor to{' '}
            <mark className="rounded-xs bg-editor-insert/22 px-0.5 text-inherit">
              your shadcn palette
            </mark>{' '}
            automatically.
          </p>
        </div>
      </div>
    </SinkCard>
  );
}

export function CreateSink({ kit }: { kit: CreateSinkKit }) {
  const {
    codePlugins,
    docPlugins,
    Editor,
    FixedToolbar,
    FixedToolbarButtons,
    FloatingToolbarButtons,
    suggestionPlugins,
    tablePlugins,
    Toolbar,
    TooltipProvider,
  } = kit;

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

  return (
    <TooltipProvider>
      <div
        className="min-h-screen bg-muted/60 p-4 pb-16 sm:p-6 sm:pb-16 dark:bg-background"
        data-slot="create-sink"
      >
        <EditorRoot editor={docEditor}>
          <div className="mx-auto flex max-w-[1440px] flex-col gap-4">
            <SinkCard
              description="Fixed and floating toolbars bound to the live editor below."
              title="Toolbars"
            >
              <div className="overflow-hidden rounded-lg border bg-background">
                <FixedToolbar className="rounded-none border-b-0">
                  <FixedToolbarButtons />
                </FixedToolbar>
              </div>
              <div className="flex justify-center">
                <Toolbar className="no-scrollbar max-w-full overflow-x-auto rounded-md border bg-popover p-1 whitespace-nowrap shadow-sm">
                  <FloatingToolbarButtons />
                </Toolbar>
              </div>
            </SinkCard>

            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2 xl:grid-cols-3">
              <div className="flex flex-col gap-4">
                <SinkCard
                  description="Live interactive editor for headings, body text, marks, and blocks."
                  title="Document & typography"
                >
                  <div className="rounded-lg border bg-background px-4 py-3">
                    <Editor
                      className="min-h-0 px-0 py-0 text-sm [&_h1]:mt-0"
                      variant="none"
                    />
                  </div>
                </SinkCard>

                <SinkCard
                  description="Lowlight syntax tokens and mono font."
                  title="Code block"
                >
                  <EditorRoot editor={codeEditor} readOnly>
                    <Editor
                      className="min-h-0 px-0 py-0 text-xs"
                      variant="none"
                    />
                  </EditorRoot>
                </SinkCard>
              </div>

              <div className="flex flex-col gap-4">
                <SlashMenuCard />
                <BlockMenuCard />
                <AIAssistantCard />
              </div>

              <div className="flex flex-col gap-4 lg:col-span-2 xl:col-span-1">
                <SinkCard
                  description="Multi-author suggestion slots and review thread."
                  title="Suggestions & discussion"
                >
                  <div className="rounded-lg border bg-background px-3 py-2">
                    <EditorRoot editor={suggestionEditor} readOnly>
                      <Editor
                        className="min-h-0 px-0 py-0 text-sm"
                        variant="none"
                      />
                    </EditorRoot>
                  </div>
                  <div className="flex flex-col gap-2.5 rounded-lg border bg-background p-3">
                    <div className="flex items-center gap-2">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-medium text-primary">
                        B
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="font-medium text-foreground">
                            Bob
                          </span>
                          <span className="text-muted-foreground">2m ago</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          aria-label="Accept suggestion"
                          className="cn-button cn-button-variant-ghost cn-button-size-icon-xs inline-flex items-center justify-center"
                          type="button"
                        >
                          <IconPlaceholder
                            className="size-3.5"
                            hugeicons="Tick02Icon"
                            lucide="Check"
                            phosphor="CheckIcon"
                            remixicon="RiCheckLine"
                            tabler="IconCheck"
                          />
                        </button>
                        <button
                          aria-label="Reject suggestion"
                          className="cn-button cn-button-variant-ghost cn-button-size-icon-xs inline-flex items-center justify-center"
                          type="button"
                        >
                          <IconPlaceholder
                            className="size-3.5"
                            hugeicons="Cancel01Icon"
                            lucide="X"
                            phosphor="XIcon"
                            remixicon="RiCloseLine"
                            tabler="IconX"
                          />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="rounded-sm bg-editor-delete/15 px-1.5 py-0.5 text-editor-delete line-through">
                        widgets
                      </span>
                      <span className="text-muted-foreground">to</span>
                      <span className="rounded-sm bg-editor-insert/15 px-1.5 py-0.5 text-editor-insert">
                        editors
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        aria-label="Reply to thread"
                        className="cn-input h-8 min-w-0 flex-1 bg-transparent px-2.5 text-xs outline-none"
                        defaultValue=""
                        placeholder="Reply..."
                        readOnly
                        type="text"
                      />
                      <button
                        className="cn-button cn-button-variant-default cn-button-size-xs shrink-0"
                        type="button"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </SinkCard>

                <DiffCard />

                <SinkCard
                  description="Table borders plus inline mention, date, and field chips."
                  title="Table & inline nodes"
                >
                  <EditorRoot editor={tableEditor} readOnly>
                    <Editor
                      className="min-h-0 px-0 py-0 text-xs"
                      variant="none"
                    />
                  </EditorRoot>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 font-medium text-foreground">
                      @Alice
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-muted-foreground">
                      <IconPlaceholder
                        className="size-3"
                        hugeicons="Calendar03Icon"
                        lucide="CalendarIcon"
                        phosphor="CalendarIcon"
                        remixicon="RiCalendarLine"
                        tabler="IconCalendar"
                      />
                      Nov 27, 2026
                    </span>
                    <span className="inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 font-medium text-primary">
                      Company name
                    </span>
                    <span className="cn-badge cn-badge-variant-default inline-flex items-center">
                      Ready
                    </span>
                    <span className="cn-badge cn-badge-variant-outline inline-flex items-center">
                      v2 beta
                    </span>
                  </div>
                </SinkCard>
              </div>
            </div>
          </div>
        </EditorRoot>
      </div>
    </TooltipProvider>
  );
}
