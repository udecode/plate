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
  PLUGINS,
  type PluginTransaction,
} from 'platejs';
import { AIChatPlugin } from 'platejs/ai/react';
import { BaseCalloutPlugin } from 'platejs/callout';
import { BaseCodeDrawingPlugin } from 'platejs/code-drawing';
import { BaseDatePlugin } from 'platejs/date';
import { BaseDetailsPlugin } from 'platejs/details';
import { BaseExcalidrawPlugin } from 'platejs/excalidraw';
import { BaseFootnotePlugin } from 'platejs/footnote';
import { BaseColumnPlugin } from 'platejs/layout';
import { BaseEquationPlugin, BaseInlineEquationPlugin } from 'platejs/math';
import {
  type Editor,
  type EditorElementProps,
  EditorElement,
  useEditorReadOnly,
} from 'platejs/react';
import { SlashInputPlugin, SlashPlugin } from 'platejs/slash-command/react';
import { BaseTablePlugin } from 'platejs/table';
import { BaseTocPlugin } from 'platejs/toc';
import * as React from 'react';

import { insertBlock } from '@/registry/components/editor/transforms';

import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxGroupLabel,
  InlineComboboxInput,
  InlineComboboxItem,
} from './inline-combobox';

type Item = {
  icon: React.ReactNode;
  isAvailable: (editor: Editor) => boolean;
  value: string;
  onClick?: (editor: Editor) => void;
  onSelect?: (editor: Editor, tx: PluginTransaction) => void;
  className?: string;
  focusEditor?: boolean;
  keywords?: string[];
  label?: string;
};

type Group = {
  group: string;
  items: Item[];
};

const groups: Group[] = [
  {
    group: 'AI',
    items: [
      {
        focusEditor: false,
        icon: <SparklesIcon />,
        isAvailable: (editor) => editor.plugin(AIChatPlugin).installed,
        value: 'AI',
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
        value: PLUGINS.paragraph,
        onSelect: (editor, tx) => {
          const paragraph = editor.plugin(BaseParagraphPlugin);

          if (!paragraph.installed || editor.read.view.isReadOnly()) return;

          insertBlock(
            tx,
            {
              matches: (block) =>
                !block.listType && block.type === paragraph.schema.type,
              insert: (options) => {
                tx.plugin(BaseParagraphPlugin).insert({}, options);
              },
            },
            { upsert: true }
          );
        },
      },
      {
        icon: <Heading1Icon />,
        isAvailable: (editor) => editor.plugin(BaseHeadingPlugin).installed,
        keywords: ['title', 'h1'],
        label: 'Heading 1',
        value: 'heading-1',
        onSelect: (editor, tx) => {
          const heading = editor.plugin(BaseHeadingPlugin);

          if (!heading.installed || editor.read.view.isReadOnly()) return;

          insertBlock(
            tx,
            {
              matches: (block) =>
                !block.listType &&
                block.type === heading.schema.type &&
                block.level === 1,
              insert: (options) => {
                tx.plugin(BaseHeadingPlugin).insert({ level: 1 }, options);
              },
            },
            { upsert: true }
          );
        },
      },
      {
        icon: <Heading2Icon />,
        isAvailable: (editor) => editor.plugin(BaseHeadingPlugin).installed,
        keywords: ['subtitle', 'h2'],
        label: 'Heading 2',
        value: 'heading-2',
        onSelect: (editor, tx) => {
          const heading = editor.plugin(BaseHeadingPlugin);

          if (!heading.installed || editor.read.view.isReadOnly()) return;

          insertBlock(
            tx,
            {
              matches: (block) =>
                !block.listType &&
                block.type === heading.schema.type &&
                block.level === 2,
              insert: (options) => {
                tx.plugin(BaseHeadingPlugin).insert({ level: 2 }, options);
              },
            },
            { upsert: true }
          );
        },
      },
      {
        icon: <Heading3Icon />,
        isAvailable: (editor) => editor.plugin(BaseHeadingPlugin).installed,
        keywords: ['subtitle', 'h3'],
        label: 'Heading 3',
        value: 'heading-3',
        onSelect: (editor, tx) => {
          const heading = editor.plugin(BaseHeadingPlugin);

          if (!heading.installed || editor.read.view.isReadOnly()) return;

          insertBlock(
            tx,
            {
              matches: (block) =>
                !block.listType &&
                block.type === heading.schema.type &&
                block.level === 3,
              insert: (options) => {
                tx.plugin(BaseHeadingPlugin).insert({ level: 3 }, options);
              },
            },
            { upsert: true }
          );
        },
      },
      {
        icon: <ListIcon />,
        isAvailable: (editor) => editor.plugin(BaseListPlugin).installed,
        keywords: ['unordered', 'ul', '-'],
        label: 'Bulleted list',
        value: 'disc',
        onSelect: (editor, tx) => {
          if (
            !editor.plugin(BaseListPlugin).installed ||
            editor.read.view.isReadOnly()
          ) {
            return;
          }

          insertBlock(
            tx,
            {
              matches: (block) => block.listType === 'bulleted',
              insert: (options) => {
                tx.plugin(BaseListPlugin).insert({ type: 'bulleted' }, options);
              },
            },
            { upsert: true }
          );
        },
      },
      {
        icon: <ListOrdered />,
        isAvailable: (editor) => editor.plugin(BaseListPlugin).installed,
        keywords: ['ordered', 'ol', '1'],
        label: 'Numbered list',
        value: 'decimal',
        onSelect: (editor, tx) => {
          if (
            !editor.plugin(BaseListPlugin).installed ||
            editor.read.view.isReadOnly()
          ) {
            return;
          }

          insertBlock(
            tx,
            {
              matches: (block) => block.listType === 'numbered',
              insert: (options) => {
                tx.plugin(BaseListPlugin).insert({ type: 'numbered' }, options);
              },
            },
            { upsert: true }
          );
        },
      },
      {
        icon: <Square />,
        isAvailable: (editor) => editor.plugin(BaseListPlugin).installed,
        keywords: ['checklist', 'task', 'checkbox', '[]'],
        label: 'To-do list',
        value: 'todo',
        onSelect: (editor, tx) => {
          if (
            !editor.plugin(BaseListPlugin).installed ||
            editor.read.view.isReadOnly()
          ) {
            return;
          }

          insertBlock(
            tx,
            {
              matches: (block) => block.listType === 'task',
              insert: (options) => {
                tx.plugin(BaseListPlugin).insert({ type: 'task' }, options);
              },
            },
            { upsert: true }
          );
        },
      },
      {
        icon: <ChevronRightIcon />,
        isAvailable: (editor) => editor.plugin(BaseDetailsPlugin).installed,
        keywords: ['collapsible', 'expandable'],
        label: 'Details',
        value: PLUGINS.details,
        onSelect: (editor, tx) => {
          const details = editor.plugin(BaseDetailsPlugin);

          if (!details.installed || editor.read.view.isReadOnly()) return;

          insertBlock(
            tx,
            {
              matches: (block) =>
                !block.listType && block.type === details.schema.type,
              insert: (options) => {
                tx.plugin(BaseDetailsPlugin).insert({}, options);
              },
            },
            { upsert: true }
          );
        },
      },
      {
        icon: <Code2 />,
        isAvailable: (editor) => editor.plugin(BaseCodeBlockPlugin).installed,
        keywords: ['```'],
        label: 'Code Block',
        value: PLUGINS.codeBlock,
        onSelect: (editor, tx) => {
          const codeBlock = editor.plugin(BaseCodeBlockPlugin);

          if (!codeBlock.installed || editor.read.view.isReadOnly()) return;

          insertBlock(
            tx,
            {
              matches: (block) =>
                !block.listType && block.type === codeBlock.schema.type,
              insert: (options) => {
                tx.plugin(BaseCodeBlockPlugin).insert({}, options);
              },
            },
            { upsert: true }
          );
        },
      },
      {
        icon: <Table />,
        isAvailable: (editor) => editor.plugin(BaseTablePlugin).installed,
        label: 'Table',
        value: PLUGINS.table,
        onSelect: (editor, tx) => {
          const table = editor.plugin(BaseTablePlugin);

          if (!table.installed || editor.read.view.isReadOnly()) return;

          insertBlock(
            tx,
            {
              matches: (block) =>
                !block.listType && block.type === table.schema.type,
              insert: (options) => {
                tx.plugin(BaseTablePlugin).insert({}, options);
              },
            },
            { upsert: true }
          );
        },
      },
      {
        icon: <Quote />,
        isAvailable: (editor) => editor.plugin(BaseBlockquotePlugin).installed,
        keywords: ['citation', 'blockquote', 'quote', '>'],
        label: 'Blockquote',
        value: PLUGINS.blockquote,
        onSelect: (editor, tx) => {
          const blockquote = editor.plugin(BaseBlockquotePlugin);

          if (!blockquote.installed || editor.read.view.isReadOnly()) return;

          insertBlock(
            tx,
            {
              matches: (block) =>
                !block.listType && block.type === blockquote.schema.type,
              insert: (options) => {
                tx.plugin(BaseBlockquotePlugin).insert({}, options);
              },
            },
            { upsert: true }
          );
        },
      },
      {
        icon: <LightbulbIcon />,
        isAvailable: (editor) => editor.plugin(BaseCalloutPlugin).installed,
        keywords: ['note'],
        label: 'Callout',
        value: PLUGINS.callout,
        onSelect: (editor, tx) => {
          const callout = editor.plugin(BaseCalloutPlugin);

          if (!callout.installed || editor.read.view.isReadOnly()) return;

          insertBlock(
            tx,
            {
              matches: (block) =>
                !block.listType && block.type === callout.schema.type,
              insert: (options) => {
                tx.plugin(BaseCalloutPlugin).insert({}, options);
              },
            },
            { upsert: true }
          );
        },
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
        value: PLUGINS.toc,
        onSelect: (editor, tx) => {
          const toc = editor.plugin(BaseTocPlugin);

          if (!toc.installed || editor.read.view.isReadOnly()) return;

          insertBlock(
            tx,
            {
              matches: (block) =>
                !block.listType && block.type === toc.schema.type,
              insert: (options) => {
                tx.plugin(BaseTocPlugin).insert({}, options);
              },
            },
            { upsert: true }
          );
        },
      },
      {
        icon: <Columns3Icon />,
        isAvailable: (editor) => editor.plugin(BaseColumnPlugin).installed,
        label: '3 columns',
        value: 'action_three_columns',
        onSelect: (editor, tx) => {
          const column = editor.plugin(BaseColumnPlugin);

          if (!column.installed || editor.read.view.isReadOnly()) return;

          insertBlock(
            tx,
            {
              matches: (block) =>
                !block.listType && block.type === column.schema.type,
              insert: (options) => {
                tx.plugin(BaseColumnPlugin).insert({ columns: 3 }, options);
              },
            },
            { upsert: true }
          );
        },
      },
      {
        focusEditor: false,
        icon: <RadicalIcon />,
        isAvailable: (editor) => editor.plugin(BaseEquationPlugin).installed,
        label: 'Equation',
        value: PLUGINS.equation,
        onSelect: (editor, tx) => {
          const equation = editor.plugin(BaseEquationPlugin);

          if (!equation.installed || editor.read.view.isReadOnly()) return;

          insertBlock(
            tx,
            {
              matches: (block) =>
                !block.listType && block.type === equation.schema.type,
              insert: (options) => {
                tx.plugin(BaseEquationPlugin).insert({}, options);
              },
            },
            { upsert: true }
          );
        },
      },
      {
        icon: <PenToolIcon />,
        isAvailable: (editor) => editor.plugin(BaseExcalidrawPlugin).installed,
        keywords: ['excalidraw'],
        label: 'Excalidraw',
        value: PLUGINS.excalidraw,
        onSelect: (editor, tx) => {
          const excalidraw = editor.plugin(BaseExcalidrawPlugin);

          if (!excalidraw.installed || editor.read.view.isReadOnly()) return;

          insertBlock(
            tx,
            {
              matches: (block) =>
                !block.listType && block.type === excalidraw.schema.type,
              insert: (options) => {
                tx.plugin(BaseExcalidrawPlugin).insert({}, options);
              },
            },
            { upsert: true }
          );
        },
      },
      {
        icon: <Code2 />,
        isAvailable: (editor) => editor.plugin(BaseCodeDrawingPlugin).installed,
        keywords: [
          'code-drawing',
          'diagram',
          'plantuml',
          'graphviz',
          'flowchart',
          'mermaid',
        ],
        label: 'Code Drawing',
        value: PLUGINS.codeDrawing,
        onSelect: (editor, tx) => {
          const codeDrawing = editor.plugin(BaseCodeDrawingPlugin);

          if (!codeDrawing.installed || editor.read.view.isReadOnly()) return;

          insertBlock(
            tx,
            {
              matches: (block) =>
                !block.listType && block.type === codeDrawing.schema.type,
              insert: (options) => {
                tx.plugin(BaseCodeDrawingPlugin).insert({}, options);
              },
            },
            { upsert: true }
          );
        },
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
        value: PLUGINS.date,
        onSelect: (editor, tx) => {
          if (
            !editor.plugin(BaseDatePlugin).installed ||
            editor.read.view.isReadOnly()
          ) {
            return;
          }

          tx.plugin(BaseDatePlugin).insert({}, { select: true });
        },
      },
      {
        icon: <SuperscriptIcon />,
        isAvailable: (editor) => editor.plugin(BaseFootnotePlugin).installed,
        keywords: ['citation', 'fn', 'footnote', '[^]'],
        label: 'Footnote',
        value: 'action_footnote',
        onSelect: (editor, tx) => {
          if (
            !editor.plugin(BaseFootnotePlugin).installed ||
            editor.read.view.isReadOnly()
          ) {
            return;
          }

          tx.plugin(BaseFootnotePlugin).insert({}, { select: true });
        },
      },
      {
        focusEditor: false,
        icon: <RadicalIcon />,
        isAvailable: (editor) =>
          editor.plugin(BaseInlineEquationPlugin).installed,
        label: 'Inline Equation',
        value: PLUGINS.inlineEquation,
        onSelect: (editor, tx) => {
          if (
            !editor.plugin(BaseInlineEquationPlugin).installed ||
            editor.read.view.isReadOnly()
          ) {
            return;
          }

          tx.plugin(BaseInlineEquationPlugin).insert({}, { select: true });
        },
      },
    ],
  },
];

export function SlashInputElement(
  props: EditorElementProps<typeof SlashInputPlugin>
) {
  const { editor, element } = props;
  const readOnly = useEditorReadOnly();
  const availableGroups = readOnly
    ? []
    : groups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => item.isAvailable(editor)),
        }))
        .filter((group) => group.items.length > 0);

  return (
    <EditorElement {...props} as="span">
      <InlineCombobox element={element} trigger="/">
        <InlineComboboxInput />

        <InlineComboboxContent>
          <InlineComboboxEmpty>No results</InlineComboboxEmpty>

          {availableGroups.map(({ group, items }) => (
            <InlineComboboxGroup key={group}>
              <InlineComboboxGroupLabel>{group}</InlineComboboxGroupLabel>

              {items.map(
                ({
                  focusEditor,
                  icon,
                  keywords,
                  label,
                  value,
                  onClick,
                  onSelect,
                }) => (
                  <InlineComboboxItem
                    key={value}
                    value={value}
                    onClick={() => {
                      onClick?.(editor);
                    }}
                    onSelect={(tx) => {
                      onSelect?.(editor, tx);
                    }}
                    label={label}
                    focusEditor={focusEditor}
                    group={group}
                    keywords={keywords}
                  >
                    <div className="mr-2 text-muted-foreground">{icon}</div>
                    {label ?? value}
                  </InlineComboboxItem>
                )
              )}
            </InlineComboboxGroup>
          ))}
        </InlineComboboxContent>
      </InlineCombobox>

      {props.children}
    </EditorElement>
  );
}

export const SlashKit = [
  SlashPlugin.configure({
    initialState: {
      triggerQuery: (editor) => {
        const codeBlock = editor.plugin(BaseCodeBlockPlugin);

        return (
          !codeBlock.installed ||
          !editor.read.nodes.some({
            type: codeBlock.schema.type,
          })
        );
      },
    },
  }),
  SlashInputPlugin.configure({ component: SlashInputElement }),
];
