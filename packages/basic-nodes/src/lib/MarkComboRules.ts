import { createRuleFactory } from '@platejs/core';
import { KEYS } from '@platejs/utils';

type MarkComboVariant =
  | 'boldItalic'
  | 'boldUnderline'
  | 'boldItalicUnderline'
  | 'italicUnderline';

const config = {
  boldItalic: {
    end: '*',
    marks: [KEYS.bold, KEYS.italic],
    start: '**',
    trigger: '*',
  },
  boldItalicUnderline: {
    end: '**',
    marks: [KEYS.underline, KEYS.bold, KEYS.italic],
    start: '___',
    trigger: '*',
  },
  boldUnderline: {
    end: '*',
    marks: [KEYS.underline, KEYS.bold],
    start: '__',
    trigger: '*',
  },
  italicUnderline: {
    end: '*',
    marks: [KEYS.underline, KEYS.italic],
    start: '__',
    trigger: '*',
  },
};

/** Markdown rules that atomically apply combinations of independent marks. */
export const MarkComboRules = {
  markdown: createRuleFactory<{ variant: MarkComboVariant }>({
    type: 'mark',
    end: ({ variant }) => config[variant].end,
    marks: ({ variant }) => config[variant].marks,
    start: ({ variant }) => config[variant].start,
    trigger: ({ variant }) => config[variant].trigger,
  }),
};
