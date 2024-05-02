import React, { ComponentType, SVGProps } from 'react';
import { withRef } from '@udecode/cn';
import {
  PlateEditor,
  PlateElement,
  toggleNodeType,
} from '@udecode/plate-common';
import { ELEMENT_H1, ELEMENT_H2, ELEMENT_H3 } from '@udecode/plate-heading';
import { ListStyleType, toggleIndentList } from '@udecode/plate-indent-list';

import { Icons } from '@/components/icons';

import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxInput,
  InlineComboboxItem,
} from './inline-combobox';

interface SlashCommandRule {
  value: string;
  keywords?: string[];
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  onSelect: (editor: PlateEditor) => void;
}

const rules: SlashCommandRule[] = [
  {
    value: 'Heading 1',
    icon: Icons.h1,
    onSelect: (editor) => {
      toggleNodeType(editor, { activeType: ELEMENT_H1 });
    },
  },
  {
    value: 'Heading 2',
    icon: Icons.h2,
    onSelect: (editor) => {
      toggleNodeType(editor, { activeType: ELEMENT_H2 });
    },
  },
  {
    value: 'Heading 3',
    icon: Icons.h3,
    onSelect: (editor) => {
      toggleNodeType(editor, { activeType: ELEMENT_H3 });
    },
  },
  {
    value: 'Bulleted list',
    icon: Icons.ul,
    keywords: ['ul', 'unordered list'],
    onSelect: (editor) => {
      toggleIndentList(editor, {
        listStyleType: ListStyleType.Disc,
      });
    },
  },
  {
    value: 'Numbered list',
    icon: Icons.ol,
    keywords: ['ol', 'ordered list'],
    onSelect: (editor) => {
      toggleIndentList(editor, {
        listStyleType: ListStyleType.Decimal,
      });
    },
  },
];

export const SlashInputElement = withRef<typeof PlateElement>(
  ({ className, ...props }, ref) => {
    const { children, element, editor } = props;

    return (
      <PlateElement
        as="span"
        ref={ref}
        data-slate-value={element.value}
        {...props}
      >
        <InlineCombobox trigger="/">
          <InlineComboboxInput />

          <InlineComboboxContent>
            <InlineComboboxEmpty>
              No matching commands found
            </InlineComboboxEmpty>

            {rules.map(({ value, keywords, icon: Icon, onSelect }) => (
              <InlineComboboxItem
                key={value}
                value={value}
                keywords={keywords}
                onClick={() => onSelect(editor)}
              >
                <Icon className="mr-2 size-4" aria-hidden />
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
