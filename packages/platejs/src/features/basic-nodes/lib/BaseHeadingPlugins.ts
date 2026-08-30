import {
  type BasePluginDefinitionInput,
  createRuleFactory,
  defineBasePlugin,
  property,
  schema,
  PLUGINS,
} from '../../../core';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type ToggleHeadingOptions = {
  level: HeadingLevel;
};

const isHeadingLevel = (value: unknown): value is HeadingLevel =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  value >= 1 &&
  value <= 6;

const rules = {
  break: { splitReset: true },
  delete: { start: 'reset' },
  merge: { removeEmpty: true },
} satisfies NonNullable<BasePluginDefinitionInput['rules']>;

export const BaseHeadingPlugin = defineBasePlugin(PLUGINS.heading, {
  schema: {
    element: {
      ...schema.element.textBlock(),
      properties: {
        level: property.json({
          required: true,
          validate: isHeadingLevel,
          validationVersion: 1,
        }),
      },
    },
  },
  codecs: ({ defineCodecs, schema: { type } }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => ({
          level: Number(element.tagName.slice(1)) as HeadingLevel,
        }),
        encode: ({ content, node }) => ({
          children: content,
          tag: `h${node.level}`,
        }),
        match: [{ tag: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
      },

      'text/markdown': {
        from: 'heading',
        kind: 'node',
        decode: ({ decode, decoration, node }) =>
          isHeadingLevel(node.depth)
            ? {
                children: decode(node.children, decoration),
                level: node.depth,
                type,
              }
            : undefined,
        encode: ({ encodePhrasing, node }) => ({
          children: encodePhrasing(node.children),
          depth: node.level,
          type: 'heading',
        }),
      },
    }),

  render: {
    nodeProps: ({ element }) => ({ as: `h${String(element.level)}` }),
  },
  rules,
  update: ({ tx, schema: { type } }) => ({
    toggle: ({ level }: ToggleHeadingOptions) => {
      tx.blocks.toggle({ level, type });
    },
  }),
});

export const HeadingRules = {
  markdown: createRuleFactory(BaseHeadingPlugin)<
    {},
    {},
    { level: HeadingLevel }
  >({
    type: 'blockStart',
    trigger: ' ',
    match: /^(#{1,6})$/,
    resolveMatch: ({ match }) => {
      const level = (match as RegExpMatchArray)[1].length;

      return isHeadingLevel(level) ? { level } : undefined;
    },
    apply: ({ tx }, match) => {
      tx.text.delete({ at: match.range });
      tx.heading.toggle({ level: match.level });

      return true;
    },
  }),
};
