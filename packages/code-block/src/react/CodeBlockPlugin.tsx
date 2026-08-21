import { toPlatePlugin } from '@platejs/core/react';
import { PLUGINS } from '@platejs/utils';

import {
  BaseCodeBlockPlugin,
  BaseCodeHighlightPlugin,
  BaseCodeLinePlugin,
} from '../lib/BaseCodeBlockPlugin';
import { findCodeBlockLanguageChange } from '../lib/codeHighlight.internal';

export const CodeLinePlugin = toPlatePlugin(BaseCodeLinePlugin);

/** Enables support for pre-formatted code blocks. */
export const CodeBlockPlugin = toPlatePlugin(BaseCodeBlockPlugin, {
  dependencies: [CodeLinePlugin],
});

/** Adds Lowlight syntax highlighting to code blocks. */
export const CodeHighlightPlugin = toPlatePlugin(BaseCodeHighlightPlugin, {
  dependencies: [CodeBlockPlugin],
}).extend(({ editor, store }) => ({
  on: {
    transactionChange(context) {
      if (!store.get().lowlight) return;

      if (
        findCodeBlockLanguageChange(
          context,
          editor.plugin(PLUGINS.codeBlock).schema.type
        )
      ) {
        editor.api.react.refreshDecorations();
      }
    },
  },
}));
