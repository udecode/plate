import type { TEquationElement } from '@udecode/plate-math';

import { type mdastUtilMath, MarkdownPlugin } from '@udecode/plate-markdown';
import {
  EquationPlugin,
  InlineEquationPlugin,
} from '@udecode/plate-math/react';
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
    },
    remarkPlugins: [remarkMath, remarkGfm],
  },
});
