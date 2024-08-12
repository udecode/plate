import { createPlugin } from '@udecode/plate-common';

export const ELEMENT_INLINE_EQUATION = 'inline_equation';

export const InlineEquationPlugin = createPlugin({
  isElement: true,
  isInline: true,
  isVoid: true,
  key: ELEMENT_INLINE_EQUATION,
});
