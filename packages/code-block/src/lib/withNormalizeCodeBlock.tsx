import type { ExtendPlateEditorExtension } from '@platejs/core';
import { ElementApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { CodeBlockConfig } from './BaseCodeBlockPlugin';

import { setCodeBlockToDecorations } from './setCodeBlockToDecorations';

/** Normalize code block node to force the pre>code>div.codeline structure. */
export const withNormalizeCodeBlock: ExtendPlateEditorExtension<
  CodeBlockConfig
> = ({ editor, getOptions, type }) => ({
  normalizers: {
    node({ entry, next, tx }) {
      const [node, path] = entry;

      if (!ElementApi.isElement(node)) {
        next();
        return;
      }

      if (node.type === type && getOptions().lowlight) {
        setCodeBlockToDecorations(editor, [node, path]);
      }

      next();

      const codeBlockType = editor.getType(KEYS.codeBlock);
      const codeLineType = editor.getType(KEYS.codeLine);

      if (node.type !== codeBlockType) return;

      const nonCodeLineIndex = node.children.findIndex(
        (child) => ElementApi.isElement(child) && child.type !== codeLineType
      );

      if (nonCodeLineIndex !== -1) {
        tx.nodes.set(
          { type: codeLineType },
          { at: path.concat(nonCodeLineIndex) }
        );
      }
    },
  },
});
