import { type Element, type Text, Editor, Path, Range } from 'slate';

import type { MergeNodesOptions } from '../../interfaces/editor/editor-types';

import { type TEditor, type ValueOf, TextApi } from '../../interfaces';
import { isElement } from '../../interfaces/element/isElement';
import { hasSingleChild } from '../../interfaces/node/hasSingleChild';
import { createPathRef } from '../../internal/editor/createPathRef';
import { createPointRef } from '../../internal/editor/createPointRef';
import { getAboveNode } from '../../internal/editor/getAboveNode';
import { getNodeEntries } from '../../internal/editor/getNodeEntries';
import { getPreviousNode } from '../../internal/editor/getPreviousNode';
import { isBlock } from '../../internal/editor/isBlock';
import { withoutNormalizing } from '../../internal/editor/withoutNormalizing';
import { getQueryOptions } from '../../utils';
import { isEmpty } from '../editor/isEmpty';
import { select } from './select';

export const mergeNodes = <E extends TEditor>(
  editor: E,
  options: MergeNodesOptions<ValueOf<E>, E> = {}
): void => {
  options = getQueryOptions(editor, options);

  withoutNormalizing(editor as any, () => {
    let { at = editor.selection, match } = options;
    const {
      hanging = false,
      mergeNode,
      mode = 'lowest',
      removeEmptyAncestor,
      voids = false,
    } = options;

    if (!at) {
      return;
    }
    if (match == null) {
      if (Path.isPath(at)) {
        const [parent] = editor.api.parent(at)!;
        match = (n) => parent.children.includes(n as any);
      } else {
        match = (n) => isBlock(editor as any, n);
      }
    }
    if (!hanging && Range.isRange(at)) {
      at = Editor.unhangRange(editor as any, at);
    }
    if (Range.isRange(at)) {
      if (Range.isCollapsed(at)) {
        at = at.anchor;
      } else {
        const [, end] = Range.edges(at);
        const pointRef = createPointRef(editor as any, end);
        editor.tf.delete({ at });
        at = pointRef.unref()!;

        if (options.at == null) {
          select(editor as any, at);
        }
      }
    }

    const _nodes = getNodeEntries(editor as any, { at, match, mode, voids });
    const [current] = Array.from(_nodes);
    const prev = getPreviousNode(editor as any, { at, match, mode, voids });

    if (!current || !prev) {
      return;
    }

    const [node, path] = current;
    const [prevNode, prevPath] = prev;

    if (path.length === 0 || prevPath.length === 0) {
      return;
    }

    const newPath = Path.next(prevPath);
    const commonPath = Path.common(path, prevPath);
    const isPreviousSibling = Path.isSibling(path, prevPath);
    const _levels = Editor.levels(editor as any, { at: path });
    const levels = new Set(
      Array.from(_levels, ([n]) => n)
        .slice(commonPath.length)
        .slice(0, -1)
    );

    // Determine if the merge will leave an ancestor of the path empty as a
    // result, in which case we'll want to remove it after merging.
    const emptyAncestor = getAboveNode(editor as any, {
      at: path,
      match: (n) => levels.has(n) && isElement(n) && hasSingleChild(n),
      mode: 'highest',
    });

    const emptyRef =
      emptyAncestor && createPathRef(editor as any, emptyAncestor[1]);
    let properties;
    let position;

    // Ensure that the nodes are equivalent, and figure out what the position
    // and extra properties of the merge will be.
    if (TextApi.isText(node) && TextApi.isText(prevNode)) {
      const { text, ...rest } = node;
      position = prevNode.text.length;
      properties = rest as Partial<Text>;
    } else if (isElement(node) && isElement(prevNode)) {
      const { children, ...rest } = node;
      position = prevNode.children.length;
      properties = rest as Partial<Element>;
    } else {
      throw new Error(
        `Cannot merge the node at path [${path}] with the previous sibling because it is not the same kind: ${JSON.stringify(
          node
        )} ${JSON.stringify(prevNode)}`
      );
    }
    // If the node isn't already the next sibling of the previous node, move
    // it so that it is before merging.
    if (
      !isPreviousSibling && // DIFF
      !mergeNode
    ) {
      editor.tf.moveNodes({ at: path, to: newPath, voids });
    }
    // If there was going to be an empty ancestor of the node that was merged,
    // we remove it from the tree.
    if (emptyRef) {
      // DIFF: start
      if (removeEmptyAncestor) {
        const emptyPath = emptyRef.current;
        emptyPath && removeEmptyAncestor(editor as any, { at: emptyPath });
      } else {
        editor.tf.removeNodes({ at: emptyRef.current!, voids });
      }
      // DIFF: end
    }
    // If the target node that we're merging with is empty, remove it instead
    // of merging the two. This is a common rich text editor behavior to
    // prevent losing formatting when deleting entire nodes when you have a
    // hanging selection.
    // DIFF: start
    if (mergeNode) {
      mergeNode(editor as any, { at: path, to: newPath });
      // DIFF: end
    } else if (
      (isElement(prevNode) && isEmpty(editor as any, prevNode)) ||
      (TextApi.isText(prevNode) && prevNode.text === '')
    ) {
      editor.tf.removeNodes({ at: prevPath, voids });
    } else {
      editor.apply({
        path: newPath,
        position,
        properties,
        type: 'merge_node',
      });
    }
    if (emptyRef) {
      emptyRef.unref();
    }
  });
};
