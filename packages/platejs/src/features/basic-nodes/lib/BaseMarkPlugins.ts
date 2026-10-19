import {
  definePlugin,
  createMarkInputRule,
  type MarkInputRuleConfig,
  property,
  PLUGINS,
} from '../../../core';
import { someHtmlElement } from '../../../lib/plugins/html/htmlDom';

const findHtmlParentElement = (
  element: HTMLElement | null,
  nodeName: string
): HTMLElement | null => {
  if (!element || element.nodeName === nodeName) return element;

  return findHtmlParentElement(element.parentElement, nodeName);
};

const scriptValues = ['sub', 'sup'] as const;

export type ScriptValue = (typeof scriptValues)[number];

type MarkdownMarkRuleOptions = Pick<
  MarkInputRuleConfig,
  'enabled' | 'priority'
>;

export const BoldRules = {
  markdown: ({
    variant = '*',
    ...options
  }: MarkdownMarkRuleOptions & { variant?: '*' | '_' } = {}) =>
    createMarkInputRule({
      ...options,
      end: variant,
      start: variant.repeat(2),
      trigger: variant,
    }),
};

export const CodeRules = {
  markdown: (options: MarkdownMarkRuleOptions = {}) =>
    createMarkInputRule({
      ...options,
      start: '`',
      trigger: '`',
    }),
};

export const HighlightRules = {
  markdown: ({
    variant = '==',
    ...options
  }: MarkdownMarkRuleOptions & { variant?: '==' | '≡' } = {}) =>
    createMarkInputRule({
      ...options,
      end: variant === '≡' ? undefined : '=',
      start: variant === '≡' ? '≡' : '==',
      trigger: variant === '≡' ? '≡' : '=',
    }),
};

export const ItalicRules = {
  markdown: ({
    variant = '*',
    ...options
  }: MarkdownMarkRuleOptions & { variant?: '*' | '_' } = {}) =>
    createMarkInputRule({
      ...options,
      start: variant,
      trigger: variant,
    }),
};

export const ScriptRules = {
  markdown: ({
    value,
    ...options
  }: MarkdownMarkRuleOptions & {
    value: ScriptValue;
  }) =>
    createMarkInputRule({
      ...options,
      start: value === 'sub' ? '~' : '^',
      trigger: value === 'sub' ? '~' : '^',
      value,
    }),
};

export const StrikethroughRules = {
  markdown: (options: MarkdownMarkRuleOptions = {}) =>
    createMarkInputRule({
      ...options,
      end: '~',
      start: '~~',
      trigger: '~',
    }),
};

export const UnderlineRules = {
  markdown: (options: MarkdownMarkRuleOptions = {}) =>
    createMarkInputRule({
      ...options,
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
  markdown: ({
    variant,
    ...options
  }: MarkdownMarkRuleOptions & {
    variant: MarkComboVariant;
  }) =>
    createMarkInputRule({
      ...options,
      end: {
        boldItalic: '*',
        boldItalicUnderline: '**',
        boldUnderline: '*',
        italicUnderline: '*',
      }[variant],
      marks: {
        boldItalic: ['bold', 'italic'],
        boldItalicUnderline: ['underline', 'bold', 'italic'],
        boldUnderline: ['underline', 'bold'],
        italicUnderline: ['underline', 'italic'],
      }[variant],
      start: {
        boldItalic: '**',
        boldItalicUnderline: '___',
        boldUnderline: '__',
        italicUnderline: '__',
      }[variant],
      trigger: '*',
    }),
};

/** Enables support for bold formatting. */
export const BaseBoldPlugin = definePlugin(PLUGINS.bold, {
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  formats: ({ defineFormats }) =>
    defineFormats({
      html: {
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

      markdown: { node: 'strong' },
    }),
  component: 'strong',
});

/** Enables support for code formatting. */
export const BaseCodePlugin = definePlugin(PLUGINS.code, {
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  formats: ({ defineFormats }) =>
    defineFormats({
      html: {
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

      markdown: { node: 'inlineCode' },
    }),
  component: 'code',
  rules: { selection: { affinity: 'hard' } },
});

/**
 * Enables support for highlights, useful when reviewing content or highlighting
 * it for future reference.
 */
export const BaseHighlightPlugin = definePlugin(PLUGINS.highlight, {
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  formats: ({ defineFormats }) =>
    defineFormats({
      html: {
        decode: () => true,
        encode: ({ value }) => (value ? { tag: 'mark' } : null),
        match: [{ tag: 'mark' }],
      },

      markdown: { tag: 'mark' },
    }),
  component: 'mark',
  rules: { selection: { affinity: 'directional' } },
});

/** Enables support for italic formatting. */
export const BaseItalicPlugin = definePlugin(PLUGINS.italic, {
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  formats: ({ defineFormats }) =>
    defineFormats({
      html: {
        decode: ({ element }) =>
          someHtmlElement(element, (node) => node.style.fontStyle === 'normal')
            ? undefined
            : true,
        encode: ({ value }) => (value ? { tag: 'em' } : null),
        match: [{ tag: ['em', 'i'] }, { style: { fontStyle: 'italic' } }],
      },

      markdown: { node: 'emphasis' },
    }),
  component: 'em',
});

/** Enables support for keyboard-input formatting. */
export const BaseKbdPlugin = definePlugin(PLUGINS.kbd, {
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  formats: ({ defineFormats }) =>
    defineFormats({
      html: {
        decode: () => true,
        encode: ({ value }) => (value ? { tag: 'kbd' } : null),
        match: [{ tag: 'kbd' }],
      },

      markdown: { tag: 'kbd' },
    }),
  component: 'kbd',
  rules: { selection: { affinity: 'hard' } },
});

/** Enables subscript and superscript through one enum-valued mark. */
export const BaseScriptPlugin = definePlugin(PLUGINS.script, {
  schema: {
    mark: property.enum(scriptValues),
  },
  formats: ({ defineFormats }) =>
    defineFormats({
      html: {
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

      markdown: [
        { tag: 'sub', value: 'sub' },
        { tag: 'sup', value: 'sup' },
      ],
    }),
  rules: { selection: { affinity: 'directional' } },
});

/** Enables support for strikethrough formatting. */
export const BaseStrikethroughPlugin = definePlugin(PLUGINS.strikethrough, {
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  formats: ({ defineFormats }) =>
    defineFormats({
      html: {
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

      markdown: [{ node: 'delete' }, { tag: 'del' }],
    }),
  component: 's',
  rules: { selection: { affinity: 'directional' } },
});

/** Enables support for underline formatting. */
export const BaseUnderlinePlugin = definePlugin(PLUGINS.underline, {
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  formats: ({ defineFormats }) =>
    defineFormats({
      html: {
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

      markdown: { tag: 'u' },
    }),
  component: 'u',
});
