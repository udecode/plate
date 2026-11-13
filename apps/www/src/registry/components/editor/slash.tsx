'use client';

import {
  CalendarIcon,
  ChevronRightIcon,
  Code2,
  Columns3Icon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  LightbulbIcon,
  ListIcon,
  ListOrdered,
  PenToolIcon,
  PilcrowIcon,
  Quote,
  RadicalIcon,
  SparklesIcon,
  Square,
  SuperscriptIcon,
  Table,
  TableOfContentsIcon,
} from 'lucide-react';
import {
  BaseBlockquotePlugin,
  BaseCodeBlockPlugin,
  BaseHeadingPlugin,
  BaseListPlugin,
  BaseParagraphPlugin,
  type PluginTransaction,
} from 'platejs';
import { AIChatPlugin } from 'platejs/ai/react';
import { BaseCalloutPlugin } from 'platejs/callout';
import type { ComboboxState } from 'platejs/combobox';
import { BaseDatePlugin } from 'platejs/date';
import { BaseDetailsPlugin, BaseDetailsSummaryPlugin } from 'platejs/details';
import { BaseExcalidrawPlugin } from 'platejs/excalidraw';
import { BaseFootnotePlugin } from 'platejs/footnote';
import { BaseColumnGroupPlugin } from 'platejs/layout';
import { BaseEquationPlugin, BaseInlineEquationPlugin } from 'platejs/math';
import {
  type EditableSiblingProps,
  type Editor,
  definePlugin,
  useEditor,
} from 'platejs/react';
import { BaseTablePlugin } from 'platejs/table';
import { BaseTocPlugin } from 'platejs/toc';
import * as React from 'react';

import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxGroupLabel,
  InlineComboboxItem,
  rankOptions,
  useInlineComboboxQuery,
} from './inline-combobox';

type Item = {
  icon: React.ReactNode;
  isAvailable: (editor: Editor) => boolean;
  label: string;
  onClick?: (editor: Editor) => void;
  onSelect?: (editor: Editor, tx: PluginTransaction) => boolean | void;
  focusEditor?: boolean;
  keywords?: string[];
};

type Group = {
  group: string;
  items: Item[];
};

const isTitle = (editor: Editor, tx: PluginTransaction) => {
  const summary = editor.plugin(BaseDetailsSummaryPlugin);

  return (
    summary.installed && tx.nodes.block()?.[0].type === summary.schema.type
  );
};

const upsertHeading = (
  editor: Editor,
  tx: PluginTransaction,
  level: 1 | 2 | 3
) => {
  const heading = tx.plugin(BaseHeadingPlugin);

  return isTitle(editor, tx)
    ? heading.setLevel(level)
    : heading.upsert({ level }, { select: true });
};

const groups: Group[] = [
  {
    group: 'AI',
    items: [
      {
        focusEditor: false,
        icon: <SparklesIcon />,
        isAvailable: (editor) => editor.plugin(AIChatPlugin).installed,
        label: 'AI',
        onClick: (editor) => {
          const ai = editor.plugin(AIChatPlugin);

          if (!ai.installed || editor.read.view.isReadOnly()) return;

          ai.api.show();
        },
      },
    ],
  },
  {
    group: 'Basic blocks',
    items: [
      {
        icon: <PilcrowIcon />,
        isAvailable: (editor) => editor.plugin(BaseParagraphPlugin).installed,
        keywords: ['paragraph'],
        label: 'Text',
        onSelect: (editor, tx) =>
          isTitle(editor, tx)
            ? tx.blocks.reset({ unset: ['level'] })
            : tx.plugin(BaseParagraphPlugin).upsert({}, { select: true }),
      },
      {
        icon: <Heading1Icon />,
        isAvailable: (editor) => editor.plugin(BaseHeadingPlugin).installed,
        keywords: ['title', 'h1'],
        label: 'Heading 1',
        onSelect: (editor, tx) => upsertHeading(editor, tx, 1),
      },
      {
        icon: <Heading2Icon />,
        isAvailable: (editor) => editor.plugin(BaseHeadingPlugin).installed,
        keywords: ['subtitle', 'h2'],
        label: 'Heading 2',
        onSelect: (editor, tx) => upsertHeading(editor, tx, 2),
      },
      {
        icon: <Heading3Icon />,
        isAvailable: (editor) => editor.plugin(BaseHeadingPlugin).installed,
        keywords: ['subtitle', 'h3'],
        label: 'Heading 3',
        onSelect: (editor, tx) => upsertHeading(editor, tx, 3),
      },
      {
        icon: <ListIcon />,
        isAvailable: (editor) => editor.plugin(BaseListPlugin).installed,
        keywords: ['unordered', 'ul', '-'],
        label: 'Bulleted list',
        onSelect: (_editor, tx) =>
          tx
            .plugin(BaseListPlugin)
            .upsert({ type: 'bulleted' }, { select: true }),
      },
      {
        icon: <ListOrdered />,
        isAvailable: (editor) => editor.plugin(BaseListPlugin).installed,
        keywords: ['ordered', 'ol', '1'],
        label: 'Numbered list',
        onSelect: (_editor, tx) =>
          tx
            .plugin(BaseListPlugin)
            .upsert({ type: 'numbered' }, { select: true }),
      },
      {
        icon: <Square />,
        isAvailable: (editor) => editor.plugin(BaseListPlugin).installed,
        keywords: ['checklist', 'task', 'checkbox', 'todo', '[]'],
        label: 'To-do list',
        onSelect: (_editor, tx) =>
          tx.plugin(BaseListPlugin).upsert({ type: 'task' }, { select: true }),
      },
      {
        icon: <ChevronRightIcon />,
        isAvailable: (editor) => editor.plugin(BaseDetailsPlugin).installed,
        keywords: ['collapsible', 'expandable'],
        label: 'Details',
        onSelect: (_editor, tx) =>
          tx.plugin(BaseDetailsPlugin).upsert({}, { select: true }),
      },
      {
        icon: <Code2 />,
        isAvailable: (editor) => editor.plugin(BaseCodeBlockPlugin).installed,
        keywords: ['codeblock', '```'],
        label: 'Code Block',
        onSelect: (_editor, tx) =>
          tx.plugin(BaseCodeBlockPlugin).upsert({}, { select: true }),
      },
      {
        icon: <Table />,
        isAvailable: (editor) => editor.plugin(BaseTablePlugin).installed,
        label: 'Table',
        onSelect: (_editor, tx) =>
          tx.plugin(BaseTablePlugin).upsert({}, { select: true }),
      },
      {
        icon: <Quote />,
        isAvailable: (editor) => editor.plugin(BaseBlockquotePlugin).installed,
        keywords: ['citation', 'blockquote', 'quote', '>'],
        label: 'Blockquote',
        onSelect: (_editor, tx) =>
          tx.plugin(BaseBlockquotePlugin).upsert({}, { select: true }),
      },
      {
        icon: <LightbulbIcon />,
        isAvailable: (editor) => editor.plugin(BaseCalloutPlugin).installed,
        keywords: ['note'],
        label: 'Callout',
        onSelect: (_editor, tx) =>
          tx.plugin(BaseCalloutPlugin).upsert({}, { select: true }),
      },
    ],
  },
  {
    group: 'Advanced blocks',
    items: [
      {
        icon: <TableOfContentsIcon />,
        isAvailable: (editor) => editor.plugin(BaseTocPlugin).installed,
        keywords: ['toc'],
        label: 'Table of contents',
        onSelect: (_editor, tx) =>
          tx.plugin(BaseTocPlugin).upsert({}, { select: true }),
      },
      {
        icon: <Columns3Icon />,
        isAvailable: (editor) => editor.plugin(BaseColumnGroupPlugin).installed,
        label: '3 columns',
        onSelect: (_editor, tx) =>
          tx
            .plugin(BaseColumnGroupPlugin)
            .upsert({ columns: 3 }, { select: true }),
      },
      {
        focusEditor: false,
        icon: <RadicalIcon />,
        isAvailable: (editor) => editor.plugin(BaseEquationPlugin).installed,
        label: 'Equation',
        onSelect: (_editor, tx) =>
          tx.plugin(BaseEquationPlugin).upsert({}, { select: true }),
      },
      {
        icon: <PenToolIcon />,
        isAvailable: (editor) => editor.plugin(BaseExcalidrawPlugin).installed,
        keywords: ['excalidraw'],
        label: 'Excalidraw',
        onSelect: (_editor, tx) =>
          tx.plugin(BaseExcalidrawPlugin).upsert({}, { select: true }),
      },
    ],
  },
  {
    group: 'Inline',
    items: [
      {
        icon: <CalendarIcon />,
        isAvailable: (editor) => editor.plugin(BaseDatePlugin).installed,
        keywords: ['time'],
        label: 'Date',
        onSelect: (_editor, tx) =>
          tx.plugin(BaseDatePlugin).insert({}, { select: true }),
      },
      {
        icon: <SuperscriptIcon />,
        isAvailable: (editor) => editor.plugin(BaseFootnotePlugin).installed,
        keywords: ['citation', 'fn', 'footnote', '[^]'],
        label: 'Footnote',
        onSelect: (_editor, tx) =>
          tx.plugin(BaseFootnotePlugin).insert({}, { select: true }),
      },
      {
        focusEditor: false,
        icon: <RadicalIcon />,
        isAvailable: (editor) =>
          editor.plugin(BaseInlineEquationPlugin).installed,
        label: 'Inline Equation',
        onSelect: (_editor, tx) =>
          tx.plugin(BaseInlineEquationPlugin).insert({}, { select: true }),
      },
    ],
  },
];

export function SlashCombobox({ editableRef }: EditableSiblingProps) {
  return (
    <InlineCombobox editableRef={editableRef} plugin={SlashPlugin}>
      <SlashComboboxContent />
    </InlineCombobox>
  );
}

function SlashComboboxContent() {
  const editor = useEditor();
  const query = useInlineComboboxQuery();
  const availableGroups = groups
    .map(({ group, items }) => ({
      group,
      items: items.filter((item) => item.isAvailable(editor)),
    }))
    .filter(({ items }) => items.length > 0);
  const rankedAcrossGroups = rankOptions(
    availableGroups.flatMap(({ group, items }) =>
      items.map((item) => ({ ...item, group }))
    ),
    query
  );
  const sections = query.trim()
    ? [{ group: undefined, items: rankedAcrossGroups }]
    : availableGroups;

  return (
    <InlineComboboxContent>
      <InlineComboboxEmpty>No results</InlineComboboxEmpty>

      {sections.map(({ group, items }) => (
        <InlineComboboxGroup key={group ?? 'results'}>
          {group ? (
            <InlineComboboxGroupLabel>{group}</InlineComboboxGroupLabel>
          ) : null}

          {items.map(({ focusEditor, icon, label, onClick, onSelect }) => (
            <InlineComboboxItem
              key={label}
              onClick={() => {
                onClick?.(editor);
              }}
              onSelect={(tx) => onSelect?.(editor, tx)}
              focusEditor={focusEditor}
            >
              <div className="mr-2 text-muted-foreground">{icon}</div>
              {label}
            </InlineComboboxItem>
          ))}
        </InlineComboboxGroup>
      ))}
    </InlineComboboxContent>
  );
}

export const SlashPlugin = definePlugin('slashCommand', {
  editOnly: true,
  initialState: (): ComboboxState => ({
    maxQueryLength: 75,
    queryPattern: null,
    trigger: '/',
    triggerPreviousCharPattern: /^\s?$/,
    triggerQuery: (editor) => {
      const codeBlock = editor.plugin(BaseCodeBlockPlugin);

      return (
        !codeBlock.installed ||
        !editor.read.nodes.some({
          type: codeBlock.schema.type,
        })
      );
    },
  }),
});

export const SlashKit = [
  SlashPlugin.configure({ slots: { afterEditable: SlashCombobox } }),
];
