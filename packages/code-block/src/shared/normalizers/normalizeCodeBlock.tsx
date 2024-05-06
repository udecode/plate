import {
  type PlateEditor,
  type TElement,
  type TNodeEntry,
  type Value,
  getChildren,
  getPluginType,
  isElement,
  setNodes,
} from '@udecode/plate-common/server';

import { ELEMENT_CODE_BLOCK } from '../constants';
import { getCodeLineType } from '../options';

/** Normalize code block node to force the pre>code>div.codeline structure. */
export const normalizeCodeBlock = <V extends Value>(editor: PlateEditor<V>) => {
  const codeBlockType = getPluginType(editor, ELEMENT_CODE_BLOCK);
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
