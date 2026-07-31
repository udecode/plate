import { type DefinitionOf, createBasePlugin } from '@platejs/core';
import type { EditorNodesOptions, NodeSetNodesOptions } from '@platejs/plite';
import { property, schema, target, TextApi } from '@platejs/plite';
import { KEYS, type TCommentText } from '@platejs/utils';

import {
  getCommentCount,
  getCommentKey,
  getCommentKeyId,
  getCommentKeys,
  getDraftCommentKey,
  getTransientCommentKey,
  isCommentKey,
  isCommentNodeById,
  isCommentText,
} from './commentMarks';

export const BaseCommentPlugin = createBasePlugin({
  name: KEYS.comment,
  api: () => ({
    nodeId: (leaf: TCommentText) => {
      const keys = Object.keys(leaf);

      if (keys.includes(getDraftCommentKey())) return;

      return keys
        .filter((key) => isCommentKey(key) && key !== getDraftCommentKey())
        .map(getCommentKeyId)
        .at(-1);
    },
  }),
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/markdown': {
        from: 'comment',
        kind: 'node',
        mark: true,
        decode: ({ decode, decoration, node, type }) =>
          decode(node.children, {
            [type]: true,
            ...decoration,
          }),
        encode: ({ node }) => {
          if (!TextApi.isText(node)) return;

          return {
            attributes: [],
            children: [{ type: 'text', value: node.text }],
            name: 'comment',
            type: 'mdxJsxTextElement',
          };
        },
      },
    }),
  read: ({ state, type }) => ({
    has: ({ id }: { id: string }) =>
      state.nodes.some<TCommentText>({
        at: [],
        match: (node) => isCommentText(node) && isCommentNodeById(node, id),
      }),
    node: (
      options: EditorNodesOptions<TCommentText> & {
        id?: string;
        isDraft?: boolean;
      } = {}
    ) => {
      const { id, isDraft, ...rest } = options;

      return state.nodes.find<TCommentText>({
        ...rest,
        match: (node) => {
          if (!isCommentText(node)) return false;
          if (isDraft) {
            return !!node[type] && !!node[getDraftCommentKey()];
          }

          return id ? isCommentNodeById(node, id) : !!node[type];
        },
      });
    },
    nodes: (
      options: EditorNodesOptions<TCommentText> & {
        id?: string;
        isDraft?: boolean;
        transient?: boolean;
      } = {}
    ) => {
      const { id, isDraft, transient, ...rest } = options;

      return state.nodes.toArray<TCommentText>({
        ...rest,
        match: (node) => {
          if (!isCommentText(node)) return false;
          if (isDraft) {
            return !!node[type] && !!node[getDraftCommentKey()];
          }
          if (transient) {
            return !!node[type] && !!node[getTransientCommentKey()];
          }

          return id ? isCommentNodeById(node, id) : !!node[type];
        },
      });
    },
  }),
  schema: {
    mark: {
      property: property.boolean({ default: false, omitDefault: true }),
      split: 'preserve',
      target: target.group('element'),
      typeChange: 'preserve-if-allowed',
    },
    properties: [
      schema.textProperty(
        schema.key.prefix(`${KEYS.comment}_`),
        property.boolean(),
        {
          split: 'preserve',
          target: target.group('element'),
          typeChange: 'preserve-if-allowed',
        }
      ),
      schema.textProperty(getTransientCommentKey(), property.boolean(), {
        split: 'preserve',
        target: target.group('element'),
        typeChange: 'preserve-if-allowed',
      }),
    ],
  },

  corrections: [
    {
      event: 'properties',
      correct({ entry: [node, path], tx }) {
        if (
          isCommentText(node) &&
          !node[getDraftCommentKey()] &&
          !node[getTransientCommentKey()] &&
          getCommentCount(node) < 1
        ) {
          tx.nodes.unset(KEYS.comment, { at: path });
        }
      },
    },
  ],
  rules: { selection: { affinity: 'outward' } },
}).extend(({ api, plugin, type }) => ({
  update: ({ tx }) => ({
    removeMark: () => {
      const nodeEntry = tx[plugin.name].node();

      if (!nodeEntry) return;

      for (const key of getCommentKeys(nodeEntry[0])) {
        tx.marks.remove(key);
      }

      tx.marks.remove(KEYS.comment);
    },
    setDraft: (options: NodeSetNodesOptions<TCommentText> = {}) => {
      tx.nodes.set(
        {
          [getDraftCommentKey()]: true,
          [type]: true,
        },
        { match: TextApi.isText, split: true, ...options }
      );
    },
    unsetMark: ({ id, transient }: { id?: string; transient?: boolean }) => {
      for (const [node] of tx[plugin.name].nodes({ id, at: [], transient })) {
        const removedId = id ?? api.nodeId(node);
        const unsetKeys = [
          getDraftCommentKey(),
          getTransientCommentKey(),
          ...(removedId ? [getCommentKey(removedId)] : []),
        ];

        if (getCommentCount(node) <= 1) {
          unsetKeys.push(KEYS.comment);
        }

        tx.nodes.unset(unsetKeys, { at: node });
      }
    },
  }),
}));

export type BaseCommentDefinition = DefinitionOf<typeof BaseCommentPlugin>;
