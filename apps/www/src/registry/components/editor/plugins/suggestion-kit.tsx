'use client';

import type { BasePluginOverride, TrailingBlockDefinition } from 'platejs';

import { PLUGINS, TextApi } from 'platejs';
import { BaseSuggestionPlugin } from '@platejs/suggestion';
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
  PLUGINS.date,
  PLUGINS.inlineEquation,
  PLUGINS.link,
  PLUGINS.mention,
];

export type SuggestionKitPluginState = {
  currentUserId: string | null;
};

const createInitialState = (
  currentUserId: string | null
): SuggestionKitPluginState => ({ currentUserId });

export const suggestionPlugin = SuggestionPlugin.extend(({ api, editor }) => ({
  initialState: createInitialState(
    editor.plugin(discussionPlugin).store.get('currentUserId')
  ),
  override: {
    plugins: {
      [PLUGINS.trailingBlock]: {
        initialState: {
          insert: (insert) => {
            api.untracked(insert);
          },
        },
      } satisfies BasePluginOverride<TrailingBlockDefinition>,
    },
  },
})).configure({
  component: SuggestionLeaf,
  on: {
    // unset active suggestion when clicking outside of suggestion
    click: ({ api, event, name, read, store }) => {
      const markTarget = getDiscussionClickTarget({
        selector: `.plite-${name}`,
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
        activeId: suggestionEntry ? (api.id(suggestionEntry[0]) ?? null) : null,
      });
    },
  },
  inject: {
    isElement: true,
    nodeProps: {
      nodeKey: '',
      styleKey: 'cssText',
      transformProps: ({ editor, element, props }) => {
        if (!element) return props;

        const { api } = editor.plugin(BaseSuggestionPlugin);
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
  targetPlugins: INLINE_SUGGESTION_RENDER_TARGETS,
});

export const SuggestionKit = [suggestionPlugin];
