import {
  BaseParagraphPlugin,
  type BaseEditor,
  type BlockFenceInputRuleMatch,
  defineBasePlugin,
  createRuleFactory,
  matchDelimitedInline,
} from '@platejs/core';
import {
  type ElementOf,
  type NodeInsertNodesOptions,
  property,
} from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';
import katex, { type KatexOptions } from 'katex';

const INLINE_EQUATION_BOUNDARY_RE = /[\s([{'"`]/;
const INLINE_EQUATION_FOLLOW_RE = /[\s)\]}:;,.!?'"`]/;

const getMathExcludedTypes = (editor: BaseEditor) =>
  [PLUGINS.codeBlock, PLUGINS.equation, PLUGINS.inlineEquation]
    .map((name) => editor.plugin(name))
    .filter((plugin) => plugin.installed)
    .map((plugin) => plugin.schema.type);

export const BaseEquationPlugin = defineBasePlugin(PLUGINS.equation, {
  codecs: ({ defineCodecs, schema: { type } }) =>
    defineCodecs({
      'text/markdown': {
        from: 'math',
        kind: 'node',
        decode: ({ node }) => ({
          children: [{ text: '' }],
          texExpression: node.value,
          type,
        }),
        encode: ({ node }) => ({
          type: 'math',
          value: node.texExpression ?? '',
        }),
      },
    }),
  schema: {
    element: {
      properties: {
        texExpression: property.string({ default: '', omitDefault: false }),
      },
      void: 'block',
    },
  },
});

export const BaseInlineEquationPlugin = defineBasePlugin(
  PLUGINS.inlineEquation,
  {
    codecs: ({ defineCodecs, schema: { type } }) =>
      defineCodecs({
        'text/markdown': {
          from: 'inlineMath',
          kind: 'node',
          decode: ({ node }) => ({
            children: [{ text: '' }],
            texExpression: node.value,
            type,
          }),
          encode: ({ node }) => ({
            type: 'inlineMath',
            value: node.texExpression ?? '',
          }),
        },
      }),
    schema: {
      element: {
        properties: { texExpression: property.string({ required: true }) },
        void: 'inline',
      },
    },
  }
).extend(({ plugin, schema: { type } }) => {
  type InlineEquation = ElementOf<typeof plugin>;

  return {
    update: ({ tx }) => ({
      insert: (
        { texExpression }: { texExpression?: string } = {},
        options: NodeInsertNodesOptions<InlineEquation> = {}
      ) => {
        tx.nodes.insert(
          {
            children: [{ text: '' }],
            texExpression: texExpression ?? tx.text.string(),
            type,
          },
          options
        );
      },
    }),
  };
});

export type BlockEquationElement = ElementOf<typeof BaseEquationPlugin>;
export type InlineEquationElement = ElementOf<typeof BaseInlineEquationPlugin>;
export type EquationElement = BlockEquationElement | InlineEquationElement;

type InlineMathMatch = {
  deleteRange: NonNullable<
    ReturnType<typeof matchDelimitedInline>
  >['deleteRange'];
  texExpression: string;
};

export const MathRules = (() => {
  const block = createRuleFactory(BaseEquationPlugin)<
    { on: 'break' | 'match' },
    {},
    BlockFenceInputRuleMatch
  >({
    type: 'blockFence',
    apply: ({ editor, tx }, match) => {
      tx.nodes.remove({ at: match.path });
      tx.nodes.insert(
        {
          children: [{ text: '' }],
          texExpression: '',
          type: editor.plugin(BaseEquationPlugin).schema.type,
        },
        {
          at: match.path,
          select: true,
        }
      );

      return true;
    },
    block: BaseParagraphPlugin,
    fence: '$$',
    on: ({ on }) => on,
    priority: 100,
  });
  const inline = createRuleFactory(BaseInlineEquationPlugin)<
    {},
    {},
    InlineMathMatch
  >({
    type: 'insertText',
    apply: ({ editor, tx }, match) => {
      tx.text.delete({
        at: match.deleteRange,
      });
      tx.selection.set(match.deleteRange.anchor);
      tx.nodes.insert({
        children: [{ text: '' }],
        texExpression: match.texExpression,
        type: editor.plugin(BaseInlineEquationPlugin).schema.type,
      });

      return true;
    },
    resolve: (context) => {
      if (context.text !== '$' || context.options?.at) return;

      const match = matchDelimitedInline(context, {
        boundaryRe: INLINE_EQUATION_BOUNDARY_RE,
        followRe: INLINE_EQUATION_FOLLOW_RE,
        open: '$',
        requireClosingDelimiter: false,
        trim: 'reject',
      });

      if (!match) return;

      return {
        deleteRange: match.deleteRange,
        texExpression: match.content,
      };
    },
    trigger: '$',
  });

  return {
    markdown: (
      options:
        | (NonNullable<Parameters<typeof inline>[0]> & { variant: '$' })
        | (Parameters<typeof block>[0] & { variant: '$$' })
    ) => {
      if (options.variant === '$$') {
        const { variant: _, ...ruleOptions } = options;
        const rule = block(ruleOptions);

        if (rule.target === 'insertBreak') {
          const enabled = rule.enabled;

          rule.enabled = (context) =>
            (enabled?.(context) ?? true) &&
            !context.editor.read.nodes.some({
              match: { type: getMathExcludedTypes(context.editor) },
            });
        }

        if (rule.target === 'insertText') {
          const enabled = rule.enabled;

          rule.enabled = (context) =>
            (enabled?.(context) ?? true) &&
            !context.editor.read.nodes.some({
              match: { type: getMathExcludedTypes(context.editor) },
            });
        }

        return rule;
      }

      const { variant: _, ...ruleOptions } = options;
      const rule = inline(ruleOptions);
      const enabled = rule.enabled;

      rule.enabled = (context) =>
        (enabled?.(context) ?? true) &&
        !context.editor.read.nodes.some({
          match: { type: getMathExcludedTypes(context.editor) },
        });

      return rule;
    },
  };
})();

export const getEquationHtml = ({
  element,
  options,
}: {
  element: EquationElement;
  options?: KatexOptions;
}) => katex.renderToString(element.texExpression, options);
