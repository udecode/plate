import {
  type BasePluginDefinitionInput,
  defineInputRule,
  definePlugin,
  matchBlockStart,
  type InsertTextInputRuleReadContext,
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
  delete: { empty: 'reset', start: 'reset' },
  merge: { removeEmpty: true },
} satisfies NonNullable<BasePluginDefinitionInput['rules']>;

export const BaseHeadingPlugin = definePlugin(PLUGINS.heading, {
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
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      html: {
        decode: ({ element }) => ({
          level: Number(element.tagName.slice(1)) as HeadingLevel,
        }),
        encode: ({ content, node, preserve }) => {
          preserve('level');

          return { children: content, tag: `h${node.level}` };
        },
        match: [{ tag: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
      },

      markdown: {
        node: 'heading',
        decode: ({ decode, marks, node }) =>
          isHeadingLevel(node.depth)
            ? {
                children: decode(node.children, marks),
                level: node.depth,
                type,
              }
            : undefined,
        encode: ({ encodePhrasing, node, preserve }) => {
          preserve('level');

          return {
            children: encodePhrasing(node.children),
            depth: node.level,
            type: 'heading',
          };
        },
      },
    }),
  rules,
  update: ({ tx, schema: { type } }) => ({
    toggle: ({ level }: ToggleHeadingOptions) =>
      tx.blocks.toggle({ level, type }),
  }),
});

export const HeadingRules = {
  markdown: ({
    enabled,
    priority,
  }: {
    enabled?: (context: InsertTextInputRuleReadContext) => boolean;
    priority?: number;
  } = {}) =>
    defineInputRule(BaseHeadingPlugin, {
      target: 'insertText',
      trigger: ' ',
      enabled,
      priority,
      resolve: (context) =>
        matchBlockStart(context, {
          match: /^(#{1,6})$/,
          resolveMatch: ({ match }) => {
            const level = (match as RegExpMatchArray)[1].length;

            return isHeadingLevel(level) ? { level } : undefined;
          },
        }),
      apply: ({ decline, editor, tx }, match) => {
        const block = tx.nodes.block();
        const { type } = editor.plugin(BaseHeadingPlugin).schema;

        if (
          !block ||
          (block[0].type === type && block[0].level === match.level)
        ) {
          return decline();
        }

        tx.text.delete({ at: match.range });
        if (!tx.heading.toggle({ level: match.level })) return decline();
      },
    }),
};
