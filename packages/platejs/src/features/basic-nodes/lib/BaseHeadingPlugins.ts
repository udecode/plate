import {
  type BasePluginDefinitionInput,
  type Element,
  defineInputRule,
  definePlugin,
  matchBlockStart,
  type InsertTextInputRuleReadContext,
  property,
  schema,
  PLUGINS,
  txLocate,
} from '../../../core';
import { getCompiledPlatePlugin } from '../../../internal/plugin/compilePlateModel';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type ToggleHeadingOptions = {
  level: HeadingLevel;
};

const isHeadingLevel = (value: unknown): value is HeadingLevel =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  value >= 1 &&
  value <= 6;

const levelProps =
  (level: HeadingLevel, type: string, detailsTitleType: string | undefined) =>
  (node: Readonly<Element>) =>
    node.type === detailsTitleType ? { level } : { level, type };

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
        decode: ({ element, registry }) =>
          element.parentElement?.tagName === 'SUMMARY' &&
          registry.has(PLUGINS.detailsSummary)
            ? undefined
            : { level: Number(element.tagName.slice(1)) as HeadingLevel },
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
  read: ({ editor, schema: { type }, state }) => {
    const detailsTitleType = () => {
      const summary = getCompiledPlatePlugin(editor, PLUGINS.detailsSummary);
      const summarySchema = summary ? editor.plugin(summary).schema : undefined;

      return summarySchema && 'type' in summarySchema
        ? summarySchema.type
        : undefined;
    };

    return {
      level: (node: Readonly<Element>): HeadingLevel | undefined =>
        (node.type === type || node.type === detailsTitleType()) &&
        isHeadingLevel(node.level)
          ? node.level
          : undefined,
      /**
       * Whether `setLevel(level)` can apply: the schema lets every selected
       * block take the level where it sits.
       */
      canSetLevel: (level: HeadingLevel) => {
        const blocks = state.nodes.blocks();
        const props = levelProps(level, type, detailsTitleType());
        const root = state.view.root();

        return (
          blocks.length > 0 &&
          blocks.every(([node, path]) =>
            state.schema.canPlace([{ ...node, ...props(node) }], {
              at: path,
              replace: true,
              root,
            })
          )
        );
      },
    };
  },
}).extend(({ read }) => ({
  update: ({ editor, tx, schema: { type } }) => {
    const summary = getCompiledPlatePlugin(editor, PLUGINS.detailsSummary);
    const summarySchema = summary ? editor.plugin(summary).schema : undefined;
    const detailsTitleType =
      summarySchema && 'type' in summarySchema ? summarySchema.type : undefined;
    const setLevel = txLocate(false, (level: HeadingLevel) => {
      const blocks = tx.nodes.blocks();

      if (blocks.length === 0) return false;

      return (
        blocks.every(([node]) => read.level(node) === level) ||
        tx.blocks.set(levelProps(level, type, detailsTitleType))
      );
    });

    return {
      setLevel,
      toggle: txLocate(false, ({ level }: ToggleHeadingOptions) =>
        tx.nodes.blocks().some(([node]) => read.level(node) === level)
          ? tx.blocks.reset({ unset: 'level' })
          : setLevel(level)
      ),
    };
  },
}));

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
        if (
          !block ||
          editor.plugin(BaseHeadingPlugin).read.level(block[0]) === match.level
        ) {
          return decline();
        }

        tx.text.delete({ at: match.range });
        if (!tx.heading.toggle({ level: match.level })) return decline();
        return undefined;
      },
    }),
};
