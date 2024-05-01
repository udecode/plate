import React, { ReactNode } from 'react';
import { withRef } from '@udecode/cn';
import { BaseComboboxItem } from '@udecode/plate-combobox';
import { insertText, PlateElement } from '@udecode/plate-common';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '@udecode/plate-heading';

import { InlineCombobox } from './inline-combobox';

type SlashCommandRule = BaseComboboxItem & {
  icon: ReactNode;
};

const rules: SlashCommandRule[] = [
  {
    value: 'apple',
    label: 'Apple',
    icon: '🍎',
  },
  {
    value: 'banana',
    label: 'Banana',
    icon: '🍌',
  },
  {
    value: 'cherry',
    label: 'Cherry',
    icon: '🍒',
  },
  {
    value: ELEMENT_H1,
    label: 'Heading 1',
    icon: 'H1',
  },
  {
    value: ELEMENT_H2,
    label: 'Heading 2',
    icon: 'H2',
  },
  {
    value: ELEMENT_H3,
    label: 'Heading 3',
    icon: 'H3',
  },
  {
    value: ELEMENT_H4,
    label: 'Heading 4',
    icon: 'H4',
  },
  {
    value: ELEMENT_H5,
    label: 'Heading 5',
    icon: 'H5',
  },
  {
    value: ELEMENT_H6,
    label: 'Heading 6',
    icon: 'H6',
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
        <InlineCombobox
          trigger="/"
          items={rules}
          renderItem={({ icon, label }) => (
            <>
              <span className="mr-2">{icon}</span>
              {label}
            </>
          )}
          renderEmpty="No matching commands found"
          onSelectItem={({ label }) => {
            insertText(editor, 'Selected ' + label);
          }}
        />

        {children}
      </PlateElement>
    );
  }
);
