'use client';
import type { Path } from '@udecode/plate';

import { CommentsPlugin } from '@udecode/plate-comments/react';
import { isSlateString } from '@udecode/plate-core';
import { useHotkeys } from '@udecode/plate/react';

import { BlockComments } from '@/registry/default/plate-ui/block-comments';

export const commentsPlugin = CommentsPlugin.extend({
  options: {
    activeId: null as string | null,
    commentingBlock: null as Path | null,
    hotkey: ['meta+shift+m', 'ctrl+shift+m'],
    hoverId: null as string | null,
    uniquePathMap: new Map(),
  },
  render: {
    aboveNodes: BlockComments as any,
  },
}).extend({
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
          const commentsEntry = api.comment.node();

          if (!commentsEntry) {
            unsetActiveSuggestion();

            break;
          }

          const id = api.comment.nodeId(commentsEntry[0]);

          setOption('activeId', id ?? null);
          isSet = true;

          break;
        }

        leaf = leaf.parentElement;
      }

      if (!isSet) unsetActiveSuggestion();
    },
  },
  useHooks: ({ editor, getOptions }) => {
    const { hotkey } = getOptions();
    useHotkeys(
      hotkey!,
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
