import {
  type InferConfig,
  type PluginConfig,
  createBasePlugin,
} from '@platejs/core';
import type {
  EditorNodesOptions,
  NodeEntry,
  NodeSetNodesOptions,
} from '@platejs/plite';
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
} from './utils';
import { withComment } from './withComments';

type BaseCommentContract = PluginConfig<
  'comment',
  {},
  {},
  {
    comment: {
      removeMark: () => void;
      setDraft: (options?: NodeSetNodesOptions<TCommentText>) => void;
      unsetMark: (options: { id?: string; transient?: boolean }) => void;
    };
  },
  {},
  {},
  readonly [],
  never,
  {
    has: (options: { id: string }) => boolean;
    node: (
      options?: EditorNodesOptions<TCommentText> & {
        id?: string;
        isDraft?: boolean;
      }
    ) => NodeEntry<TCommentText> | undefined;
    nodeId: (leaf: TCommentText) => string | undefined;
    nodes: (
      options?: EditorNodesOptions<TCommentText> & {
        id?: string;
        isDraft?: boolean;
        transient?: boolean;
      }
    ) => NodeEntry<TCommentText>[];
  }
>;

export const BaseCommentPlugin = createBasePlugin({
  key: KEYS.comment,
  rules: { selection: { affinity: 'outward' } },
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
})
  .extendExtension(withComment)
  .extendApi<BaseCommentContract['pluginApi']>(({ editor, type }) => ({
    has: ({ id }) =>
      editor.read.nodes.some<TCommentText>({
        at: [],
        match: (node) => isCommentText(node) && isCommentNodeById(node, id),
      }),
    node: (options = {}) => {
      const { id, isDraft, ...rest } = options;

      return editor.read.nodes.find<TCommentText>({
        ...rest,
        match: (node) => {
          if (!isCommentText(node)) return false;
          if (isDraft) return !!node[type] && !!node[getDraftCommentKey()];

          return id ? isCommentNodeById(node, id) : !!node[type];
        },
      });
    },
    nodeId: (leaf) => {
      const keys = Object.keys(leaf);

      if (keys.includes(getDraftCommentKey())) return;

      return keys
        .filter((key) => isCommentKey(key) && key !== getDraftCommentKey())
        .map(getCommentKeyId)
        .at(-1);
    },
    nodes: (options = {}) => {
      const { id, isDraft, transient, ...rest } = options;

      return editor.read.nodes.toArray<TCommentText>({
        ...rest,
        match: (node) => {
          if (!isCommentText(node)) return false;
          if (isDraft) return !!node[type] && !!node[getDraftCommentKey()];
          if (transient) {
            return !!node[type] && !!node[getTransientCommentKey()];
          }

          return id ? isCommentNodeById(node, id) : !!node[type];
        },
      });
    },
  }))
  .extendTx(
    ({ api, type }) =>
      (tx) =>
        ({
          removeMark: () => {
            const nodeEntry = api.node();

            if (!nodeEntry) return;

            for (const key of getCommentKeys(nodeEntry[0])) {
              tx.marks.remove(key);
            }

            tx.marks.remove(KEYS.comment);
          },
          setDraft: (options = {}) => {
            tx.nodes.set(
              {
                [getDraftCommentKey()]: true,
                [type]: true,
              },
              { match: TextApi.isText, split: true, ...options }
            );
          },
          unsetMark: ({ id, transient }) => {
            for (const [node] of api.nodes({ id, at: [], transient })) {
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
        }) satisfies BaseCommentContract['tx']['comment']
  );

export type BaseCommentConfig = InferConfig<typeof BaseCommentPlugin>;
