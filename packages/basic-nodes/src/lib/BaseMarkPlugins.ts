import {
  defineBasePlugin,
  createRuleFactory,
  someHtmlElement,
} from '@platejs/core';
import { property } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';
import { findHtmlParentElement } from '@udecode/utils';

const scriptValues = ['sub', 'sup'] as const;

export type ScriptValue = (typeof scriptValues)[number];

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
  markdown: createRuleFactory<{ value: ScriptValue }>({
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
        boldItalic: ['bold', 'italic'],
        boldItalicUnderline: ['underline', 'bold', 'italic'],
        boldUnderline: ['underline', 'bold'],
        italicUnderline: ['underline', 'italic'],
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
export const BaseBoldPlugin = defineBasePlugin(PLUGINS.bold, {
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  codecs: ({ defineCodecs, schema: { key } }) =>
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

      'text/markdown': {
        from: 'strong',
        kind: 'node',
        mark: true,
        decode: ({ decode, decoration, node }) =>
          decode(node.children, { ...decoration, [key]: true }),
      },
    }),
  render: { as: 'strong' },
});

/** Enables support for code formatting. */
export const BaseCodePlugin = defineBasePlugin(PLUGINS.code, {
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  codecs: ({ defineCodecs, schema: { key } }) =>
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

      'text/markdown': {
        from: 'inlineCode',
        kind: 'node',
        mark: true,
        decode: ({ decoration, node }) => ({
          ...decoration,
          [key]: true,
          text: node.value,
        }),
      },
    }),
  render: { as: 'code' },
  rules: { selection: { affinity: 'hard' } },
});

/**
 * Enables support for highlights, useful when reviewing content or highlighting
 * it for future reference.
 */
export const BaseHighlightPlugin = defineBasePlugin(PLUGINS.highlight, {
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  codecs: ({ defineCodecs, schema: { key } }) =>
    defineCodecs({
      'text/html': {
        decode: () => true,
        encode: ({ value }) => (value ? { tag: 'mark' } : null),
        match: [{ tag: 'mark' }],
      },

      'text/markdown': {
        from: 'mark',
        kind: 'node',
        mark: true,
        decode: ({ decode, decoration, node }) =>
          decode(node.children, { ...decoration, [key]: true }),
        encode: ({ node }) => ({
          attributes: [],
          children: [{ type: 'text', value: node.text }],
          name: 'mark',
          type: 'mdxJsxTextElement',
        }),
      },
    }),
  render: { as: 'mark' },
  rules: { selection: { affinity: 'directional' } },
});

/** Enables support for italic formatting. */
export const BaseItalicPlugin = defineBasePlugin(PLUGINS.italic, {
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  codecs: ({ defineCodecs, schema: { key } }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) =>
          someHtmlElement(element, (node) => node.style.fontStyle === 'normal')
            ? undefined
            : true,
        encode: ({ value }) => (value ? { tag: 'em' } : null),
        match: [{ tag: ['em', 'i'] }, { style: { fontStyle: 'italic' } }],
      },

      'text/markdown': {
        from: 'emphasis',
        kind: 'node',
        mark: true,
        decode: ({ decode, decoration, node }) =>
          decode(node.children, { ...decoration, [key]: true }),
      },
    }),
  render: { as: 'em' },
});

/** Enables support for keyboard-input formatting. */
export const BaseKbdPlugin = defineBasePlugin(PLUGINS.kbd, {
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  codecs: ({ defineCodecs, schema: { key } }) =>
    defineCodecs({
      'text/html': {
        decode: () => true,
        encode: ({ value }) => (value ? { tag: 'kbd' } : null),
        match: [{ tag: 'kbd' }],
      },

      'text/markdown': {
        from: 'kbd',
        kind: 'node',
        mark: true,
        decode: ({ decode, decoration, node }) =>
          decode(node.children, { ...decoration, [key]: true }),
        encode: ({ node }) => ({
          attributes: [],
          children: [{ type: 'text', value: node.text }],
          name: 'kbd',
          type: 'mdxJsxTextElement',
        }),
      },
    }),
  render: { as: 'kbd' },
  rules: { selection: { affinity: 'hard' } },
});

/** Enables subscript and superscript through one enum-valued mark. */
export const BaseScriptPlugin = defineBasePlugin(PLUGINS.script, {
  schema: {
    mark: property.enum(scriptValues),
  },
  codecs: ({ defineCodecs, schema: { key } }) =>
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

      'text/markdown': [
        {
          from: 'sub',
          kind: 'node',
          mark: true,
          decode: ({ decode, decoration, node }) =>
            decode(node.children, { ...decoration, [key]: 'sub' }),
          encode: ({ node }) => ({
            attributes: [],
            children: [{ type: 'text', value: node.text }],
            name: node[key] === 'sub' ? 'sub' : 'sup',
            type: 'mdxJsxTextElement',
          }),
        },
        {
          from: 'sup',
          kind: 'node',
          decode: ({ decode, decoration, node }) =>
            decode(node.children, { ...decoration, [key]: 'sup' }),
        },
      ],
    }),
  rules: { selection: { affinity: 'directional' } },
});

/** Enables support for strikethrough formatting. */
export const BaseStrikethroughPlugin = defineBasePlugin(PLUGINS.strikethrough, {
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  codecs: ({ defineCodecs, schema: { key } }) =>
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

      'text/markdown': [
        {
          from: 'delete',
          kind: 'node',
          mark: true,
          decode: ({ decode, decoration, node }) =>
            decode(node.children, { ...decoration, [key]: true }),
        },
        {
          from: 'del',
          kind: 'node',
          decode: ({ decode, decoration, node }) =>
            decode(node.children, { ...decoration, [key]: true }),
        },
      ],
    }),
  render: { as: 's' },
  rules: { selection: { affinity: 'directional' } },
});

/** Enables support for underline formatting. */
export const BaseUnderlinePlugin = defineBasePlugin(PLUGINS.underline, {
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  codecs: ({ defineCodecs, schema: { key } }) =>
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

      'text/markdown': {
        from: 'u',
        kind: 'node',
        mark: true,
        decode: ({ decode, decoration, node }) =>
          decode(node.children, { ...decoration, [key]: true }),
        encode: ({ node }) => ({
          attributes: [],
          children: [{ type: 'text', value: node.text }],
          name: 'u',
          type: 'mdxJsxTextElement',
        }),
      },
    }),
  render: { as: 'u' },
});
