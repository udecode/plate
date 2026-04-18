import { createSlatePlugin, KEYS } from 'platejs';

/** Enables support for block footnote definitions. */
export const BaseFootnoteDefinitionPlugin = createSlatePlugin({
  key: KEYS.footnoteDefinition,
  node: {
    isElement: true,
  },
});
