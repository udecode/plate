import { createEditorPlugin, KEYS } from 'platejs';

/** Enables support for block footnote definitions. */
export const BaseFootnoteDefinitionPlugin = createEditorPlugin({
  key: KEYS.footnoteDefinition,
  node: {
    isElement: true,
  },
});
