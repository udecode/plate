import {
  BaseParagraphPlugin,
  defineInputRule,
  definePlugin,
  matchBlockStart,
  type InsertTextInputRuleReadContext,
  type MarkdownDecodeContext,
  ElementApi,
  NodeApi,
  PathApi,
  PLUGINS,
  type Location,
  type NodeSelection,
  type StructuralRuleContext,
  TextApi,
  txLocate,
  locateAt,
} from '../../../core';
import { getMarkdownParagraphType } from '../../../internal/plugin/markdownParagraph';

const thematicBreakDashRe = /^(--|—)$/;

export const BlockquoteRules = {
  markdown: ({
    enabled,
    marker = '>',
    priority,
  }: {
    enabled?: (context: InsertTextInputRuleReadContext) => boolean;
    marker?: string;
    priority?: number;
  } = {}) =>
    defineInputRule({
      target: 'insertText',
      trigger: ' ',
      priority,
      enabled,
      resolve: (context) => {
        const match = matchBlockStart(context, { match: marker });
        const blockEntry = context.getBlockEntry();

        return match && blockEntry
          ? { ...match, blockPath: blockEntry[1] }
          : undefined;
      },
      apply: ({ decline, editor, tx }, match) => {
        const block = tx.nodes.get(match.blockPath);
        const { type } = editor.plugin(BaseBlockquotePlugin).schema;

        if (!block || !ElementApi.isElement(block[0])) return decline();

        tx.text.delete({ at: match.range });
        if (!tx.nodes.wrap({ children: [], type }, { at: match.blockPath })) {
          return decline();
        }
        return undefined;
      },
    }),
};

export const HorizontalRuleRules = {
  markdown: ({
    enabled,
    priority,
    variant = '-',
  }: {
    enabled?: (context: InsertTextInputRuleReadContext) => boolean;
    priority?: number;
    variant?: '-' | '_';
  } = {}) =>
    defineInputRule({
      target: 'insertText',
      trigger: variant === '_' ? ' ' : '-',
      enabled,
      priority,
      resolve: (context) => {
        const block = context.getBlockEntry();
        const match = matchBlockStart(context, {
          match: variant === '_' ? '___' : thematicBreakDashRe,
        });

        return block &&
          match &&
          block[0].children.every((child) => TextApi.isText(child)) &&
          NodeApi.string(block[0]) === context.getBlockStartText()
          ? { ...match, path: block[1] }
          : undefined;
      },
      apply: ({ decline, editor, tx }, match) => {
        tx.text.delete({ at: match.range });

        if (
          !tx.blocks.set({
            type: editor.plugin(BaseHorizontalRulePlugin).schema.type,
          })
        ) {
          return decline();
        }

        tx.break.insert();

        const selection = tx.selection();
        const next = selection && tx.nodes.block({ at: selection.focus });

        return next &&
          !tx.schema.isVoid(next[0]) &&
          PathApi.isCommon(PathApi.next(match.path), next[1])
          ? undefined
          : decline();
      },
    }),
};

/** Enables support for block quotes, useful for quotations and passages. */
export const BaseBlockquotePlugin = definePlugin(PLUGINS.blockquote, {
  schema: ({ plugins }) => ({
    element: {
      content: plugins.blockContent({
        default: BaseParagraphPlugin,
        min: 1,
      }),
    },
  }),
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      plainText: {
        encode: ({ children }) =>
          children
            .split('\n')
            .map((line) => `> ${line}`)
            .join('\n'),
      },
      html: {
        decode: () => ({}),
        encode: ({ content }) => ({ children: content, tag: 'blockquote' }),
        match: [{ tag: 'blockquote' }],
      },

      markdown: {
        node: 'blockquote',
        decode: ({
          decodeNodes,
          marks,
          registry,
          isBlock,
          isInline,
          node,
        }) => ({
          children: groupInlineChildrenIntoParagraphs(
            decodeNodes(node.children, marks),
            { isBlock, isInline, registry }
          ),
          type,
        }),
        encode: ({ encodeBlocks, isBlock, isInline, node, registry }) => ({
          children: encodeBlocks(
            groupInlineChildrenIntoParagraphs(node.children, {
              isBlock,
              isInline,
              registry,
            })
          ),
          type: 'blockquote',
        }),
      },
    }),
  component: 'blockquote',
  rules: {
    break: {
      empty: (context) =>
        isLiftableBlockquoteChild(context) ? 'lift' : undefined,
    },
    delete: {
      start: (context) => {
        if (!isLiftableBlockquoteChild(context)) return undefined;

        const { editor, node, path, schema } = context;

        if (!editor.read.selection() || !editor.read.nodes.isEmpty(node)) {
          return 'lift';
        }

        const parent = editor.read.nodes.parent(path);

        if (
          !parent ||
          !ElementApi.isElement(parent[0]) ||
          parent[0].type !== schema.type
        ) {
          return 'lift';
        }

        return PathApi.hasPrevious(path) ? undefined : 'lift';
      },
    },
  },
  shortcuts: {
    untab: { keys: 'shift+tab' },
  },
  update: ({ editor, plugin, tx, schema: { type } }) => ({
    wrap: txLocate(
      locateAt(0),
      ({ at }: { at?: Location | NodeSelection } = {}) => {
        for (const [node, path] of tx.nodes.blocks({ at }).toReversed()) {
          if (
            node.type === type ||
            tx.nodes.above({ at: path, type: plugin })
          ) {
            continue;
          }
          tx.nodes.wrap({ children: [], type }, { at: path });
        }
      }
    ),
    toggle: () => tx.blocks.toggle({ type }, { wrap: true }),
    untab: () => {
      const paragraphType = editor.plugin(BaseParagraphPlugin).schema.type;
      const blocks = [
        ...tx.nodes.blocks({
          match: (node, path) =>
            !node.indent &&
            node.type === paragraphType &&
            !node.listType &&
            !!tx.nodes.above({
              at: path,
              type: plugin,
            }),
          mode: 'lowest',
        }),
      ].sort(
        (a, b) =>
          b[1].length - a[1].length ||
          b[1].join('.').localeCompare(a[1].join('.'))
      );

      if (blocks.length === 0) return false;

      for (const [, path] of blocks) {
        tx.nodes.lift({
          at: path,
        });
      }

      return true;
    },
  }),
});

function isLiftableBlockquoteChild({
  editor,
  node,
  path,
  schema,
}: StructuralRuleContext) {
  return (
    node.type === editor.plugin(BaseParagraphPlugin).schema.type &&
    !node.listType &&
    !!editor.read.nodes.above({ at: path, type: schema.type })
  );
}

export const BaseHorizontalRulePlugin = definePlugin(PLUGINS.horizontalRule, {
  schema: {
    element: {
      void: 'block',
    },
  },
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      plainText: {
        encode: () => '---',
      },
      html: {
        decode: () => ({}),
        encode: () => ({ tag: 'hr' }),
        match: [{ tag: 'hr' }],
      },

      markdown: {
        node: 'thematicBreak',
        decode: () => ({
          children: [{ text: '' }],
          type,
        }),
        encode: () => ({ type: 'thematicBreak' as const }),
      },
    }),
  component: 'hr',
});

const groupInlineChildrenIntoParagraphs = (
  children: ReadonlyArray<import('../../../core').Descendant>,
  context: Pick<MarkdownDecodeContext, 'isBlock' | 'isInline' | 'registry'>
) => {
  const paragraphType = getMarkdownParagraphType(context.registry);
  const elements: Array<import('../../../core').Descendant> = [];
  let inlineNodes: Array<import('../../../core').Descendant> = [];

  const flushInlineNodes = () => {
    if (inlineNodes.length === 0) return;

    elements.push({
      children: inlineNodes,
      type: paragraphType,
    });
    inlineNodes = [];
  };

  children.forEach((child) => {
    const isBlock =
      ElementApi.isElement(child) &&
      !context.isInline(child) &&
      context.isBlock(child);

    if (isBlock) {
      flushInlineNodes();
      elements.push(child);
      return;
    }

    inlineNodes.push(child);
  });
  flushInlineNodes();

  return elements.length > 0
    ? elements
    : [{ children: [{ text: '' }], type: paragraphType }];
};
