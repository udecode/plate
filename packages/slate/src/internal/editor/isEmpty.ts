import { Path, isEmpty as isEmptyBase } from 'slate';

import type { Editor } from '../../interfaces/editor/editor';
import type { IsElementEmptyOptions } from '../../interfaces/editor/editor-types';
import type { At } from '../../types';

import { TextApi, isNode } from '../../interfaces';
import { getNextSiblingNodes } from '../../queries/getNextSiblingNodes';
import { isEditor } from './isEditor';

export const isEmpty = <E extends Editor>(
  editor: E,
  target: At | null = [],
  options?: IsElementEmptyOptions
) => {
  if (target === null) return true;
  if ((Path.isPath(target) && target.length === 0) || isEditor(target)) {
    return (
      editor.children.length === 1 &&
      isEmptyBase(editor as any, editor.children[0] as any)
    );
  }
  if (options?.after) {
    const blockAbove = editor.api.block({ at: target });

    if (!blockAbove) return false;

    const cursor = editor.api.point(target)!;
    const selectionParentEntry = editor.api.parent(target);

    if (!selectionParentEntry) return false;

    const [, selectionParentPath] = selectionParentEntry;

    if (!editor.api.isEnd(cursor, selectionParentPath)) return false;

    const siblingNodes = getNextSiblingNodes(blockAbove, cursor.path);

    if (siblingNodes.length > 0) {
      for (const siblingNode of siblingNodes) {
        if (TextApi.isText(siblingNode) && siblingNode.text) {
          return false;
        }
      }
    } else {
      return editor.api.isEnd(cursor, blockAbove[1]);
    }

    return true;
  }
  if (Path.isPath(target)) {
    return isEmptyBase(editor as any, editor.api.node(target)?.[0] as any);
  }
  if (options?.block) {
    const block = editor.api.block({ at: target });

    if (!block) return false;

    target = block[0];
  }
  if (!isNode(target)) {
    const nodes = editor.api.nodes({ at: target, ...options });

    for (const node of nodes) {
      if (!isEmptyBase(editor as any, node[0] as any)) {
        return false;
      }
    }

    return true;
  }

  return isEmptyBase(editor as any, target as any);
};
