import type { ExtendPlateEditorExtension } from '@platejs/core';
import { ElementApi } from '@platejs/plite';

import type { CodeBlockConfig } from './BaseCodeBlockPlugin';

import { setCodeBlockToDecorations } from './setCodeBlockToDecorations';

/** Refresh syntax decorations after code-block content changes. */
export const withNormalizeCodeBlock: ExtendPlateEditorExtension<
  CodeBlockConfig
> = ({ editor, getOptions, type }) => ({
  corrections: [
    {
      event: 'content',
      correct({ entry }) {
        const [node, path] = entry;

        if (!ElementApi.isElement(node)) {
          return;
        }

        if (node.type === type && getOptions().lowlight) {
          setCodeBlockToDecorations(editor, [node, path]);
        }
      },
    },
  ],
});
