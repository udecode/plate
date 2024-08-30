import React from 'react';
import { withRef } from '@udecode/cn';
import { PlateElement } from '@udecode/plate-common/react';
import { DatePlugin } from '@udecode/plate-date';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { ListStyleType, toggleIndentList } from '@udecode/plate-indent-list';

import { Icons } from '@/components/icons';

import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxInput,
  InlineComboboxItem,
} from './inline-combobox';

import type { ComponentType, SVGProps } from 'react';
import type { PlateEditor } from '@udecode/plate-common/react';

interface SlashCommandRule {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  onSelect: (editor: PlateEditor) => void;
  value: string;
  keywords?: string[];
}

const rules: SlashCommandRule[] = [
  {
    icon: Icons.h1,
    onSelect: (editor) => {
      editor.tf.toggle.block({ type: HEADING_KEYS.h1 });
    },
    value: 'Heading 1',
  },
  {
    icon: Icons.h2,
    onSelect: (editor) => {
      editor.tf.toggle.block({ type: HEADING_KEYS.h2 });
    },
    value: 'Heading 2',
  },
  {
    icon: Icons.h3,
    onSelect: (editor) => {
      editor.tf.toggle.block({ type: HEADING_KEYS.h3 });
    },
    value: 'Heading 3',
  },
  {
    icon: Icons.ul,
    keywords: ['ul', 'unordered list'],
    onSelect: (editor) => {
      toggleIndentList(editor, {
        listStyleType: ListStyleType.Disc,
      });
    },
    value: 'Bulleted list',
  },
  {
    icon: Icons.ol,
    keywords: ['ol', 'ordered list'],
    onSelect: (editor) => {
      toggleIndentList(editor, {
        listStyleType: ListStyleType.Decimal,
      });
    },
    value: 'Numbered list',
  },
  {
    icon: Icons.add,
    keywords: ['inline', 'date'],
    onSelect: (editor) => {
      editor.getTransforms(DatePlugin).insert.date();
    },
    value: 'Date',
  },
];

export const SlashInputElement = withRef<typeof PlateElement>(
  ({ className, ...props }, ref) => {
    const { children, editor, element } = props;

    return (
      <PlateElement
        as="span"
        data-slate-value={element.value}
        ref={ref}
        {...props}
      >
        <InlineCombobox element={element} trigger="/">
          <InlineComboboxInput />

          <InlineComboboxContent>
            <InlineComboboxEmpty>
              No matching commands found
            </InlineComboboxEmpty>

            {rules.map(({ icon: Icon, keywords, onSelect, value }) => (
              <InlineComboboxItem
                key={value}
                keywords={keywords}
                onClick={() => onSelect(editor)}
                value={value}
              >
                <Icon aria-hidden className="mr-2 size-4" />
                {value}
              </InlineComboboxItem>
            ))}
          </InlineComboboxContent>
        </InlineCombobox>

        {children}
      </PlateElement>
    );
  }
);
