import katex, { type KatexOptions } from 'katex';

import {
  BaseParagraphPlugin,
  createBlockFenceInputRule,
  defineInputRule,
  definePlugin,
  type Editor,
  type ElementOf,
  type InputRuleEditor,
  matchDelimitedInline,
  type NodeInsertOptions,
  type PluginReference,
  RangeApi,
  type SelectionInputRuleContext,
  PLUGINS,
  property,
} from '../../core';

const INLINE_EQUATION_BOUNDARY_RE = /[\s([{'"`]/;
const INLINE_EQUATION_FOLLOW_RE = /[\s)\]}:;,.!?'"`]/;

const getMathExcludedSelectors = (editor: InputRuleEditor<Editor>) => {
  const codeBlock = editor.plugin(PLUGINS.codeBlock);

  return [
    ...(codeBlock.installed ? [codeBlock.schema.type] : []),
    BaseEquationPlugin,
    BaseInlineEquationPlugin,
  ];
};

export const BaseEquationPlugin = definePlugin(PLUGINS.equation, {
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

export const BaseInlineEquationPlugin = definePlugin(PLUGINS.inlineEquation, {
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
}).extend(({ schema: { type } }) => ({
  update: ({ tx }) => ({
    insert: (
      { latex }: { latex?: string } = {},
      options: NodeInsertOptions = {}
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
  type CommonOptions = {
    enabled?: (context: SelectionInputRuleContext) => boolean;
    priority?: number;
  };

  const isEnabled = (
    context: SelectionInputRuleContext,
    enabled: CommonOptions['enabled']
  ) =>
    (!enabled || enabled(context)) &&
    !context.editor.read.nodes.some({
      type: getMathExcludedSelectors(context.editor),
    });

  const blockRule = ({
    block = BaseParagraphPlugin,
    enabled,
    fence = '$$',
    on,
    priority = 100,
  }: CommonOptions & {
    block?: PluginReference | string;
    fence?: string;
    on: 'break' | 'match';
  }) =>
    createBlockFenceInputRule({
      block,
      fence,
      on,
      priority,
      enabled: (context) => isEnabled(context, enabled),
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
      },
    });

  const inline = ({ enabled, priority }: CommonOptions = {}) =>
    defineInputRule(BaseInlineEquationPlugin, {
      target: 'insertText',
      trigger: '$',
      priority,
      enabled: (context) => isEnabled(context, enabled),
      resolve: (context) => {
        const target = context.options?.at;
        const selection = context.editor.read.selection();

        if (
          target &&
          (!selection ||
            !RangeApi.isRange(target) ||
            !RangeApi.equals(target, selection))
        ) {
          return undefined;
        }

        const match = matchDelimitedInline(context, {
          boundaryRe: INLINE_EQUATION_BOUNDARY_RE,
          followRe: INLINE_EQUATION_FOLLOW_RE,
          open: '$',
          requireClosingDelimiter: false,
          trim: 'reject',
        });

        if (!match) return undefined;

        return {
          deleteRange: match.deleteRange,
          latex: match.content,
        } satisfies InlineMathMatch;
      },
      apply: ({ editor, tx }, match) => {
        tx.text.delete({ at: match.deleteRange });
        tx.selection.set(match.deleteRange.anchor);
        tx.nodes.insert({
          children: [{ text: '' }],
          latex: match.latex,
          type: editor.plugin(BaseInlineEquationPlugin).schema.type,
        });
      },
    });

  return {
    markdown: (
      options:
        | (NonNullable<Parameters<typeof inline>[0]> & { variant: '$' })
        | (Parameters<typeof blockRule>[0] & { variant: '$$' })
    ) => {
      if (options.variant === '$$') {
        const { variant: _, ...ruleOptions } = options;

        return blockRule(ruleOptions);
      }

      const { variant: _, ...ruleOptions } = options;

      return inline(ruleOptions);
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
