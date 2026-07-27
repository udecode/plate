'use client';

import type { ExtendConfig, Path } from 'platejs';

import { TextApi } from 'platejs';
import {
  type BaseCommentConfig,
  BaseCommentPlugin,
  getDraftCommentKey,
} from '@platejs/comment';
import { toPlatePlugin } from 'platejs/react';

import { CommentLeaf } from '@/registry/ui/comment-node';
import { getDiscussionClickTarget } from './discussion-kit';

export type CommentConfig = ExtendConfig<
  BaseCommentConfig,
  {
    activeId: string | null;
    commentingBlock: Path | null;
    hoverId: string | null;
  }
>;

export const commentPlugin = toPlatePlugin<
  BaseCommentConfig,
  {
    activeId: string | null;
    commentingBlock: Path | null;
    hoverId: string | null;
  }
>(BaseCommentPlugin, {
  handlers: {
    onClick: ({ api, event, read, store, type }) => {
      const activeTarget = getDiscussionClickTarget({
        selector: `.plite-${type}`,
        target: event.target,
      });

      if (!activeTarget) {
        store.set({ activeId: null });
        return;
      }

      const commentEntry = read.node();

      store.set({
        activeId: commentEntry ? (api.nodeId(commentEntry[0]) ?? null) : null,
      });
    },
  },
  initialState: {
    activeId: null,
    commentingBlock: null,
    hoverId: null,
  },
})
  .extend(({ store, type }) => ({
    update: ({ tx }) => ({
      setDraft: (options = {}) => {
        const commentingBlock = tx.selection()?.focus.path.slice(0, 1) ?? null;

        if (tx.selection.isCollapsed()) {
          const blockEntry = tx.nodes.block();

          if (blockEntry) {
            tx.selection.set(blockEntry[1]);
          }
        }

        tx.nodes.set(
          {
            [getDraftCommentKey()]: true,
            [type]: true,
          },
          { match: TextApi.isText, split: true, ...options }
        );

        tx.selection.collapse();
        store.set({ activeId: getDraftCommentKey() });
        store.set({ commentingBlock });
      },
    }),
  }))
  .configure({
    component: CommentLeaf,
    shortcuts: {
      setDraft: { keys: 'mod+shift+m' },
    },
  });

export const CommentKit = [commentPlugin];
