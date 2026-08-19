import {
  BaseParagraphPlugin,
  type BaseEditor,
  type BlockFenceInputRuleMatch,
  defineBasePlugin,
  createRuleFactory,
  matchDelimitedInline,
  type PlateNodeInsertOptions,
} from '@platejs/core';
import { type ElementOf, property } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';
import katex, { type KatexOptions } from 'katex';

const INLINE_EQUATION_BOUNDARY_RE = /[\s([{'"`]/;
const INLINE_EQUATION_FOLLOW_RE = /[\s)\]}:;,.!?'"`]/;

const getMathExcludedSelectors = (editor: BaseEditor) => {
  const codeBlock = editor.plugin(PLUGINS.codeBlock);

  return [
    ...(codeBlock.installed ? [codeBlock.schema.type] : []),
    BaseEquationPlugin,
    BaseInlineEquationPlugin,
  ];
};

export const BaseEquationPlugin = defineBasePlugin(PLUGINS.equation, {
  codecs: ({ defineCodecs, schema: { type } }) =>
    defineCodecs({
      'text/markdown': {
        from: 'math',
        kind: 'node',
        decode: ({ node }) => ({
          children: [{ text: '' }],
          latex: node.value,
          type,
        }),
        encode: ({ node }) => ({
          type: 'math',
          value: node.latex,
        }),
      },
    }),
  schema: {
    element: {
      properties: {
        latex: property.string({ default: '', omitDefault: false }),
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
            latex: node.value,
            type,
          }),
          encode: ({ node }) => ({
            type: 'inlineMath',
            value: node.latex,
          }),
        },
      }),
    schema: {
      element: {
        properties: {
          latex: property.string({ default: '', omitDefault: false }),
        },
        void: 'inline',
      },
    },
  }
).extend(({ schema: { type } }) => ({
  update: ({ tx }) => ({
    insert: (
      { latex }: { latex?: string } = {},
      options: PlateNodeInsertOptions = {}
    ) => {
      tx.nodes.insert(
        {
          children: [{ text: '' }],
          latex: latex ?? tx.text.string(),
          type,
        },
        options
      );
    },
  }),
}));

export type BlockEquationElement = ElementOf<typeof BaseEquationPlugin>;
export type InlineEquationElement = ElementOf<typeof BaseInlineEquationPlugin>;
export type EquationElement = BlockEquationElement | InlineEquationElement;

type InlineMathMatch = {
  deleteRange: NonNullable<
    ReturnType<typeof matchDelimitedInline>
  >['deleteRange'];
  latex: string;
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
          latex: '',
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
        latex: match.latex,
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
        latex: match.content,
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
              type: getMathExcludedSelectors(context.editor),
            });
        }

        if (rule.target === 'insertText') {
          const enabled = rule.enabled;

          rule.enabled = (context) =>
            (enabled?.(context) ?? true) &&
            !context.editor.read.nodes.some({
              type: getMathExcludedSelectors(context.editor),
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
          type: getMathExcludedSelectors(context.editor),
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
}) => katex.renderToString(element.latex, options);
