'use client';

import type {
  BasePluginOverride,
  ExtendConfig,
  TrailingBlockConfig,
} from 'platejs';

import { KEYS, TextApi } from 'platejs';
import { BaseSuggestionPlugin } from '@platejs/suggestion';
import type { BaseSuggestionConfig } from '@platejs/suggestion';
import { toPlatePlugin } from 'platejs/react';

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

export type SuggestionConfig = ExtendConfig<
  BaseSuggestionConfig,
  {
    activeId: string | null;
    hoverId: string | null;
  }
>;

const INLINE_SUGGESTION_RENDER_TARGETS = [
  KEYS.date,
  KEYS.inlineEquation,
  KEYS.link,
  KEYS.mention,
];

export const suggestionPlugin = toPlatePlugin<
  BaseSuggestionConfig,
  {
    activeId: string | null;
    hoverId: string | null;
  }
>(BaseSuggestionPlugin, ({ editor }) => ({
  options: {
    activeId: null,
    currentUserId: editor.plugin(discussionPlugin).getOption('currentUserId'),
    hoverId: null,
  },
})).configure({
  component: SuggestionLeaf,
  handlers: {
    // unset active suggestion when clicking outside of suggestion
    onClick: ({ api, event, setOption, type }) => {
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
        setOption('activeId', null);
        return;
      }

      const suggestionEntry = api.node({
        isText: !blockTarget,
      });

      setOption(
        'activeId',
        suggestionEntry ? (api.nodeId(suggestionEntry[0]) ?? null) : null
      );
    },
  },
  inject: {
    isElement: true,
    nodeProps: {
      nodeKey: '',
      styleKey: 'cssText',
      transformProps: ({ editor, element, props }) => {
        if (!element) return props;

        const suggestionApi = editor.plugin(BaseSuggestionPlugin).api;
        let suggestionData = suggestionApi.suggestionData(element);

        if (!suggestionData) {
          for (const child of element.children) {
            if (!TextApi.isText(child)) continue;

            suggestionData = suggestionApi.dataList(child).at(-1);
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
  override: {
    plugins: {
      [KEYS.trailingBlock]: {
        options: {
          insert: (editor, { insert }) => {
            editor.plugin(BaseSuggestionPlugin).api.untracked(insert);
          },
        },
      } satisfies BasePluginOverride<TrailingBlockConfig>,
    },
  },
  render: {
    belowNodes: SuggestionLineBreak,
    belowRootNodes: VoidRemoveSuggestionOverlay,
  },
  targetPluginKeys: INLINE_SUGGESTION_RENDER_TARGETS,
});

export const SuggestionKit = [suggestionPlugin];
