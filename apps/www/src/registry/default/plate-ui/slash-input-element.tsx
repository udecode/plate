import React, { ComponentType, SVGProps } from 'react';
import { withRef } from '@udecode/cn';
import { BaseComboboxItemWithEditor } from '@udecode/plate-combobox';
import { PlateElement, toggleNodeType } from '@udecode/plate-common';
import { ELEMENT_H1, ELEMENT_H2, ELEMENT_H3 } from '@udecode/plate-heading';
import { ListStyleType, toggleIndentList } from '@udecode/plate-indent-list';

import { Icons } from '@/components/icons';

import { InlineCombobox } from './inline-combobox';

export type SlashCommandRule = BaseComboboxItemWithEditor & {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const rules: SlashCommandRule[] = [
  {
    value: ELEMENT_H1,
    label: 'Heading 1',
    icon: Icons.h1,
    onSelect: (editor) => {
      toggleNodeType(editor, { activeType: ELEMENT_H1 });
    },
  },
  {
    value: ELEMENT_H2,
    label: 'Heading 2',
    icon: Icons.h2,
    onSelect: (editor) => {
      toggleNodeType(editor, { activeType: ELEMENT_H2 });
    },
  },
  {
    value: ELEMENT_H3,
    label: 'Heading 3',
    icon: Icons.h3,
    onSelect: (editor) => {
      toggleNodeType(editor, { activeType: ELEMENT_H3 });
    },
  },
  {
    value: ListStyleType.Disc,
    label: 'Bulleted list',
    icon: Icons.ul,
    aliases: ['ul', 'unordered list'],
    onSelect: (editor) => {
      toggleIndentList(editor, {
        listStyleType: ListStyleType.Disc,
      });
    },
  },
  {
    value: ListStyleType.Decimal,
    label: 'Numbered list',
    icon: Icons.ol,
    aliases: ['ol', 'ordered list'],
    onSelect: (editor) => {
      toggleIndentList(editor, {
        listStyleType: ListStyleType.Decimal,
      });
    },
  },
];

export const SlashInputElement = withRef<typeof PlateElement>(
  ({ className, ...props }, ref) => {
    const { children, element } = props;

    return (
      <PlateElement
        as="span"
        ref={ref}
        data-slate-value={element.value}
        {...props}
      >
        <InlineCombobox
          trigger="/"
          items={rules}
          renderItem={({ icon: Icon, label }) => (
            <>
              <Icon className="mr-2 size-4" aria-hidden />
              {label}
            </>
          )}
          renderEmpty="No matching commands found"
        />

        {children}
      </PlateElement>
    );
  }
);
