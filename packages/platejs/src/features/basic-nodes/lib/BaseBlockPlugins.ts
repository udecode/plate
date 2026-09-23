import {
  BaseParagraphPlugin,
  defineInputRule,
  definePlugin,
  matchBlockStart,
  type InsertTextInputRuleReadContext,
  type MarkdownDecodeContext,
  ElementApi,
  PathApi,
  PLUGINS,
  type Location,
  type NodeSelection,
  type StructuralRuleContext,
} from '../../../core';

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
      enabled: (context) => {
        if (enabled && !enabled(context)) return false;

        const { editor } = context;
        const codeBlock = editor.plugin(PLUGINS.codeBlock);

        if (!codeBlock.installed) return true;

        return !editor.read.nodes.some({
          type: codeBlock.schema.type,
        });
      },
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
      resolve: (context) =>
        matchBlockStart(context, {
          match: variant === '_' ? '___' : thematicBreakDashRe,
        }),
      apply: ({ decline, editor, tx }) => {
        if (variant === '_') {
          tx.text.deleteBackward({ unit: 'character' });
        }

        if (
          !tx.blocks.set({
            type: editor.plugin(BaseHorizontalRulePlugin).schema.type,
          })
        ) {
          return decline();
        }
        tx.nodes.insert({
          children: [{ text: '' }],
          type: editor.plugin(BaseParagraphPlugin).schema.type,
        });
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
  codecs: ({ defineCodecs, schema: { type } }) =>
    defineCodecs({
      'text/html': {
        decode: () => ({}),
        encode: ({ content }) => ({ children: content, tag: 'blockquote' }),
        match: [{ tag: 'blockquote' }],
      },

      'text/markdown': {
        from: 'blockquote',
        kind: 'node',
        decode: ({
          decodeNodes,
          decoration,
          registry,
          isBlock,
          isInline,
          node,
        }) => ({
          children: groupInlineChildrenIntoParagraphs(
            decodeNodes(node.children, decoration),
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
    wrap: ({ at }: { at?: Location | NodeSelection } = {}) => {
      for (const [node, path] of tx.nodes.blocks({ at }).toReversed()) {
        if (node.type === type || tx.nodes.above({ at: path, type: plugin })) {
          continue;
        }
        tx.nodes.wrap({ children: [], type }, { at: path });
      }
    },
    toggle: () => {
      tx.blocks.toggle({ type }, { wrap: true });
    },
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
  codecs: ({ defineCodecs, schema: { type } }) =>
    defineCodecs({
      'text/html': {
        decode: () => ({}),
        encode: () => ({ tag: 'hr' }),
        match: [{ tag: 'hr' }],
      },

      'text/markdown': {
        from: 'thematicBreak',
        kind: 'node',
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
  const paragraphType = context.registry.type(PLUGINS.paragraph) ?? 'paragraph';
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
