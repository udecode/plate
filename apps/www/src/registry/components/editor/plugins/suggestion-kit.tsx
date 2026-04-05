'use client';

import type { ExtendConfig } from 'platejs';

import {
  type BaseSuggestionConfig,
  BaseSuggestionPlugin,
} from '@platejs/suggestion';
import { toTPlatePlugin } from 'platejs/react';

import { getAnnotationClickTarget } from '@/registry/lib/get-annotation-click-target';
import {
  SuggestionLeaf,
  SuggestionLineBreak,
} from '@/registry/ui/suggestion-node';
import { discussionPlugin } from './discussion-kit';

export type SuggestionConfig = ExtendConfig<
  BaseSuggestionConfig,
  {
    activeId: string | null;
    hoverId: string | null;
  }
>;

export const suggestionPlugin = toTPlatePlugin<SuggestionConfig>(
  BaseSuggestionPlugin,
  ({ editor }) => ({
    options: {
      activeId: null,
      currentUserId: editor.getOption(discussionPlugin, 'currentUserId'),
      hoverId: null,
    },
  })
).configure({
  handlers: {
    // unset active suggestion when clicking outside of suggestion
    onClick: ({ api, event, setOption, type }) => {
      const activeTarget = getAnnotationClickTarget({
        allowBlockSuggestion: true,
        target: event.target,
        type,
      });

      if (!activeTarget) {
        setOption('activeId', null);
        return;
      }

      const suggestionEntry = api.suggestion?.node({
        isText: !activeTarget.isBlockSuggestion,
      });

      setOption(
        'activeId',
        suggestionEntry
          ? (api.suggestion?.nodeId(suggestionEntry[0]) ?? null)
          : null
      );
    },
  },
  render: {
    belowNodes: SuggestionLineBreak as any,
    node: SuggestionLeaf,
  },
});

export const SuggestionKit = [suggestionPlugin];
