import { BaseSuggestionPlugin } from '@platejs/suggestion';
import { PLUGINS, TextApi } from 'platejs';

import {
  SuggestionLeafStatic,
  VoidRemoveSuggestionOverlayStatic,
} from '@/registry/ui/suggestion-node-static';

const INLINE_SUGGESTION_RENDER_TARGETS = [
  PLUGINS.date,
  PLUGINS.inlineEquation,
  PLUGINS.link,
  PLUGINS.mention,
];

export const BaseSuggestionKit = [
  BaseSuggestionPlugin.configure({
    component: SuggestionLeafStatic,
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
      belowRootNodes: VoidRemoveSuggestionOverlayStatic,
    },
    targetPlugins: INLINE_SUGGESTION_RENDER_TARGETS,
  }),
];
