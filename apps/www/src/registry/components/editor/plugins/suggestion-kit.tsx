'use client';

import type { Element } from '@platejs/plite';
import type { BaseEditor, ExtendConfig } from 'platejs';

import { KEYS, TextApi, TrailingBlockPlugin } from 'platejs';
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

function getInlineSuggestionData(editor: BaseEditor, element: Element) {
  const suggestionApi = editor.plugin(BaseSuggestionPlugin).api;
  const data = suggestionApi.suggestionData(element);

  if (data) return data;
  if (typeof suggestionApi.dataList !== 'function') return;

  for (const child of element.children) {
    if (!TextApi.isText(child)) continue;

    const childData = suggestionApi.dataList(child).at(-1);

    if (childData) return childData;
  }
}

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

        const suggestionData = getInlineSuggestionData(editor, element);

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
    node: SuggestionLeaf,
  },
  targetPluginKeys: INLINE_SUGGESTION_RENDER_TARGETS,
});

const trailingBlockPlugin = TrailingBlockPlugin.configure({
  options: {
    insert: (editor, { insert }) => {
      editor.plugin(suggestionPlugin).api.untracked(insert);
    },
  },
});

export const SuggestionKit = [suggestionPlugin, trailingBlockPlugin];
