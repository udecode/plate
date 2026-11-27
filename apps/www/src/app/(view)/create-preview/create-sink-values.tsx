'use client';

import type { Value } from 'platejs';

import type { SinkSelectItem } from './create-sink-types';
import { IconPlaceholder } from './icon-placeholder';

export const DOC_VALUE: Value = [
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

export const CODE_VALUE: Value = [
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

export const SUGGESTION_VALUE: Value = [
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

export const TABLE_VALUE: Value = [
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

export const MATH_VALUE: Value = [
  {
    children: [
      { text: 'Inline LaTeX like ' },
      {
        children: [{ text: '' }],
        latex: 'E = mc^2',
        type: 'inlineEquation',
      },
      { text: ' and ' },
      {
        children: [{ text: '' }],
        latex: 'ax^2 + bx + c = 0',
        type: 'inlineEquation',
      },
      { text: ' render natively with KaTeX.' },
    ],
    type: 'paragraph',
  },
  {
    children: [{ text: '' }],
    latex: '\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    type: 'equation',
  },
  {
    children: [{ text: '' }],
    latex: '\\int_{a}^{b} f(x)\\,dx = F(b) - F(a)',
    type: 'equation',
  },
];

export const CALLOUT_DETAILS_VALUE: Value = [
  {
    children: [
      { bold: true, text: 'Tip: ' },
      { text: 'Click any callout emoji to swap it with the live picker.' },
    ],
    icon: '💡',
    type: 'callout',
    variant: 'info',
  },
  {
    children: [
      { bold: true, text: 'Heads up: ' },
      { text: 'Theme tokens propagate across light, dark, and RTL modes.' },
    ],
    icon: '⚠️',
    type: 'callout',
    variant: 'warning',
  },
  {
    children: [
      {
        children: [{ text: 'Why semantic Details blocks?' }],
        type: 'summary',
      },
      {
        children: [
          {
            text: 'Body blocks stay nested inside the disclosure node and serialize cleanly to HTML and Markdown.',
          },
        ],
        type: 'paragraph',
      },
    ],
    type: 'details',
  },
  {
    children: [
      {
        children: [{ text: 'Can Details blocks nest?' }],
        type: 'summary',
      },
      {
        children: [
          {
            text: 'Yes. Nested disclosures work as ordinary child blocks.',
          },
        ],
        type: 'paragraph',
      },
    ],
    type: 'details',
  },
];

export const FOOTNOTE_VALUE: Value = [
  {
    children: [
      { text: 'Document changes commit through canonical transactions' },
      {
        children: [{ text: '' }],
        ref: '1',
        type: 'footnoteReference',
      },
      { text: ' and preserve schema invariants across undo and Yjs' },
      {
        children: [{ text: '' }],
        ref: '2',
        type: 'footnoteReference',
      },
      { text: '.' },
    ],
    type: 'paragraph',
  },
  {
    children: [
      {
        children: [
          {
            text: 'Plite validates every document change against the compiled plugin schema.',
          },
        ],
        type: 'paragraph',
      },
    ],
    ref: '1',
    type: 'footnoteDefinition',
  },
  {
    children: [
      {
        children: [
          {
            text: 'Collaborative edits merge peer operations without drifting from DOM selection.',
          },
        ],
        type: 'paragraph',
      },
    ],
    ref: '2',
    type: 'footnoteDefinition',
  },
];

export const COLUMN_TOC_VALUE: Value = [
  {
    children: [{ text: 'Editor outline' }],
    level: 2,
    type: 'heading',
  },
  {
    children: [{ text: '' }],
    type: 'toc',
  },
  {
    children: [
      {
        children: [
          {
            children: [{ text: 'Schema core' }],
            level: 3,
            type: 'heading',
          },
          {
            children: [{ text: 'Typed plugins, transforms, and history.' }],
            type: 'paragraph',
          },
        ],
        type: 'column',
        width: '50%',
      },
      {
        children: [
          {
            children: [{ text: 'Shadcn UI' }],
            level: 3,
            type: 'heading',
          },
          {
            children: [{ text: 'Copy-paste kits wired to your theme.' }],
            type: 'paragraph',
          },
        ],
        type: 'column',
        width: '50%',
      },
    ],
    type: 'columnGroup',
  },
];

export const MEDIA_VALUE: Value = [
  {
    alt: 'Plate rich-text editor preview',
    children: [{ text: 'Resizable image block with editable caption.' }],
    type: 'image',
    url: '/_og.png',
    width: '100%',
  },
  {
    children: [{ text: 'Q4 architecture brief and component audit.' }],
    name: 'plate-v2-architecture.pdf',
    type: 'file',
    url: '#plate-v2-architecture.pdf',
  },
];

export const PREVIEW_ICONS = [
  {
    hugeicons: 'TextBoldIcon',
    lucide: 'BoldIcon',
    phosphor: 'TextBIcon',
    remixicon: 'RiBold',
    tabler: 'IconBold',
  },
  {
    hugeicons: 'TextItalicIcon',
    lucide: 'ItalicIcon',
    phosphor: 'TextItalicIcon',
    remixicon: 'RiItalic',
    tabler: 'IconItalic',
  },
  {
    hugeicons: 'SparklesIcon',
    lucide: 'SparklesIcon',
    phosphor: 'SparkleIcon',
    remixicon: 'RiSparklingLine',
    tabler: 'IconSparkles',
  },
  {
    hugeicons: 'TableIcon',
    lucide: 'TableIcon',
    phosphor: 'TableIcon',
    remixicon: 'RiTableLine',
    tabler: 'IconTable',
  },
  {
    hugeicons: 'SourceCodeIcon',
    lucide: 'Code2Icon',
    phosphor: 'CodeIcon',
    remixicon: 'RiCodeSSlashLine',
    tabler: 'IconCode',
  },
  {
    hugeicons: 'LinkIcon',
    lucide: 'LinkIcon',
    phosphor: 'LinkIcon',
    remixicon: 'RiLinksLine',
    tabler: 'IconLink',
  },
  {
    hugeicons: 'Comment01Icon',
    lucide: 'MessageSquareTextIcon',
    phosphor: 'ChatTextIcon',
    remixicon: 'RiMessage2Line',
    tabler: 'IconMessage',
  },
  {
    hugeicons: 'CheckListIcon',
    lucide: 'ListTodoIcon',
    phosphor: 'ListChecksIcon',
    remixicon: 'RiListCheck3',
    tabler: 'IconListCheck',
  },
  {
    hugeicons: 'TextAlignLeftIcon',
    lucide: 'AlignLeftIcon',
    phosphor: 'TextAlignLeftIcon',
    remixicon: 'RiAlignLeft',
    tabler: 'IconAlignLeft',
  },
  {
    hugeicons: 'Image01Icon',
    lucide: 'ImageIcon',
    phosphor: 'ImageIcon',
    remixicon: 'RiImageLine',
    tabler: 'IconPhoto',
  },
  {
    hugeicons: 'SquareRootSquareIcon',
    lucide: 'RadicalIcon',
    phosphor: 'RadicalIcon',
    remixicon: 'RiSquareRoot',
    tabler: 'IconSquareRoot',
  },
  {
    hugeicons: 'SmileIcon',
    lucide: 'SmileIcon',
    phosphor: 'SmileyIcon',
    remixicon: 'RiEmotionLine',
    tabler: 'IconMoodSmile',
  },
  {
    hugeicons: 'Calendar03Icon',
    lucide: 'CalendarIcon',
    phosphor: 'CalendarIcon',
    remixicon: 'RiCalendarLine',
    tabler: 'IconCalendar',
  },
  {
    hugeicons: 'Layout2ColumnIcon',
    lucide: 'Columns2Icon',
    phosphor: 'ColumnsIcon',
    remixicon: 'RiLayoutColumnLine',
    tabler: 'IconColumns2',
  },
  {
    hugeicons: 'Copy01Icon',
    lucide: 'CopyIcon',
    phosphor: 'CopyIcon',
    remixicon: 'RiFileCopyLine',
    tabler: 'IconCopy',
  },
  {
    hugeicons: 'Delete02Icon',
    lucide: 'Trash2Icon',
    phosphor: 'TrashIcon',
    remixicon: 'RiDeleteBinLine',
    tabler: 'IconTrash',
  },
] as const;

export const SLASH_COMMANDS = [
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
        lucide="TableIcon"
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
        lucide="Code2Icon"
        phosphor="CodeIcon"
        remixicon="RiCodeSSlashLine"
        tabler="IconCode"
      />
    ),
    label: 'Code block',
    shortcut: '```',
  },
  {
    icon: (
      <IconPlaceholder
        hugeicons="SquareRootSquareIcon"
        lucide="RadicalIcon"
        phosphor="RadicalIcon"
        remixicon="RiSquareRoot"
        tabler="IconSquareRoot"
      />
    ),
    label: 'Equation',
    shortcut: '$$',
  },
] as const;

export const TURN_INTO_OPTIONS = [
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
  {
    icon: (
      <IconPlaceholder
        className="size-4"
        hugeicons="SourceCodeIcon"
        lucide="Code2Icon"
        phosphor="CodeIcon"
        remixicon="RiCodeSSlashLine"
        tabler="IconCode"
      />
    ),
    label: 'Code block',
  },
] as const;

export const EDITOR_SHORTCUTS = [
  { keys: ['⌘', 'J'], label: 'Ask AI' },
  { keys: ['⌘', 'B'], label: 'Bold' },
  { keys: ['⌘', 'K'], label: 'Insert link' },
  { keys: ['⌘', '⇧', 'M'], label: 'Add comment' },
  { keys: ['/'], label: 'Slash commands' },
  { keys: ['⌘', 'Z'], label: 'Undo change' },
] as const;

export const SELECT_LABELS: readonly SinkSelectItem[] = [
  { value: 'Editor' },
  { value: 'AI' },
  { value: 'Markdown' },
  { value: 'Tables' },
  { value: 'Suggestions' },
  { value: 'Comments' },
  { value: 'Math' },
  { value: 'Yjs' },
];

export const SELECT_DEFAULT_ITEMS: readonly SinkSelectItem[] = [
  SELECT_LABELS[0],
  SELECT_LABELS[1],
  SELECT_LABELS[2],
];

export const AI_QUICK_PROMPTS = [
  {
    draft:
      'Plate ships composable rich-text plugins built directly on your shadcn theme tokens.',
    label: 'Shorter',
  },
  {
    draft:
      'Every Plate kit maps headings, menus, dialogs, and suggestion marks to your active shadcn preset with zero custom CSS.',
    label: 'Clearer',
  },
  {
    draft:
      'Key points: Base UI & Radix parity, live token inheritance, and built-in multi-author review.',
    label: 'Summarize',
  },
] as const;

export const INITIAL_AI_DRAFT =
  'Plate compiles every editor primitive against your shadcn theme tokens so styles, icons, and radius stay in sync.';
