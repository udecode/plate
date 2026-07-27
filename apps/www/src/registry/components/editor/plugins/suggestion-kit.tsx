'use client';

import type { BasePluginOverride, TrailingBlockConfig } from 'platejs';

import { KEYS, TextApi } from 'platejs';
import { SuggestionPlugin } from '@platejs/suggestion/react';

import {
  SuggestionLeaf,
  SuggestionLineBreak,
  VoidRemoveSuggestionOverlay,
} from '@/registry/ui/suggestion-node';
import {
  discussionPlugin,
  getDiscussionBlockClickTarget,
  getDiscussionClickTarget,
} from './discussion-kit';

const INLINE_SUGGESTION_RENDER_TARGETS = [
  KEYS.date,
  KEYS.inlineEquation,
  KEYS.link,
  KEYS.mention,
];

export const suggestionPlugin = SuggestionPlugin.extend(({ api, editor }) => ({
  initialState: {
    currentUserId: editor.plugin(discussionPlugin).store.get('currentUserId'),
  },
  override: {
    plugins: {
      [KEYS.trailingBlock]: {
        initialState: {
          insert: (insert) => {
            api.untracked(insert);
          },
        },
      } satisfies BasePluginOverride<TrailingBlockConfig>,
    },
  },
})).configure({
  component: SuggestionLeaf,
  handlers: {
    // unset active suggestion when clicking outside of suggestion
    onClick: ({ api, event, read, store, type }) => {
      const markTarget = getDiscussionClickTarget({
        selector: `.plite-${type}`,
        target: event.target,
      });
      const blockTarget = markTarget
        ? null
        : getDiscussionBlockClickTarget({
            target: event.target,
          });

      if (!markTarget && !blockTarget) {
        store.set({ activeId: null });
        return;
      }

      const suggestionEntry = read.node({
        isText: !blockTarget,
      });

      store.set({
        activeId: suggestionEntry
          ? (api.nodeId(suggestionEntry[0]) ?? null)
          : null,
      });
    },
  },
  inject: {
    isElement: true,
    nodeProps: {
      nodeKey: '',
      styleKey: 'cssText',
      transformProps: ({ api, element, props }) => {
        if (!element) return props;

        let suggestionData = api.suggestionData(element);

        if (!suggestionData) {
          for (const child of element.children) {
            if (!TextApi.isText(child)) continue;

            suggestionData = api.dataList(child).at(-1);
            if (suggestionData) break;
          }
        }

        if (!suggestionData) return props;

        return {
          ...props,
          'data-inline-suggestion': suggestionData.type,
        };
      },
      transformStyle: () => ({}) as CSSStyleDeclaration,
    },
  },
  render: {
    belowNodes: SuggestionLineBreak,
    belowRootNodes: VoidRemoveSuggestionOverlay,
  },
  targetPluginKeys: INLINE_SUGGESTION_RENDER_TARGETS,
});

export const SuggestionKit = [suggestionPlugin];
