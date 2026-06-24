import {
  type NodeEntry,
  type PluginConfig,
  type BasePlateEditor,
  type TCommentText,
  createEditorPlugin,
  KEYS,
  TextApi,
} from 'platejs';
import type { EditorUpdateTransaction } from '@platejs/plite';

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

type CommentNodeOptions = NonNullable<
  Parameters<BasePlateEditor['api']['nodes']>[0]
>;
type CommentSetNodesOptions = NonNullable<
  Parameters<EditorUpdateTransaction['nodes']['set']>[1]
>;

export type BaseCommentConfig = PluginConfig<
  'comment',
  {},
  {
    comment: {
      has: (options: { id: string }) => boolean;
      node: (
        options?: CommentNodeOptions & { id?: string; isDraft?: boolean }
      ) => NodeEntry<TCommentText> | undefined;
      nodeId: (leaf: TCommentText) => string | undefined;
      nodes: (
        options?: CommentNodeOptions & {
          id?: string;
          isDraft?: boolean;
          transient?: boolean;
        }
      ) => NodeEntry<TCommentText>[];
    };
  },
  {},
  {},
  {
    comment: {
      removeMark: () => void;
      setDraft: (options?: CommentSetNodesOptions) => void;
      unsetMark: (options: { id?: string; transient?: boolean }) => void;
    };
  }
>;

export const BaseCommentPlugin = createEditorPlugin<BaseCommentConfig>({
  key: KEYS.comment,
  node: {
    isLeaf: true,
  },
  rules: { selection: { affinity: 'outward' } },
})
  .extendApi<BaseCommentConfig['api']['comment']>(({ editor, type }) => ({
    has: (options: { id: string }): boolean => {
      const { id } = options;

      const regex = new RegExp(`"${getCommentKey(id)}":true`);

      // TODO perf
      return regex.test(JSON.stringify(editor.children));
    },
    node: (options = {}) => {
      const { id, isDraft, ...rest } = options;

      return editor.read((state) =>
        state.nodes.find<TCommentText>({
          ...rest,
          match: (n: unknown) => {
            if (!TextApi.isText(n)) return false;
            const text = n as TCommentText;

            if (isDraft) {
              return Boolean(text[type] && text[getDraftCommentKey()]);
            }

            return id ? isCommentNodeById(text, id) : Boolean(text[type]);
          },
        } as any)
      );
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

      return editor.read((state) => [
        ...state.nodes.entries<TCommentText>({
          ...rest,
          match: (n: unknown) => {
            if (!TextApi.isText(n)) return false;
            const text = n as TCommentText;

            if (isDraft) {
              return Boolean(text[type] && text[getDraftCommentKey()]);
            }
            if (transient) {
              return Boolean(text[type] && text[getTransientCommentKey()]);
            }

            return id ? isCommentNodeById(text, id) : Boolean(text[type]);
          },
        } as any),
      ]);
    },
  }))
  .extendTx(({ api, type }) => (tx: EditorUpdateTransaction) => ({
    removeMark: () => {
      const nodeEntry = api.comment.node();

      if (!nodeEntry) return;

      const keys = getCommentKeys(nodeEntry[0]);

      keys.forEach((key) => {
        tx.marks.remove(key);
      });

      tx.marks.remove(KEYS.comment);
    },
    setDraft: (options: CommentSetNodesOptions = {}) => {
      tx.nodes.set(
        {
          [getDraftCommentKey()]: true,
          [type]: true,
        },
        { match: TextApi.isText, split: true, ...options }
      );
    },
    unsetMark: (options: { id?: string; transient?: boolean }) => {
      const { id, transient } = options;
      const nodes = api.comment.nodes({ id, at: [], transient });

      if (!nodes) return;

      nodes.forEach(([node]) => {
        const isOverlapping = getCommentCount(node) > 1;
        const removedId = id ?? api.comment.nodeId(node)!;
        const unsetKeys = isOverlapping
          ? [
              getDraftCommentKey(),
              getCommentKey(removedId),
              getTransientCommentKey(),
            ]
          : [
              KEYS.comment,
              getDraftCommentKey(),
              getCommentKey(removedId),
              getTransientCommentKey(),
            ];

        tx.nodes.unset(unsetKeys, {
          at: [],
          match: (n) => n === node,
        });
      });
    },
  }));
