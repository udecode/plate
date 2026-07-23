import { toPlatePlugin } from '@platejs/core/react';

import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
  BaseCodeSyntaxPlugin,
} from '../lib/BaseCodeBlockPlugin';
import { getCodeBlockLanguageChange } from '../lib/withCodeBlock';

export const CodeSyntaxPlugin = toPlatePlugin(BaseCodeSyntaxPlugin);

export const CodeLinePlugin = toPlatePlugin(BaseCodeLinePlugin);

/** Enables support for pre-formatted code blocks. */
export const CodeBlockPlugin = toPlatePlugin(BaseCodeBlockPlugin, {
  plugins: [CodeLinePlugin, CodeSyntaxPlugin],
}).extendExtension('react', ({ editor, getOptions, type }) => ({
  onTransactionChange(context) {
    const shouldRefreshDecorations = Boolean(
      getOptions().lowlight && getCodeBlockLanguageChange(context, type)
    );

    if (shouldRefreshDecorations) editor.api.react.refreshDecorations();
  },
}));
