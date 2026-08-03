'use client';

import type { DefinitionOf, Path } from 'platejs';

import { TextApi } from 'platejs';
import { BaseCommentPlugin, getDraftCommentKey } from '@platejs/comment';
import { toPlatePlugin } from 'platejs/react';

import { CommentLeaf } from '@/registry/ui/comment-node';
import { getDiscussionClickTarget } from './discussion-kit';

export type CommentPluginState = {
  activeId: string | null;
  commentingBlock: Path | null;
  hoverId: string | null;
};

const initialState: CommentPluginState = {
  activeId: null,
  commentingBlock: null,
  hoverId: null,
};

export const commentPlugin = toPlatePlugin(BaseCommentPlugin, {
  on: {
    click: ({ api, event, name, read, store }) => {
      const activeTarget = getDiscussionClickTarget({
        selector: `.plite-${name}`,
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
  initialState,
})
  .extend(({ key, store }) => ({
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
            [key]: true,
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

export type CommentDefinition = DefinitionOf<typeof commentPlugin>;

export const CommentKit = [commentPlugin];
