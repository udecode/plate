import {
  BaseParagraphPlugin,
  createBasePlugin,
  createRuleFactory,
} from '@platejs/core';
import { type Element, ElementApi, PathApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

const thematicBreakDashRe = /^(--|—)$/;

export const BlockquoteRules = {
  markdown: createRuleFactory<{}, { marker: string }>({
    type: 'blockStart',
    marker: '>',
    trigger: ' ',
    enabled: ({ editor }) =>
      !editor.read.nodes.some({
        match: { type: editor.getType(KEYS.codeBlock) },
      }),
    match: ({ marker }) => marker,
    apply: ({ editor, getBlockEntry, tx }, match) => {
      const blockEntry = getBlockEntry();

      if (!blockEntry) return;

      tx.text.delete({ at: match.range });
      tx.nodes.wrap(
        {
          children: [],
          type: editor.getType(KEYS.blockquote),
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

      tx.nodes.set({ type: editor.getType(KEYS.hr) });
      tx.nodes.insert({
        children: [{ text: '' }],
        type: editor.getType(KEYS.p),
      });

      return true;
    },
  }),
};

/** Enables support for block quotes, useful for quotations and passages. */
export const BaseBlockquotePlugin = createBasePlugin({
  key: KEYS.blockquote,
  schema: ({ plugins }) => ({
    element: {
      content: plugins.blockContent({
        default: { type: plugins.elementType(BaseParagraphPlugin) },
        min: 1,
      }),
    },
  }),
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: () => ({}),
        encode: ({ content }) => ({ children: content, tag: 'blockquote' }),
        match: [{ tag: 'blockquote' }],
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
    match: ({ editor, node, path, rule, type }) => {
      if (!['break.empty', 'delete.start'].includes(rule)) return false;
      if (!path) return false;
      if (!ElementApi.isElement(node)) return false;

      const isLiftable =
        node.type === editor.getType(KEYS.p) &&
        !node[KEYS.listType] &&
        !!editor.read.nodes.above({
          at: path,
          match: { type },
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
  update: ({ editor, tx, type }) => ({
    toggle: () => {
      tx.blocks.toggle(type, { wrap: true });
    },
    untab: () => {
      const paragraphType = editor.getType(KEYS.p);
      const blocks = [
        ...tx.nodes.toArray<Element>({
          at: tx.selection() ?? undefined,
          match: (node, path) =>
            ElementApi.isElement(node) &&
            !node.indent &&
            node.type === paragraphType &&
            !node[KEYS.listType] &&
            !!tx.nodes.above({
              at: path,
              match: { type },
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
}).extend({
  shortcuts: {
    untab: { keys: 'shift+tab' },
  },
});

export const BaseHorizontalRulePlugin = createBasePlugin({
  key: KEYS.hr,
  schema: {
    element: {
      void: 'block',
    },
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: () => ({}),
        encode: () => ({ tag: 'hr' }),
        match: [{ tag: 'hr' }],
      },
    }),
  render: { as: 'hr' },
});
