'use client';

import type { ExtendConfig, Path } from '@udecode/plate';

import { isSlateString } from '@udecode/plate';
import {
  type BaseCommentConfig,
  BaseCommentPlugin,
} from '@udecode/plate-comments';
import { toTPlatePlugin, useHotkeys } from '@udecode/plate/react';

import { CommentLeaf } from '@/registry/ui/comment-node';

export type CommentConfig = ExtendConfig<
  BaseCommentConfig,
  {
    activeId: string | null;
    commentingBlock: Path | null;
    hotkey: string[];
    hoverId: string | null;
    uniquePathMap: Map<string, Path>;
  }
>;

export const commentPlugin = toTPlatePlugin<CommentConfig>(BaseCommentPlugin, {
  handlers: {
    onClick: ({ api, event, setOption, type }) => {
      let leaf = event.target as HTMLElement;
      let isSet = false;

      const unsetActiveSuggestion = () => {
        setOption('activeId', null);
        isSet = true;
      };

      if (!isSlateString(leaf)) unsetActiveSuggestion();

      while (leaf.parentElement) {
        if (leaf.classList.contains(`slate-${type}`)) {
          const commentsEntry = api.comment!.node();

          if (!commentsEntry) {
            unsetActiveSuggestion();

            break;
          }

          const id = api.comment!.nodeId(commentsEntry[0]);

          setOption('activeId', id ?? null);
          isSet = true;

          break;
        }

        leaf = leaf.parentElement;
      }

      if (!isSet) unsetActiveSuggestion();
    },
  },
  options: {
    activeId: null,
    commentingBlock: null,
    hoverId: null,
    uniquePathMap: new Map(),
  },
  useHooks: ({ editor }) => {
    useHotkeys(
      ['meta+shift+m', 'ctrl+shift+m'],
      (e) => {
        if (!editor.selection) return;

        e.preventDefault();

        if (!editor.api.isExpanded()) return;
      },
      {
        enableOnContentEditable: true,
      }
    );
  },
});

export const CommentKit = [commentPlugin.withComponent(CommentLeaf)];
