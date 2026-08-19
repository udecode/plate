import { type DefinitionOf, defineBasePlugin } from '@platejs/core';
import type {
  EditorNodesOptions,
  NodeSetNodesOptions,
  Text,
  TextOf,
} from '@platejs/plite';
import { property, schema, target, TextApi } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

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

export const BaseCommentPlugin = defineBasePlugin(PLUGINS.comment, {
  codecs: ({ defineCodecs, schema: { key } }) =>
    defineCodecs({
      'text/markdown': {
        from: 'comment',
        kind: 'node',
        mark: true,
        decode: ({ decode, decoration, node }) =>
          decode(node.children, {
            [key]: true,
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
  schema: {
    mark: {
      property: property.boolean({ default: false, omitDefault: true }),
      split: 'preserve',
      target: target.group('element'),
      typeChange: 'preserve-if-allowed',
    },
    properties: {
      commentById: schema.textProperty(
        schema.key.prefix('comment_'),
        property.boolean(),
        {
          split: 'preserve',
          target: target.group('element'),
          typeChange: 'preserve-if-allowed',
        }
      ),
      transientComment: schema.textProperty(
        getTransientCommentKey(),
        property.boolean(),
        {
          split: 'preserve',
          target: target.group('element'),
          typeChange: 'preserve-if-allowed',
        }
      ),
    },
  },
})
  .extend(({ plugin }) => {
    type CommentText = TextOf<typeof plugin>;

    return {
      api: () => ({
        id: (leaf: Omit<Text, 'text'>) => {
          const keys = Object.keys(leaf);

          if (keys.includes(getDraftCommentKey())) return;

          return keys
            .filter((key) => isCommentKey(key) && key !== getDraftCommentKey())
            .map(getCommentKeyId)
            .at(-1);
        },
      }),
      read: ({ schema: { key }, state }) => ({
        has: ({ id }: { id: string }) =>
          state.nodes.some({
            at: [],
            match: (node) => isCommentText(node) && isCommentNodeById(node, id),
          }),
        node: (
          options: Omit<EditorNodesOptions<CommentText>, 'match' | 'type'> & {
            id?: string;
            isDraft?: boolean;
          } = {}
        ) => {
          const { id, isDraft, ...rest } = options;

          return state.nodes.find({
            ...rest,
            match: (node): node is CommentText => {
              if (!isCommentText(node)) return false;
              if (isDraft) {
                return !!node[key] && !!node[getDraftCommentKey()];
              }

              return id ? isCommentNodeById(node, id) : !!node[key];
            },
          });
        },
        nodes: (
          options: Omit<EditorNodesOptions<CommentText>, 'match' | 'type'> & {
            id?: string;
            isDraft?: boolean;
            transient?: boolean;
          } = {}
        ) => {
          const { id, isDraft, transient, ...rest } = options;

          return state.nodes.toArray({
            ...rest,
            match: (node): node is CommentText => {
              if (!isCommentText(node)) return false;
              if (isDraft) {
                return !!node[key] && !!node[getDraftCommentKey()];
              }
              if (transient) {
                return !!node[key] && !!node[getTransientCommentKey()];
              }

              return id ? isCommentNodeById(node, id) : !!node[key];
            },
          });
        },
      }),
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
              tx.nodes.unset('comment', { at: path });
            }
          },
        },
      ],
      rules: { selection: { affinity: 'outward' } },
    };
  })
  .extend((context) => {
    type CommentText = TextOf<typeof context.plugin>;
    const {
      api,
      plugin,
      schema: { key, properties },
    } = context;

    return {
      update: ({ tx }) => ({
        clearTransient: () => {
          for (const [, path] of tx.plugin(plugin).nodes({ transient: true })) {
            tx.nodes.unset(properties.transientComment, { at: path });
          }
        },
        removeMark: () => {
          const nodeEntry = tx.plugin(plugin).node();

          if (!nodeEntry) return;

          for (const key of getCommentKeys(nodeEntry[0])) {
            tx.marks.remove(key);
          }

          tx.marks.remove(key);
        },
        setDraft: (options: NodeSetNodesOptions<CommentText> = {}) => {
          tx.nodes.set(
            {
              [getDraftCommentKey()]: true,
              [key]: true,
            },
            { match: TextApi.isText, split: true, ...options }
          );
        },
        unsetMark: ({
          id,
          transient,
        }: {
          id?: string;
          transient?: boolean;
        }) => {
          for (const [node, path] of tx.plugin(plugin).nodes({
            id,
            at: [],
            transient,
          })) {
            const removedId = id ?? api.id(node);
            const unsetKeys: string[] = [
              getDraftCommentKey(),
              getTransientCommentKey(),
              ...(removedId ? [getCommentKey(removedId)] : []),
            ];

            if (getCommentCount(node) <= 1) {
              unsetKeys.push(key);
            }

            tx.nodes.unset(unsetKeys, { at: path });
          }
        },
      }),
    };
  });

export type BaseCommentDefinition = DefinitionOf<typeof BaseCommentPlugin>;
export type CommentText = TextOf<typeof BaseCommentPlugin>;
