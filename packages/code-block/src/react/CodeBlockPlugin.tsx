import { toPlatePlugin } from '@platejs/core/react';

import {
  BaseCodeBlockPlugin,
  BaseCodeHighlightPlugin,
  BaseCodeLinePlugin,
} from '../lib/BaseCodeBlockPlugin';
import { getCodeBlockLanguageChange } from '../lib/withCodeBlock';

export const CodeLinePlugin = toPlatePlugin(BaseCodeLinePlugin);

/** Enables support for pre-formatted code blocks. */
export const CodeBlockPlugin = toPlatePlugin(BaseCodeBlockPlugin, {
  dependencies: [CodeLinePlugin],
});

/** Adds Lowlight syntax highlighting to code blocks. */
export const CodeHighlightPlugin = toPlatePlugin(BaseCodeHighlightPlugin, {
  dependencies: [CodeBlockPlugin],
}).extendExtension('react', ({ editor, getOptions }) => ({
  onTransactionChange(context) {
    const shouldRefreshDecorations = Boolean(
      getOptions().lowlight &&
        getCodeBlockLanguageChange(context, editor.getType(CodeBlockPlugin.key))
    );

    if (shouldRefreshDecorations) editor.api.react.refreshDecorations();
  },
}));
