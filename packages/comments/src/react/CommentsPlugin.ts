import { isSlateString } from '@udecode/plate';
import { Key, toPlatePlugin } from '@udecode/plate/react';

import { BaseCommentsPlugin } from '../lib';
import { getCommentLastId } from '../lib/queries';
import { useHooksComments } from './useHooksComments';

export const CommentsPlugin = toPlatePlugin(BaseCommentsPlugin, {
  key: 'comment',
  handlers: {
    onClick: ({ editor, event, setOption }) => {
      let leaf = event.target as HTMLElement;
      let isSet = false;

      const unsetActiveSuggestion = () => {
        setOption('activeId', null);
        isSet = true;
      };

      if (!isSlateString(leaf)) unsetActiveSuggestion();

      while (leaf.parentElement) {
        if (leaf.classList.contains(`slate-${CommentsPlugin.key}`)) {
          const commentsEntry = editor
            .getApi(BaseCommentsPlugin)
            .comment.node();

          if (!commentsEntry) {
            unsetActiveSuggestion();

            break;
          }

          const id = getCommentLastId(commentsEntry[0]);

          setOption('activeId', id ?? null);
          isSet = true;

          break;
        }

        leaf = leaf.parentElement;
      }

      if (!isSet) unsetActiveSuggestion();
    },
  },
  node: { isLeaf: true },
  options: {
    activeId: null,
    hotkey: ['meta+shift+m', 'ctrl+shift+m'],
    hoverId: null,
    isOverlapWithEditor: false,
    uniquePathMap: new Map(),
    updateTimestamp: null,
  },
  shortcuts: {
    toggleComment: {
      keys: [[Key.Mod, Key.Shift, 'm']],
    },
  },
  useHooks: useHooksComments,
});
