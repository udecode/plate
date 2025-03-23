import { type mdastUtilMath, MarkdownPlugin } from '@udecode/plate-markdown';
import { type TEquationElement, BaseEquationPlugin } from '@udecode/plate-math';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';

export const markdownPlugins = MarkdownPlugin.configure({
  options: {
    components: {
      [BaseEquationPlugin.key]: {
        deserialize(astNode, options) {
          return [];
        },
        serialize: (node: TEquationElement): mdastUtilMath.Math => {
          return {
            type: 'math',
            value: node.texExpression,
          };
        },
      },
    },
    indentList: true,
    remarkPlugins: {
      deserialize: [remarkParse, remarkGfm],
      serialize: [remarkGfm, remarkMath, remarkStringify],
    },
  },
});
