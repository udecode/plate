import type { Location } from 'slate';

import {
  type ElementOf,
  type PlateEditor,
  type TElement,
  type TNodeEntry,
  getAboveNode,
  getParentNode,
  isElement,
  someNode,
} from '@udecode/plate-common';

import { CodeLinePlugin } from '../CodeBlockPlugin';

/** If at (default = selection) is in ul>li>p, return li and ul node entries. */
export const getCodeLineEntry = <N extends ElementOf<E>, E extends PlateEditor>(
  editor: E,
  { at = editor.selection }: { at?: Location | null } = {}
) => {
  if (
    at &&
    someNode(editor, {
      at,
      match: { type: editor.getType(CodeLinePlugin) },
    })
  ) {
    const selectionParent = getParentNode(editor, at);

    if (!selectionParent) return;

    const [, parentPath] = selectionParent;

    const codeLine =
      getAboveNode<TElement>(editor, {
        at,
        match: { type: editor.getType(CodeLinePlugin) },
      }) || getParentNode<N>(editor, parentPath);

    if (!codeLine) return;

    const [codeLineNode, codeLinePath] = codeLine;

    if (
      isElement(codeLineNode) &&
      codeLineNode.type !== editor.getType(CodeLinePlugin)
    )
      return;

    const codeBlock = getParentNode<N>(editor, codeLinePath);

    if (!codeBlock) return;

    return {
      codeBlock,
      codeLine: codeLine as TNodeEntry<N>,
    };
  }
};
