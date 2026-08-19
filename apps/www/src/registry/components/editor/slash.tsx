'use client';

import * as React from 'react';
import {
  type PlateEditor,
  type PlateElementProps,
  PlateElement,
} from 'platejs/react';
import { AIChatPlugin } from '@platejs/ai/react';
import { SlashInputPlugin, SlashPlugin } from '@platejs/slash-command/react';
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
import { PLUGINS } from 'platejs';
import {
  insertBlock,
  insertInlineElement,
} from '@/registry/components/editor/transforms';
import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxGroupLabel,
  InlineComboboxInput,
  InlineComboboxItem,
} from './inline-combobox';

type Group = {
  group: string;
  items: {
    icon: React.ReactNode;
    value: string;
    onSelect: (editor: PlateEditor, value: string) => void;
    className?: string;
    focusEditor?: boolean;
    keywords?: string[];
    label?: string;
  }[];
};

const groups: Group[] = [
  {
    group: 'AI',
    items: [
      {
        focusEditor: false,
        icon: <SparklesIcon />,
        value: 'AI',
        onSelect: (editor) => {
          editor.plugin(AIChatPlugin).api.show();
        },
      },
    ],
  },
  {
    group: 'Basic blocks',
    items: [
      {
        icon: <PilcrowIcon />,
        keywords: ['paragraph'],
        label: 'Text',
        value: PLUGINS.paragraph,
      },
      {
        icon: <Heading1Icon />,
        keywords: ['title', 'h1'],
        label: 'Heading 1',
        value: 'heading-1',
      },
      {
        icon: <Heading2Icon />,
        keywords: ['subtitle', 'h2'],
        label: 'Heading 2',
        value: 'heading-2',
      },
      {
        icon: <Heading3Icon />,
        keywords: ['subtitle', 'h3'],
        label: 'Heading 3',
        value: 'heading-3',
      },
      {
        icon: <ListIcon />,
        keywords: ['unordered', 'ul', '-'],
        label: 'Bulleted list',
        value: 'disc',
      },
      {
        icon: <ListOrdered />,
        keywords: ['ordered', 'ol', '1'],
        label: 'Numbered list',
        value: 'decimal',
      },
      {
        icon: <Square />,
        keywords: ['checklist', 'task', 'checkbox', '[]'],
        label: 'To-do list',
        value: 'todo',
      },
      {
        icon: <ChevronRightIcon />,
        keywords: ['collapsible', 'expandable'],
        label: 'Toggle',
        value: PLUGINS.toggle,
      },
      {
        icon: <Code2 />,
        keywords: ['```'],
        label: 'Code Block',
        value: PLUGINS.codeBlock,
      },
      {
        icon: <Table />,
        label: 'Table',
        value: PLUGINS.table,
      },
      {
        icon: <Quote />,
        keywords: ['citation', 'blockquote', 'quote', '>'],
        label: 'Blockquote',
        value: PLUGINS.blockquote,
      },
      {
        description: 'Insert a highlighted block.',
        icon: <LightbulbIcon />,
        keywords: ['note'],
        label: 'Callout',
        value: PLUGINS.callout,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value, { upsert: true });
      },
    })),
  },
  {
    group: 'Advanced blocks',
    items: [
      {
        icon: <TableOfContentsIcon />,
        keywords: ['toc'],
        label: 'Table of contents',
        value: PLUGINS.toc,
      },
      {
        icon: <Columns3Icon />,
        label: '3 columns',
        value: 'action_three_columns',
      },
      {
        focusEditor: false,
        icon: <RadicalIcon />,
        label: 'Equation',
        value: PLUGINS.equation,
      },
      {
        icon: <PenToolIcon />,
        keywords: ['excalidraw'],
        label: 'Excalidraw',
        value: PLUGINS.excalidraw,
      },
      {
        icon: <Code2 />,
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
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value, { upsert: true });
      },
    })),
  },
  {
    group: 'Inline',
    items: [
      {
        focusEditor: true,
        icon: <CalendarIcon />,
        keywords: ['time'],
        label: 'Date',
        value: PLUGINS.date,
      },
      {
        focusEditor: true,
        icon: <SuperscriptIcon />,
        keywords: ['citation', 'fn', 'footnote', '[^]'],
        label: 'Footnote',
        value: 'action_footnote',
      },
      {
        focusEditor: false,
        icon: <RadicalIcon />,
        label: 'Inline Equation',
        value: PLUGINS.inlineEquation,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertInlineElement(editor, value);
      },
    })),
  },
];

export function SlashInputElement(
  props: PlateElementProps<typeof SlashInputPlugin>
) {
  const { editor, element } = props;

  return (
    <PlateElement {...props} as="span">
      <InlineCombobox element={element} trigger="/">
        <InlineComboboxInput />

        <InlineComboboxContent>
          <InlineComboboxEmpty>No results</InlineComboboxEmpty>

          {groups.map(({ group, items }) => (
            <InlineComboboxGroup key={group}>
              <InlineComboboxGroupLabel>{group}</InlineComboboxGroupLabel>

              {items.map(
                ({ focusEditor, icon, keywords, label, value, onSelect }) => (
                  <InlineComboboxItem
                    key={value}
                    value={value}
                    onClick={() => onSelect(editor, value)}
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
    </PlateElement>
  );
}

export const SlashKit = [
  SlashPlugin.configure({
    initialState: {
      triggerQuery: (editor) => {
        const codeBlock = editor.plugin(PLUGINS.codeBlock);

        return !editor.read.nodes.some({
          type: codeBlock.schema.type,
        });
      },
    },
  }),
  SlashInputPlugin.configure({ component: SlashInputElement }),
];
