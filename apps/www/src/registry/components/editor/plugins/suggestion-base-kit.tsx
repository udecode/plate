import type { Element } from '@platejs/plite';
import type { BaseEditor } from 'platejs';

import { BaseSuggestionPlugin } from '@platejs/suggestion';
import { KEYS, TextApi } from 'platejs';

import {
  SuggestionLeafStatic,
  VoidRemoveSuggestionOverlayStatic,
} from '@/registry/ui/suggestion-node-static';

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

export const BaseSuggestionKit = [
  BaseSuggestionPlugin.configure({
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
      belowRootNodes: VoidRemoveSuggestionOverlayStatic,
      node: SuggestionLeafStatic,
    },
    targetPluginKeys: INLINE_SUGGESTION_RENDER_TARGETS,
  }),
];
