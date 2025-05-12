'use client';

import {
  type ExtendConfig,
  type Path,
  isSlateEditor,
  isSlateElement,
  isSlateString,
} from '@udecode/plate';
import {
  type BaseSuggestionConfig,
  BaseSuggestionPlugin,
} from '@udecode/plate-suggestion';
import { toTPlatePlugin } from '@udecode/plate/react';

import { discussionPlugin } from '@/components/editor/plugins/discussion-plugin';
import { BlockSuggestion } from '@/components/ui/block-suggestion';

export type SuggestionConfig = ExtendConfig<
  BaseSuggestionConfig,
  {
    activeId: string | null;
    hoverId: string | null;
    uniquePathMap: Map<string, Path>;
  }
>;

export const suggestionPlugin = toTPlatePlugin<SuggestionConfig>(
  BaseSuggestionPlugin,
  ({ editor }) => ({
    handlers: {
      // unset active suggestion when clicking outside of suggestion
      onClick: ({ api, event, setOption, type }) => {
        let leaf = event.target as HTMLElement;
        let isSet = false;

        const unsetActiveSuggestion = () => {
          setOption('activeId', null);
          isSet = true;
        };

        if (!isSlateString(leaf)) unsetActiveSuggestion();

        while (
          leaf.parentElement &&
          !isSlateElement(leaf.parentElement) &&
          !isSlateEditor(leaf.parentElement)
        ) {
          if (leaf.classList.contains(`slate-${type}`)) {
            const suggestionEntry = api.suggestion!.node({ isText: true });

            if (!suggestionEntry) {
              unsetActiveSuggestion();

              break;
            }

            const id = api.suggestion!.nodeId(suggestionEntry[0]);

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
      currentUserId: editor.getOption(discussionPlugin, 'currentUserId'),
      hoverId: null,
      uniquePathMap: new Map(),
    },
    render: {
      belowRootNodes: ({ api, element }) => {
        if (!api.suggestion!.isBlockSuggestion(element)) {
          return null;
        }

        return <BlockSuggestion element={element} />;
      },
    },
  })
);
