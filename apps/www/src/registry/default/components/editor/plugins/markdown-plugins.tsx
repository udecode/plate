import type { TEquationElement } from '@udecode/plate-math';
import type { TSuggestionText } from '@udecode/plate-suggestion';
import type * as mdastUtilMath from 'mdast-util-math';

import { type mdast, MarkdownPlugin } from '@udecode/plate-markdown';
import {
  EquationPlugin,
  InlineEquationPlugin,
} from '@udecode/plate-math/react';
import { SuggestionPlugin } from '@udecode/plate-suggestion/react';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

export const markdownPlugins = MarkdownPlugin.configure({
  options: {
    components: {
      [EquationPlugin.key]: {
        deserialize: (node: mdastUtilMath.Math): TEquationElement => {
          return {
            children: [{ text: '' }],
            texExpression: node.value,
            type: 'equation',
          };
        },
        serialize: (node: TEquationElement): mdastUtilMath.Math => {
          return {
            type: 'math',
            value: node.texExpression,
          };
        },
      },
      [InlineEquationPlugin.key]: {
        deserialize: (node: mdastUtilMath.InlineMath): TEquationElement => {
          return {
            children: [{ text: '' }],
            texExpression: node.value,
            type: 'inline_equation',
          };
        },
        serialize: (node: TEquationElement): mdastUtilMath.InlineMath => {
          return {
            type: 'inlineMath',
            value: node.texExpression,
          };
        },
      },
      [SuggestionPlugin.key]: {
        isLeaf: true,
        serialize: (node: TSuggestionText, options): mdast.Text => {
          if (options.ignoreSuggestionType) {
            const suggestionData = options.editor
              .getApi(SuggestionPlugin)
              .suggestion.suggestionData(node);

            if (suggestionData?.type === options.ignoreSuggestionType)
              return {
                type: 'text',
                value: '',
              };
          }

          return {
            type: 'text',
            value: node.text,
          };
        },
      },
    },
    remarkPlugins: [remarkMath, remarkGfm],
  },
});
