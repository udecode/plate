import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

/** Enables support for block footnote definitions. */
export const BaseFootnoteDefinitionPlugin = createBasePlugin({
  key: KEYS.footnoteDefinition,
  node: {
    isElement: true,
  },
});
