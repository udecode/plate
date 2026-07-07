import { type PluginConfig, createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

export type HeadingConfig = PluginConfig<
  'heading',
  {
    /** Heading levels supported from 1 to `levels` */
    levels?: HeadingLevel | HeadingLevel[];
  }
>;

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const node = {
  isElement: true,
};

const rules = {
  break: { splitReset: true },
  delete: { start: 'reset' as const },
  merge: { removeEmpty: true },
};

export const BaseH1Plugin = createBasePlugin({
  key: KEYS.h1,
  node,
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'H1' }] } } },
  render: { as: 'h1' },
  rules,
}).extendTx(({ type }) => (tx) => ({
  toggle: () => {
    tx.blocks.toggle(type);
  },
}));

export const BaseH2Plugin = createBasePlugin({
  key: KEYS.h2,
  node,
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'H2' }] } } },
  render: { as: 'h2' },
  rules,
}).extendTx(({ type }) => (tx) => ({
  toggle: () => {
    tx.blocks.toggle(type);
  },
}));

export const BaseH3Plugin = createBasePlugin({
  key: KEYS.h3,
  node,
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'H3' }] } } },
  render: { as: 'h3' },
  rules,
}).extendTx(({ type }) => (tx) => ({
  toggle: () => {
    tx.blocks.toggle(type);
  },
}));

export const BaseH4Plugin = createBasePlugin({
  key: KEYS.h4,
  node,
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'H4' }] } } },
  render: { as: 'h4' },
  rules,
}).extendTx(({ type }) => (tx) => ({
  toggle: () => {
    tx.blocks.toggle(type);
  },
}));

export const BaseH5Plugin = createBasePlugin({
  key: KEYS.h5,
  node,
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'H5' }] } } },
  render: { as: 'h5' },
  rules,
}).extendTx(({ type }) => (tx) => ({
  toggle: () => {
    tx.blocks.toggle(type);
  },
}));

export const BaseH6Plugin = createBasePlugin({
  key: KEYS.h6,
  node,
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'H6' }] } } },
  render: { as: 'h6' },
  rules,
}).extendTx(({ type }) => (tx) => ({
  toggle: () => {
    tx.blocks.toggle(type);
  },
}));

/** Enables support for headings with configurable levels (from 1 to 6). */
export const BaseHeadingPlugin = createBasePlugin<HeadingConfig>({
  key: 'heading',
  options: {
    levels: [1, 2, 3, 4, 5, 6],
  },
}).extend(({ plugin }) => {
  const {
    options: { levels },
  } = plugin;

  // Map of heading levels to their corresponding plugins
  const headingPlugins = {
    1: BaseH1Plugin,
    2: BaseH2Plugin,
    3: BaseH3Plugin,
    4: BaseH4Plugin,
    5: BaseH5Plugin,
    6: BaseH6Plugin,
  };

  const headingLevels = Array.isArray(levels)
    ? levels
    : Array.from({ length: levels || 6 }, (_, i) => (i + 1) as HeadingLevel);

  const plugins = headingLevels.map((level) => headingPlugins[level]);

  return {
    plugins,
  };
});
