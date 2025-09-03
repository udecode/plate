import {
  type EditorNodesOptions,
  type NodeEntry,
  type PluginConfig,
  type SetNodesOptions,
  type TCommentText,
  createTSlatePlugin,
  KEYS,
  TextApi,
} from 'platejs';

import {
  getCommentCount,
  getCommentKey,
  getCommentKeyId,
  getCommentKeys,
  getDraftCommentKey,
  getTransientCommentKey,
  isCommentKey,
  isCommentNodeById,
} from './utils';
import { withComment } from './withComments';

export type BaseCommentConfig = PluginConfig<
  'comment',
  {},
  {
    comment: {
      has: (options: { id: string }) => boolean;
      node: (
        options?: EditorNodesOptions & { id?: string; isDraft?: boolean }
      ) => NodeEntry<TCommentText> | undefined;
      nodeId: (leaf: TCommentText) => string | undefined;
      nodes: (
        options?: EditorNodesOptions & {
          id?: string;
          isDraft?: boolean;
          transient?: boolean;
        }
      ) => NodeEntry<TCommentText>[];
    };
  },
  {
    comment: {
      removeMark: () => void;
      setDraft: (options?: SetNodesOptions) => void;
      unsetMark: (options: { id?: string; transient?: boolean }) => void;
    };
  }
>;

export const BaseCommentPlugin = createTSlatePlugin<BaseCommentConfig>({
  key: KEYS.comment,
  node: {
    isLeaf: true,
  },
  rules: { selection: { affinity: 'outward' } },
})
  .overrideEditor(withComment)
  .extendApi<BaseCommentConfig['api']['comment']>(({ editor, type }) => ({
    has: (options: { id: string }): boolean => {
      const { id } = options;

      const regex = new RegExp(`"${getCommentKey(id)}":true`);

      // TODO perf
      return regex.test(JSON.stringify(editor.children));
    },
    node: (options = {}) => {
      const { id, isDraft, ...rest } = options;

      return editor.api.node<TCommentText>({
        ...rest,
        match: (n) => {
          if (isDraft) return n[type] && n[getDraftCommentKey()];

          return id ? isCommentNodeById(n, id) : n[type];
        },
      });
    },
    nodeId: (leaf) => {
      const ids: string[] = [];
      const keys = Object.keys(leaf);

      if (keys.includes(getDraftCommentKey())) return;

      keys.forEach((key) => {
        if (!isCommentKey(key) || key === getDraftCommentKey()) return;

        // block the resolved id

        const id = getCommentKeyId(key);
        ids.push(id);
      });

      return ids.at(-1);
    },
    nodes: (options = {}) => {
      const { id, isDraft, transient, ...rest } = options;

      return [
        ...editor.api.nodes<TCommentText>({
          ...rest,
          match: (n) => {
            if (isDraft) return n[type] && n[getDraftCommentKey()];
            if (transient) return n[type] && n[getTransientCommentKey()];
            return id ? isCommentNodeById(n, id) : n[type];
          },
        }),
      ];
    },
  }))
  .extendTransforms<BaseCommentConfig['transforms']['comment']>(
    ({ api, editor, tf, type }) => ({
      removeMark: () => {
        const nodeEntry = api.comment.node();

        if (!nodeEntry) return;

        const keys = getCommentKeys(nodeEntry[0]);

        editor.tf.withoutNormalizing(() => {
          keys.forEach((key) => {
            editor.tf.removeMark(key);
          });

          editor.tf.removeMark(KEYS.comment);
        });
      },
      setDraft: (options = {}) => {
        tf.setNodes(
          {
            [getDraftCommentKey()]: true,
            [type]: true,
          },
          { match: TextApi.isText, split: true, ...options }
        );
      },
      unsetMark: (options) => {
        const { id, transient } = options;

        const nodes = api.comment.nodes({ id, at: [], transient });

        if (!nodes) return;

        nodes.forEach(([node]) => {
          const isOverlapping = getCommentCount(node) > 1;

          let unsetKeys: string[] = [];

          const removedId = id ?? api.comment.nodeId(node)!;

          if (isOverlapping) {
            unsetKeys = [
              getDraftCommentKey(),
              getCommentKey(removedId),
              getTransientCommentKey(),
            ];
          } else {
            unsetKeys = [
              KEYS.comment,
              getDraftCommentKey(),
              getCommentKey(removedId),
              getTransientCommentKey(),
            ];
          }

          editor.tf.unsetNodes<TCommentText>(unsetKeys, {
            at: [],
            match: (n) => n === node,
          });
        });
      },
    })
  );
