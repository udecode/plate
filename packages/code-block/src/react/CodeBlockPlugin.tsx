import { toPlatePlugin } from '@platejs/core/react';
import { KEYS } from '@platejs/utils';

import { findCodeBlockLanguageChange } from '../lib/codeHighlight.internal';
import {
  BaseCodeBlockPlugin,
  BaseCodeHighlightPlugin,
  BaseCodeLinePlugin,
} from '../lib/BaseCodeBlockPlugin';

export const CodeLinePlugin = toPlatePlugin(BaseCodeLinePlugin);

/** Enables support for pre-formatted code blocks. */
export const CodeBlockPlugin = toPlatePlugin(BaseCodeBlockPlugin, {
  dependencies: [CodeLinePlugin],
});

/** Adds Lowlight syntax highlighting to code blocks. */
export const CodeHighlightPlugin = toPlatePlugin(BaseCodeHighlightPlugin, {
  dependencies: [CodeBlockPlugin],
}).extend(({ editor, store }) => ({
  extension: {
    key: 'react',
    on: {
      transactionChange(context) {
        if (!store.get().lowlight) return;

        if (
          findCodeBlockLanguageChange(context, editor.getType(KEYS.codeBlock))
        ) {
          editor.api.react.refreshDecorations();
        }
      },
    },
  },
}));
