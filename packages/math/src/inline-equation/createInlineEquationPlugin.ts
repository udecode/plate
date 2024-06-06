import { createPluginFactory } from '@udecode/plate-common/server';

export const ELEMENT_INLINE_EQUATION = 'inline_equation';

export const createInlineEquationPlugin = createPluginFactory({
  isElement: true,
  isInline: true,
  isVoid: true,
  key: ELEMENT_INLINE_EQUATION,
});
