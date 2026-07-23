import {
  type BasePluginConfig,
  type PluginConfig,
  createBasePlugin,
} from '@platejs/core';
import { schema } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export type HeadingConfig = PluginConfig<
  'heading',
  {
    /** Heading levels supported from 1 to `levels` */
    levels?: HeadingLevel | readonly HeadingLevel[];
  }
>;

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const DEFAULT_HEADING_LEVELS: readonly HeadingLevel[] = [1, 2, 3, 4, 5, 6];

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
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'H1' }] } } },
  render: { as: 'h1' },
  rules,
  schema: headingSchema,
}).extendTx(({ type }) => (tx) => ({
  toggle: () => {
    tx.blocks.toggle(type);
  },
}));

export const BaseH2Plugin = createBasePlugin({
  key: KEYS.h2,
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'H2' }] } } },
  render: { as: 'h2' },
  rules,
  schema: headingSchema,
}).extendTx(({ type }) => (tx) => ({
  toggle: () => {
    tx.blocks.toggle(type);
  },
}));

export const BaseH3Plugin = createBasePlugin({
  key: KEYS.h3,
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'H3' }] } } },
  render: { as: 'h3' },
  rules,
  schema: headingSchema,
}).extendTx(({ type }) => (tx) => ({
  toggle: () => {
    tx.blocks.toggle(type);
  },
}));

export const BaseH4Plugin = createBasePlugin({
  key: KEYS.h4,
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'H4' }] } } },
  render: { as: 'h4' },
  rules,
  schema: headingSchema,
}).extendTx(({ type }) => (tx) => ({
  toggle: () => {
    tx.blocks.toggle(type);
  },
}));

export const BaseH5Plugin = createBasePlugin({
  key: KEYS.h5,
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'H5' }] } } },
  render: { as: 'h5' },
  rules,
  schema: headingSchema,
}).extendTx(({ type }) => (tx) => ({
  toggle: () => {
    tx.blocks.toggle(type);
  },
}));

export const BaseH6Plugin = createBasePlugin({
  key: KEYS.h6,
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'H6' }] } } },
  render: { as: 'h6' },
  rules,
  schema: headingSchema,
}).extendTx(({ type }) => (tx) => ({
  toggle: () => {
    tx.blocks.toggle(type);
  },
}));

/** Enables support for headings with configurable levels (from 1 to 6). */
export const BaseHeadingPlugin = createBasePlugin<HeadingConfig>({
  options: {
    levels: [1, 2, 3, 4, 5, 6],
  },
  key: 'heading',
}).extend(({ getOptions }) => {
  const { levels } = getOptions();

  // Map of heading levels to their corresponding plugins
  const headingPlugins = {
    1: BaseH1Plugin,
    2: BaseH2Plugin,
    3: BaseH3Plugin,
    4: BaseH4Plugin,
    5: BaseH5Plugin,
    6: BaseH6Plugin,
  };

  const headingLevels: readonly HeadingLevel[] =
    typeof levels === 'number'
      ? DEFAULT_HEADING_LEVELS.slice(0, levels)
      : (levels ?? DEFAULT_HEADING_LEVELS);

  const plugins = headingLevels.map((level) => headingPlugins[level]);

  return {
    plugins,
  };
});
