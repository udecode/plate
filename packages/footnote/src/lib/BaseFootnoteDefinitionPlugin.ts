import { BaseParagraphPlugin, createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

/** Enables support for block footnote definitions. */
export const BaseFootnoteDefinitionPlugin = createBasePlugin({
  key: KEYS.footnoteDefinition,
  schema: ({ plugins }) => ({
    element: {
      content: plugins.blockContent({
        default: { type: plugins.elementType(BaseParagraphPlugin) },
        min: 1,
      }),
      properties: { identifier: property.string() },
    },
  }),
});
