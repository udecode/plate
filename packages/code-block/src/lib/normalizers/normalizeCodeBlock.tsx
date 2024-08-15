import {
  type PlateEditor,
  type TElement,
  type TNodeEntry,
  getChildren,
  getPluginType,
  isElement,
  setNodes,
} from '@udecode/plate-common';

import { CodeBlockPlugin } from '../CodeBlockPlugin';
import { getCodeLineType } from '../options';

/** Normalize code block node to force the pre>code>div.codeline structure. */
export const normalizeCodeBlock = (editor: PlateEditor) => {
  const codeBlockType = editor.getType(CodeBlockPlugin);
  const codeLineType = getCodeLineType(editor);

  const { normalizeNode } = editor;

  return ([node, path]: TNodeEntry) => {
    normalizeNode([node, path]);

    if (!isElement(node)) {
      return;
    }

    const isCodeBlockRoot = node.type === codeBlockType;

    if (isCodeBlockRoot) {
      // Children should all be code lines
      const nonCodeLine = getChildren([node, path]).find(
        ([child]) => child.type !== codeLineType
      );

      if (nonCodeLine) {
        setNodes<TElement>(
          editor,
          { type: codeLineType },
          { at: nonCodeLine[1] }
        );
      }
    }
  };
};
