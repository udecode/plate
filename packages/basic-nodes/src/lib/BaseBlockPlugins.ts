import {
  BaseParagraphPlugin,
  defineBasePlugin,
  createRuleFactory,
  type MarkdownDecodeContext,
} from '@platejs/core';
import { ElementApi, PathApi } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

const thematicBreakDashRe = /^(--|—)$/;

export const BlockquoteRules = {
  markdown: createRuleFactory<{}, { marker: string }>({
    type: 'blockStart',
    marker: '>',
    trigger: ' ',
    enabled: ({ editor }) => {
      const codeBlock = editor.plugin(PLUGINS.codeBlock);

      if (!codeBlock.installed) return true;

      return !editor.read.nodes.some({
        type: codeBlock.schema.type,
      });
    },
    match: ({ marker }) => marker,
    apply: ({ editor, getBlockEntry, tx }, match) => {
      const blockEntry = getBlockEntry();

      if (!blockEntry) return undefined;

      tx.text.delete({ at: match.range });
      tx.nodes.wrap(
        {
          children: [],
          type: editor.plugin(PLUGINS.blockquote).schema.type,
        },
        {
          at: blockEntry[1],
        }
      );

      return true;
    },
  }),
};

export const HorizontalRuleRules = {
  markdown: createRuleFactory<{}, { variant: '-' | '_' }>({
    type: 'blockStart',
    variant: '-',
    match: ({ variant }) => (variant === '_' ? '___' : thematicBreakDashRe),
    trigger: ({ variant }) => (variant === '_' ? ' ' : '-'),
    apply: ({ editor, tx, variant }) => {
      if (variant === '_') {
        tx.text.deleteBackward({ unit: 'character' });
      }

      tx.nodes.set({
        type: editor.plugin(PLUGINS.horizontalRule).schema.type,
      });
      tx.nodes.insert({
        children: [{ text: '' }],
        type: editor.plugin(PLUGINS.paragraph).schema.type,
      });

      return true;
    },
  }),
};

/** Enables support for block quotes, useful for quotations and passages. */
export const BaseBlockquotePlugin = defineBasePlugin(PLUGINS.blockquote, {
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
  render: { as: 'blockquote' },
  rules: {
    break: {
      empty: 'lift',
    },
    delete: {
      start: 'lift',
    },
    match: ({ editor, node, path, plugin, rule, schema: { type } }) => {
      if (!['break.empty', 'delete.start'].includes(rule)) return false;
      if (!path) return false;
      if (!ElementApi.isElement(node)) return false;

      const isLiftable =
        node.type === editor.plugin(PLUGINS.paragraph).schema.type &&
        !node.listType &&
        !!editor.read.nodes.above({
          at: path,
          type: plugin,
        });

      if (rule === 'delete.start') {
        if (!isLiftable) return false;
        if (!editor.read.selection() || !editor.read.nodes.isEmpty(node)) {
          return true;
        }

        const parent = editor.read.nodes.parent(path);

        if (
          !parent ||
          !ElementApi.isElement(parent[0]) ||
          parent[0].type !== type
        ) {
          return true;
        }

        return !PathApi.hasPrevious(path);
      }

      return isLiftable;
    },
  },
  shortcuts: {
    untab: { keys: 'shift+tab' },
  },
  update: ({ editor, plugin, tx, schema: { type } }) => ({
    toggle: () => {
      tx.blocks.toggle(type, { wrap: true });
    },
    untab: () => {
      const paragraphType = editor.plugin(PLUGINS.paragraph).schema.type;
      const blocks = [
        ...tx.nodes.toArray({
          at: tx.selection() ?? undefined,
          match: (node, path) =>
            ElementApi.isElement(node) &&
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
        tx.blocks.lift({
          at: path,
        });
      }

      return true;
    },
  }),
});

export const BaseHorizontalRulePlugin = defineBasePlugin(
  PLUGINS.horizontalRule,
  {
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
    render: { as: 'hr' },
  }
);

const groupInlineChildrenIntoParagraphs = (
  children: ReadonlyArray<import('@platejs/plite').Descendant>,
  context: Pick<MarkdownDecodeContext, 'isBlock' | 'isInline' | 'registry'>
) => {
  const paragraphType = context.registry.type(PLUGINS.paragraph) ?? 'paragraph';
  const elements: Array<import('@platejs/plite').Descendant> = [];
  let inlineNodes: Array<import('@platejs/plite').Descendant> = [];

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
