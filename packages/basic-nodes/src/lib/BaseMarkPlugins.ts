import {
  createBasePlugin,
  createRuleFactory,
  someHtmlElement,
} from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS, type TScriptValue } from '@platejs/utils';
import { findHtmlParentElement } from '@udecode/utils';

export const BoldRules = {
  markdown: createRuleFactory<{}, { variant: '*' | '_' }>({
    type: 'mark',
    variant: '*',
    end: ({ variant }) => variant,
    start: ({ variant }) => variant.repeat(2),
    trigger: ({ variant }) => variant,
  }),
};

export const CodeRules = {
  markdown: createRuleFactory({
    type: 'mark',
    start: '`',
    trigger: '`',
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

export const ItalicRules = {
  markdown: createRuleFactory<{}, { variant: '*' | '_' }>({
    type: 'mark',
    variant: '*',
    start: ({ variant }) => variant,
    trigger: ({ variant }) => variant,
  }),
};

export const ScriptRules = {
  markdown: createRuleFactory<{ value: TScriptValue }>({
    type: 'mark',
    start: ({ value }) => (value === 'sub' ? '~' : '^'),
    trigger: ({ value }) => (value === 'sub' ? '~' : '^'),
    value: ({ value }) => value,
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

export const UnderlineRules = {
  markdown: createRuleFactory({
    type: 'mark',
    end: '_',
    start: '__',
    trigger: '_',
  }),
};

type MarkComboVariant =
  | 'boldItalic'
  | 'boldUnderline'
  | 'boldItalicUnderline'
  | 'italicUnderline';

/** Markdown rules that atomically apply combinations of independent marks. */
export const MarkComboRules = {
  markdown: createRuleFactory<{ variant: MarkComboVariant }>({
    type: 'mark',
    end: ({ variant }) =>
      ({
        boldItalic: '*',
        boldItalicUnderline: '**',
        boldUnderline: '*',
        italicUnderline: '*',
      })[variant],
    marks: ({ variant }) =>
      ({
        boldItalic: [KEYS.bold, KEYS.italic],
        boldItalicUnderline: [KEYS.underline, KEYS.bold, KEYS.italic],
        boldUnderline: [KEYS.underline, KEYS.bold],
        italicUnderline: [KEYS.underline, KEYS.italic],
      })[variant],
    start: ({ variant }) =>
      ({
        boldItalic: '**',
        boldItalicUnderline: '___',
        boldUnderline: '__',
        italicUnderline: '__',
      })[variant],
    trigger: () => '*',
  }),
};

/** Enables support for bold formatting. */
export const BaseBoldPlugin = createBasePlugin({
  key: KEYS.bold,
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) =>
          someHtmlElement(element, (node) => node.style.fontWeight === 'normal')
            ? undefined
            : true,
        encode: ({ value }) => (value ? { tag: 'strong' } : null),
        match: [
          { tag: ['strong', 'b'] },
          { style: { fontWeight: ['600', '700', 'bold'] } },
        ],
      },
    }),
  render: { as: 'strong' },
  update: ({ tx, type }) => ({
    toggle: () => {
      tx.marks.toggle(type);
    },
  }),
});

/** Enables support for code formatting. */
export const BaseCodePlugin = createBasePlugin({
  key: KEYS.code,
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => {
          const blockAbove = findHtmlParentElement(element, 'P');

          return blockAbove?.style.fontFamily === 'Consolas' ||
            findHtmlParentElement(element, 'PRE')
            ? undefined
            : true;
        },
        encode: ({ value }) => (value ? { tag: 'code' } : null),
        match: [{ tag: 'code' }, { style: { fontFamily: 'Consolas' } }],
      },
    }),
  render: { as: 'code' },
  rules: { selection: { affinity: 'hard' } },
  update: ({ tx, type }) => ({
    toggle: () => {
      tx.marks.toggle(type);
    },
  }),
});

/**
 * Enables support for highlights, useful when reviewing content or highlighting
 * it for future reference.
 */
export const BaseHighlightPlugin = createBasePlugin({
  key: KEYS.highlight,
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: () => true,
        encode: ({ value }) => (value ? { tag: 'mark' } : null),
        match: [{ tag: 'mark' }],
      },
    }),
  render: { as: 'mark' },
  rules: { selection: { affinity: 'directional' } },
  update: ({ tx, type }) => ({
    toggle: () => {
      tx.marks.toggle(type);
    },
  }),
});

/** Enables support for italic formatting. */
export const BaseItalicPlugin = createBasePlugin({
  key: KEYS.italic,
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) =>
          someHtmlElement(element, (node) => node.style.fontStyle === 'normal')
            ? undefined
            : true,
        encode: ({ value }) => (value ? { tag: 'em' } : null),
        match: [{ tag: ['em', 'i'] }, { style: { fontStyle: 'italic' } }],
      },
    }),
  render: { as: 'em' },
  update: ({ tx, type }) => ({
    toggle: () => {
      tx.marks.toggle(type);
    },
  }),
});

/** Enables support for keyboard-input formatting. */
export const BaseKbdPlugin = createBasePlugin({
  key: KEYS.kbd,
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: () => true,
        encode: ({ value }) => (value ? { tag: 'kbd' } : null),
        match: [{ tag: 'kbd' }],
      },
    }),
  render: { as: 'kbd' },
  rules: { selection: { affinity: 'hard' } },
  update: ({ tx, type }) => ({
    toggle: () => {
      tx.marks.toggle(type);
    },
  }),
});

/** Enables subscript and superscript through one enum-valued mark. */
export const BaseScriptPlugin = createBasePlugin({
  key: KEYS.script,
  schema: {
    mark: property.enum(['sub', 'sup']),
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) =>
          element.tagName === 'SUB' || element.style.verticalAlign === 'sub'
            ? 'sub'
            : 'sup',
        encode: ({ value }) => {
          if (value === 'sub') return { tag: 'sub' };
          if (value === 'sup') return { tag: 'sup' };

          return null;
        },
        match: [
          { tag: 'sub' },
          { tag: 'sup' },
          { style: { verticalAlign: 'sub' } },
          { style: { verticalAlign: 'super' } },
        ],
      },
    }),
  rules: { selection: { affinity: 'directional' } },
  update: ({ tx, type }) => ({
    toggle: (value: TScriptValue) => {
      tx.marks.toggle(type, value);
    },
  }),
});

/** Enables support for strikethrough formatting. */
export const BaseStrikethroughPlugin = createBasePlugin({
  key: KEYS.strikethrough,
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) =>
          someHtmlElement(
            element,
            (node) => node.style.textDecoration === 'none'
          )
            ? undefined
            : true,
        encode: ({ value }) => (value ? { tag: 's' } : null),
        match: [
          { tag: ['s', 'del', 'strike'] },
          { style: { textDecoration: 'line-through' } },
        ],
      },
    }),
  render: { as: 's' },
  rules: { selection: { affinity: 'directional' } },
  update: ({ tx, type }) => ({
    toggle: () => {
      tx.marks.toggle(type);
    },
  }),
});

/** Enables support for underline formatting. */
export const BaseUnderlinePlugin = createBasePlugin({
  key: KEYS.underline,
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) =>
          someHtmlElement(
            element,
            (node) => node.style.textDecoration === 'none'
          )
            ? undefined
            : true,
        encode: ({ value }) => (value ? { tag: 'u' } : null),
        match: [{ tag: 'u' }, { style: { textDecoration: 'underline' } }],
      },
    }),
  render: { as: 'u' },
  update: ({ tx, type }) => ({
    toggle: () => {
      tx.marks.toggle(type);
    },
  }),
});
