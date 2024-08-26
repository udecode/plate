import { createPluginFactory } from '@udecode/plate-common/server';

import { withInlineDate } from './withInlineDate';

export const ELEMENT_INLINE_DATE = 'inline_date';

export const createInlineDatePlugin = createPluginFactory({
  handlers: {},
  isElement: true,
  isInline: true,
  isVoid: true,
  key: ELEMENT_INLINE_DATE,
  withOverrides: withInlineDate,
});
