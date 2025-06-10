import {
  type AnyEditorPlugin,
  type PluginConfig,
  type SlatePlugin,
  createTSlatePlugin,
} from '@udecode/plate';

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
} satisfies Partial<AnyEditorPlugin['node']>;

const rules = {
  break: { splitReset: true },
  merge: { removeEmpty: true },
};

export const BaseH1Plugin = createTSlatePlugin({
  key: 'h1',
  node,
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'H1' }] } } },
  render: { as: 'h1' },
  rules,
}).extendTransforms(({ editor, type }) => ({
  toggle: () => {
    editor.tf.toggleBlock(type);
  },
}));

export const BaseH2Plugin = createTSlatePlugin({
  key: 'h2',
  node,
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'H2' }] } } },
  render: { as: 'h2' },
  rules,
}).extendTransforms(({ editor, type }) => ({
  toggle: () => {
    editor.tf.toggleBlock(type);
  },
}));

export const BaseH3Plugin = createTSlatePlugin({
  key: 'h3',
  node,
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'H3' }] } } },
  render: { as: 'h3' },
  rules,
}).extendTransforms(({ editor, type }) => ({
  toggle: () => {
    editor.tf.toggleBlock(type);
  },
}));

export const BaseH4Plugin = createTSlatePlugin({
  key: 'h4',
  node,
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'H4' }] } } },
  render: { as: 'h4' },
  rules,
}).extendTransforms(({ editor, type }) => ({
  toggle: () => {
    editor.tf.toggleBlock(type);
  },
}));

export const BaseH5Plugin = createTSlatePlugin({
  key: 'h5',
  node,
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'H5' }] } } },
  render: { as: 'h5' },
  rules,
}).extendTransforms(({ editor, type }) => ({
  toggle: () => {
    editor.tf.toggleBlock(type);
  },
}));

export const BaseH6Plugin = createTSlatePlugin({
  key: 'h6',
  node,
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'H6' }] } } },
  render: { as: 'h6' },
  rules,
}).extendTransforms(({ editor, type }) => ({
  toggle: () => {
    editor.tf.toggleBlock(type);
  },
}));

/** Enables support for headings with configurable levels (from 1 to 6). */
export const BaseHeadingPlugin = createTSlatePlugin<HeadingConfig>({
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

  const plugins: SlatePlugin[] = headingLevels.map(
    (level) => headingPlugins[level] as any
  );

  return { plugins };
});
