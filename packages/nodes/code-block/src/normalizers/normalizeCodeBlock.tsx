import {
  getChildren,
  getPluginType,
  isElement,
  PlateEditor,
  setNodes,
  TElement,
  TNodeEntry,
  Value,
} from '@udecode/plate-core';
import { ELEMENT_CODE_BLOCK, ELEMENT_CODE_LINE } from '../constants';

/**
 * Normalize code block node to force the pre>code>div.codeline structure.
 */
export const normalizeCodeBlock = <V extends Value>(editor: PlateEditor<V>) => {
  const codeBlockType = getPluginType(editor, ELEMENT_CODE_BLOCK);
  const codeLineType = getPluginType(editor, ELEMENT_CODE_LINE);

  const { normalizeNode } = editor;
  return ([node, path]: TNodeEntry) => {
    if (!isElement(node)) {
      return normalizeNode([node, path]);
    }

    const isCodeBlockRoot = node.type === codeBlockType;
    if (isCodeBlockRoot) {
      // Children should all be code lines
      const nonCodeLine = getChildren([node, path]).find(
        ([child]) => child.type !== codeLineType
      );
      if (nonCodeLine) {
        return setNodes<TElement>(
          editor,
          { type: codeLineType },
          { at: nonCodeLine[1] }
        );
      }
      return normalizeNode([node, path]);
    }
  };
};
