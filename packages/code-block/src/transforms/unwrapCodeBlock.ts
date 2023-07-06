import {
  ELEMENT_DEFAULT,
  PlateEditor,
  Value,
  getChildren,
  getNodeEntries,
  getPluginType,
  setElements,
  unwrapNodes,
  withoutNormalizing,
} from '@udecode/plate-common';
import { Location } from 'slate';

import { ELEMENT_CODE_BLOCK } from '../constants';

export const unwrapCodeBlock = <V extends Value>(editor: PlateEditor<V>) => {
  if (!editor.selection) return;

  const codeBlockType = getPluginType(editor, ELEMENT_CODE_BLOCK);
  const defaultType = getPluginType(editor, ELEMENT_DEFAULT);

  withoutNormalizing(editor, () => {
    const codeBlockEntries = getNodeEntries(editor, {
      at: editor.selection as Location,
      match: { type: codeBlockType },
    });

    const reversedCodeBlockEntries = Array.from(codeBlockEntries).reverse();

    for (const codeBlockEntry of reversedCodeBlockEntries) {
      const codeLineEntries = getChildren(codeBlockEntry);

      for (const [, path] of codeLineEntries) {
        setElements(editor, { type: defaultType }, { at: path });
      }

      unwrapNodes(editor, {
        at: codeBlockEntry[1],
        match: { type: codeBlockType },
        split: true,
      });
    }
  });
};
