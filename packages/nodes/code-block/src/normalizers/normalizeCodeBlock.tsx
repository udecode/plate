import {
  getChildren,
  getPluginType,
  isElement,
  PlateEditor,
  setNodes,
  TElement,
  TNodeEntry,
  Value,
  wrapNodes,
} from '@udecode/plate-core';
import { ELEMENT_CODE_BLOCK, ELEMENT_CODE_LINE } from '../constants';

/**
 * Normalize list node to force the ul>li>p+ul structure.
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
      const nonCodeLines = getChildren([node, path]).find(
        ([child]) => child.type !== codeLineType
      );
      if (nonCodeLines) {
        return setNodes<TElement>(
          editor,
          { type: codeLineType },
          { at: nonCodeLines[1] }
        );
      }
      return normalizeNode([node, path]);
    }
  };
};
