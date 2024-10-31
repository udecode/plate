'use client';

import React, { type ComponentType, type SVGProps } from 'react';

import type { PlateEditor } from '@udecode/plate-common/react';

import { withRef } from '@udecode/cn';
import { AIChatPlugin } from '@udecode/plate-ai/react';
import { DatePlugin } from '@udecode/plate-date/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { ListStyleType, toggleIndentList } from '@udecode/plate-indent-list';
import {
  CalendarIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ListIcon,
  ListOrderedIcon,
  SparklesIcon,
} from 'lucide-react';

import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxInput,
  InlineComboboxItem,
} from './inline-combobox';
import { PlateElement } from './plate-element';

interface SlashCommandRule {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  onSelect: (editor: PlateEditor) => void;
  value: string;
  className?: string;
  focusEditor?: boolean;
  keywords?: string[];
}

const rules: SlashCommandRule[] = [
  {
    focusEditor: false,
    icon: SparklesIcon,
    value: 'AI',
    onSelect: (editor) => {
      editor.getApi(AIChatPlugin).aiChat.show();
    },
  },
  {
    icon: Heading1Icon,
    value: 'Heading 1',
    onSelect: (editor) => {
      editor.tf.toggle.block({ type: HEADING_KEYS.h1 });
    },
  },
  {
    icon: Heading2Icon,
    value: 'Heading 2',
    onSelect: (editor) => {
      editor.tf.toggle.block({ type: HEADING_KEYS.h2 });
    },
  },
  {
    icon: Heading3Icon,
    value: 'Heading 3',
    onSelect: (editor) => {
      editor.tf.toggle.block({ type: HEADING_KEYS.h3 });
    },
  },
  {
    icon: ListIcon,
    keywords: ['ul', 'unordered list'],
    value: 'Bulleted list',
    onSelect: (editor) => {
      toggleIndentList(editor, {
        listStyleType: ListStyleType.Disc,
      });
    },
  },
  {
    icon: ListOrderedIcon,
    keywords: ['ol', 'ordered list'],
    value: 'Numbered list',
    onSelect: (editor) => {
      toggleIndentList(editor, {
        listStyleType: ListStyleType.Decimal,
      });
    },
  },
  {
    icon: CalendarIcon,
    keywords: ['inline', 'date'],
    value: 'Date',
    onSelect: (editor) => {
      editor.getTransforms(DatePlugin).insert.date();
    },
  },
];

export const SlashInputElement = withRef<typeof PlateElement>(
  ({ className, ...props }, ref) => {
    const { children, editor, element } = props;

    return (
      <PlateElement
        ref={ref}
        as="span"
        data-slate-value={element.value}
        {...props}
      >
        <InlineCombobox element={element} trigger="/">
          <InlineComboboxInput />

          <InlineComboboxContent>
            <InlineComboboxEmpty>
              No matching commands found
            </InlineComboboxEmpty>

            {rules.map(
              ({ focusEditor, icon: Icon, keywords, value, onSelect }) => (
                <InlineComboboxItem
                  key={value}
                  value={value}
                  onClick={() => onSelect(editor)}
                  focusEditor={focusEditor}
                  keywords={keywords}
                >
                  <Icon className="mr-2 size-4" aria-hidden />
                  {value}
                </InlineComboboxItem>
              )
            )}
          </InlineComboboxContent>
        </InlineCombobox>

        {children}
      </PlateElement>
    );
  }
);
