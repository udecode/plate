import { isEmpty } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';
import type { IsElementEmptyOptions } from '../../interfaces/editor/editor-types';
import type { ElementOf } from '../../interfaces/element/TElement';

import { isText } from '../../interfaces';
import { getNextSiblingNodes } from '../../queries/getNextSiblingNodes';

export const isElementEmpty = <N extends ElementOf<E>, E extends TEditor>(
  editor: E,
  element?: N | null,
  options?: IsElementEmptyOptions
) => {
  if (options?.afterSelection) {
    if (!editor.selection) return false;

    const blockAbove = editor.api.block();

    if (!blockAbove) return false;

    const cursor = editor.selection.focus;
    const selectionParentEntry = editor.api.parent(editor.selection);

    if (!selectionParentEntry) return false;

    const [, selectionParentPath] = selectionParentEntry;

    if (!editor.api.isEnd(cursor, selectionParentPath)) return false;

    const siblingNodes = getNextSiblingNodes(blockAbove, cursor.path);

    if (siblingNodes.length > 0) {
      for (const siblingNode of siblingNodes) {
        if (isText(siblingNode) && siblingNode.text) {
          return false;
        }
      }
    } else {
      return editor.api.isEnd(cursor, blockAbove[1]);
    }

    return true;
  }
  if (!element) {
    const block = editor.api.block()?.[0];

    if (!block) return false;

    return (
      !editor.api.string(block) &&
      !block.children.some((n) => editor.api.isInline(n))
    );
  }

  return isEmpty(editor as any, element);
};
