import {
  type BasePluginDefinitionInput,
  defineBasePlugin,
  createRuleFactory,
} from '@platejs/core';
import { schema } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

const headingTypeRe = /^h([1-6])$/;

const headingSchema = {
  element: schema.element.textBlock(),
};

const rules = {
  break: { splitReset: true },
  delete: { start: 'reset' },
  merge: { removeEmpty: true },
} satisfies NonNullable<BasePluginDefinitionInput['rules']>;

export const HeadingRules = {
  markdown: createRuleFactory({
    type: 'blockStart',
    trigger: ' ',
    match: ({ plugin }) => {
      const match = headingTypeRe.exec(plugin.name);

      if (!match) return;

      return '#'.repeat(Number(match[1]));
    },
  }),
};

export const BaseH1Plugin = defineBasePlugin(PLUGINS.h1, {
  schema: headingSchema,
  codecs: ({ defineCodecs, schema: { type } }) =>
    defineCodecs({
      'text/html': {
        decode: () => ({}),
        encode: ({ content }) => ({ children: content, tag: 'h1' }),
        match: [{ tag: 'h1' }],
      },

      'text/markdown': {
        from: 'heading',
        kind: 'node',
        decode: ({ decode, decoration, node }) =>
          node.depth === 1
            ? { children: decode(node.children, decoration), type }
            : undefined,
        encode: ({ encodePhrasing, node }) => ({
          children: encodePhrasing(node.children),
          depth: 1,
          type: 'heading',
        }),
      },
    }),

  render: { as: 'h1' },
  rules,
});

export const BaseH2Plugin = defineBasePlugin(PLUGINS.h2, {
  schema: headingSchema,
  codecs: ({ defineCodecs, schema: { type } }) =>
    defineCodecs({
      'text/html': {
        decode: () => ({}),
        encode: ({ content }) => ({ children: content, tag: 'h2' }),
        match: [{ tag: 'h2' }],
      },

      'text/markdown': {
        from: 'heading',
        kind: 'node',
        decode: ({ decode, decoration, node }) =>
          node.depth === 2
            ? { children: decode(node.children, decoration), type }
            : undefined,
        encode: ({ encodePhrasing, node }) => ({
          children: encodePhrasing(node.children),
          depth: 2,
          type: 'heading',
        }),
      },
    }),

  render: { as: 'h2' },
  rules,
});

export const BaseH3Plugin = defineBasePlugin(PLUGINS.h3, {
  schema: headingSchema,
  codecs: ({ defineCodecs, schema: { type } }) =>
    defineCodecs({
      'text/html': {
        decode: () => ({}),
        encode: ({ content }) => ({ children: content, tag: 'h3' }),
        match: [{ tag: 'h3' }],
      },

      'text/markdown': {
        from: 'heading',
        kind: 'node',
        decode: ({ decode, decoration, node }) =>
          node.depth === 3
            ? { children: decode(node.children, decoration), type }
            : undefined,
        encode: ({ encodePhrasing, node }) => ({
          children: encodePhrasing(node.children),
          depth: 3,
          type: 'heading',
        }),
      },
    }),

  render: { as: 'h3' },
  rules,
});

export const BaseH4Plugin = defineBasePlugin(PLUGINS.h4, {
  schema: headingSchema,
  codecs: ({ defineCodecs, schema: { type } }) =>
    defineCodecs({
      'text/html': {
        decode: () => ({}),
        encode: ({ content }) => ({ children: content, tag: 'h4' }),
        match: [{ tag: 'h4' }],
      },

      'text/markdown': {
        from: 'heading',
        kind: 'node',
        decode: ({ decode, decoration, node }) =>
          node.depth === 4
            ? { children: decode(node.children, decoration), type }
            : undefined,
        encode: ({ encodePhrasing, node }) => ({
          children: encodePhrasing(node.children),
          depth: 4,
          type: 'heading',
        }),
      },
    }),

  render: { as: 'h4' },
  rules,
});

export const BaseH5Plugin = defineBasePlugin(PLUGINS.h5, {
  schema: headingSchema,
  codecs: ({ defineCodecs, schema: { type } }) =>
    defineCodecs({
      'text/html': {
        decode: () => ({}),
        encode: ({ content }) => ({ children: content, tag: 'h5' }),
        match: [{ tag: 'h5' }],
      },

      'text/markdown': {
        from: 'heading',
        kind: 'node',
        decode: ({ decode, decoration, node }) =>
          node.depth === 5
            ? { children: decode(node.children, decoration), type }
            : undefined,
        encode: ({ encodePhrasing, node }) => ({
          children: encodePhrasing(node.children),
          depth: 5,
          type: 'heading',
        }),
      },
    }),

  render: { as: 'h5' },
  rules,
});

export const BaseH6Plugin = defineBasePlugin(PLUGINS.h6, {
  schema: headingSchema,
  codecs: ({ defineCodecs, schema: { type } }) =>
    defineCodecs({
      'text/html': {
        decode: () => ({}),
        encode: ({ content }) => ({ children: content, tag: 'h6' }),
        match: [{ tag: 'h6' }],
      },

      'text/markdown': {
        from: 'heading',
        kind: 'node',
        decode: ({ decode, decoration, node }) =>
          node.depth === 6
            ? { children: decode(node.children, decoration), type }
            : undefined,
        encode: ({ encodePhrasing, node }) => ({
          children: encodePhrasing(node.children),
          depth: 6,
          type: 'heading',
        }),
      },
    }),

  render: { as: 'h6' },
  rules,
});
