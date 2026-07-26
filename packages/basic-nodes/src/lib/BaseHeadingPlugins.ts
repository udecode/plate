import { type BasePluginConfig, createBasePlugin } from '@platejs/core';
import { schema } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

const headingSchema = {
  element: {
    content: schema.content.any(
      [schema.content.text(), schema.content.group('inline')],
      { default: 'text', min: 1 }
    ),
  },
};

const rules = {
  break: { splitReset: true },
  delete: { start: 'reset' },
  merge: { removeEmpty: true },
} satisfies NonNullable<BasePluginConfig['rules']>;

export const BaseH1Plugin = createBasePlugin({
  key: KEYS.h1,
  schema: headingSchema,
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: () => ({}),
        encode: ({ content }) => ({ children: content, tag: 'h1' }),
        match: [{ tag: 'h1' }],
      },
    }),

  render: { as: 'h1' },
  rules,
  update: ({ tx, type }) => ({
    toggle: () => {
      tx.blocks.toggle(type);
    },
  }),
});

export const BaseH2Plugin = createBasePlugin({
  key: KEYS.h2,
  schema: headingSchema,
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: () => ({}),
        encode: ({ content }) => ({ children: content, tag: 'h2' }),
        match: [{ tag: 'h2' }],
      },
    }),

  render: { as: 'h2' },
  rules,
  update: ({ tx, type }) => ({
    toggle: () => {
      tx.blocks.toggle(type);
    },
  }),
});

export const BaseH3Plugin = createBasePlugin({
  key: KEYS.h3,
  schema: headingSchema,
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: () => ({}),
        encode: ({ content }) => ({ children: content, tag: 'h3' }),
        match: [{ tag: 'h3' }],
      },
    }),

  render: { as: 'h3' },
  rules,
  update: ({ tx, type }) => ({
    toggle: () => {
      tx.blocks.toggle(type);
    },
  }),
});

export const BaseH4Plugin = createBasePlugin({
  key: KEYS.h4,
  schema: headingSchema,
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: () => ({}),
        encode: ({ content }) => ({ children: content, tag: 'h4' }),
        match: [{ tag: 'h4' }],
      },
    }),

  render: { as: 'h4' },
  rules,
  update: ({ tx, type }) => ({
    toggle: () => {
      tx.blocks.toggle(type);
    },
  }),
});

export const BaseH5Plugin = createBasePlugin({
  key: KEYS.h5,
  schema: headingSchema,
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: () => ({}),
        encode: ({ content }) => ({ children: content, tag: 'h5' }),
        match: [{ tag: 'h5' }],
      },
    }),

  render: { as: 'h5' },
  rules,
  update: ({ tx, type }) => ({
    toggle: () => {
      tx.blocks.toggle(type);
    },
  }),
});

export const BaseH6Plugin = createBasePlugin({
  key: KEYS.h6,
  schema: headingSchema,
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: () => ({}),
        encode: ({ content }) => ({ children: content, tag: 'h6' }),
        match: [{ tag: 'h6' }],
      },
    }),

  render: { as: 'h6' },
  rules,
  update: ({ tx, type }) => ({
    toggle: () => {
      tx.blocks.toggle(type);
    },
  }),
});
