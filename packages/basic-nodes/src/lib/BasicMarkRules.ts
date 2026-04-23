import { createRuleFactory, KEYS } from 'platejs';

type MarkComboVariant =
  | 'boldItalic'
  | 'boldUnderline'
  | 'boldItalicUnderline'
  | 'italicUnderline';

const MARK_COMBO_CONFIG = {
  boldItalic: {
    end: '*',
    marks: [KEYS.bold, KEYS.italic],
    start: '**',
    trigger: '*',
  },
  boldItalicUnderline: {
    end: '***',
    marks: [KEYS.underline, KEYS.bold, KEYS.italic],
    start: '___',
    trigger: '*',
  },
  boldUnderline: {
    end: '**',
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

export const BoldRules = {
  markdown: createRuleFactory<{}, { variant: '*' | '_' }>({
    type: 'mark',
    variant: '*',
    end: ({ variant }) => variant,
    start: ({ variant }) => variant.repeat(2),
    trigger: ({ variant }) => variant,
  }),
};

export const ItalicRules = {
  markdown: createRuleFactory<{}, { variant: '*' | '_' }>({
    type: 'mark',
    variant: '*',
    start: ({ variant }) => variant,
    trigger: ({ variant }) => variant,
  }),
};

export const UnderlineRules = {
  markdown: createRuleFactory({
    type: 'mark',
    end: '_',
    start: '__',
    trigger: '_',
  }),
};

export const MarkComboRules = {
  markdown: createRuleFactory<{ variant: MarkComboVariant }>({
    type: 'mark',
    end: ({ variant }) => MARK_COMBO_CONFIG[variant].end,
    marks: ({ variant }) => MARK_COMBO_CONFIG[variant].marks,
    start: ({ variant }) => MARK_COMBO_CONFIG[variant].start,
    trigger: ({ variant }) => MARK_COMBO_CONFIG[variant].trigger,
  }),
};

export const CodeRules = {
  markdown: createRuleFactory({
    type: 'mark',
    start: '`',
    trigger: '`',
  }),
};

export const StrikethroughRules = {
  markdown: createRuleFactory({
    type: 'mark',
    end: '~',
    start: '~~',
    trigger: '~',
  }),
};

export const SubscriptRules = {
  markdown: createRuleFactory({
    type: 'mark',
    start: '~',
    trigger: '~',
  }),
};

export const SuperscriptRules = {
  markdown: createRuleFactory({
    type: 'mark',
    start: '^',
    trigger: '^',
  }),
};

export const HighlightRules = {
  markdown: createRuleFactory<{}, { variant: '==' | '≡' }>({
    type: 'mark',
    variant: '==',
    end: ({ variant }) => (variant === '≡' ? undefined : '='),
    start: ({ variant }) => (variant === '≡' ? '≡' : '=='),
    trigger: ({ variant }) => (variant === '≡' ? '≡' : '='),
  }),
};
