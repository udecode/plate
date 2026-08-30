import { PLUGINS } from '../../../core';
import {
  BaseCodeBlockPlugin,
  BaseCodeHighlightPlugin,
  BaseCodeLinePlugin,
} from '../../../features/code-block/lib/BaseCodeBlockPlugin';
import { findCodeBlockLanguageChange } from '../../../features/code-block/lib/codeHighlight.internal';
import { toPlatePlugin } from '../../core';

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
