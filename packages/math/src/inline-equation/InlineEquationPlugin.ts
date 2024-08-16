import { createPlugin } from '@udecode/plate-common';

export const InlineEquationPlugin = createPlugin({
  isElement: true,
  isInline: true,
  isVoid: true,
  key: 'inline_equation',
});
