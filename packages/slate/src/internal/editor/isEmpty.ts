import { isEmpty as isEmptyBase } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';
import type { At } from '../../types';

import {
  type EditorEmptyOptions,
  NodeApi,
  PathApi,
  TextApi,
} from '../../interfaces';

export const isEmpty = <E extends Editor>(
  editor: E,
  target: At | null = [],
  options?: EditorEmptyOptions
) => {
  if (target === null) return true;
  if (
    (PathApi.isPath(target) && target.length === 0) ||
    NodeApi.isEditor(target)
  ) {
    return (
      editor.children.length === 1 &&
      isEmptyBase(editor as any, editor.children[0] as any)
    );
  }
  if (options?.after) {
    const blockAbove = editor.api.block({ above: true, at: target });

    if (!blockAbove) return false;

    const point = editor.api.point(target)!;
    const selectionParentEntry = editor.api.parent(target);

    if (!selectionParentEntry) return false;

    const [, selectionParentPath] = selectionParentEntry;

    if (!editor.api.isEnd(point, selectionParentPath)) return false;

    const siblingNodes = Array.from(
      NodeApi.children(editor, blockAbove[1], {
        from: PathApi.lastIndex(point.path) + 1,
      })
    ).map(([node]) => node);

    if (siblingNodes.length > 0) {
      for (const siblingNode of siblingNodes) {
        if (TextApi.isText(siblingNode) && siblingNode.text) {
          return false;
        }
      }
    } else {
      return editor.api.isEnd(point, blockAbove[1]);
    }

    return true;
  }
  if (PathApi.isPath(target)) {
    return isEmptyBase(editor as any, editor.api.node(target)?.[0] as any);
  }
  if (options?.block) {
    const block = editor.api.block({ at: target });

    if (!block) return false;

    target = block[0];
  }
  if (!NodeApi.isNode(target)) {
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
