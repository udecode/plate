import {
  type Editor,
  type MergeNodesOptions,
  type TElement,
  type TText,
  type ValueOf,
  ElementApi,
  NodeApi,
  PathApi,
  RangeApi,
  TextApi,
} from '../../interfaces';
import { getQueryOptions } from '../../utils';

export const mergeNodes = <E extends Editor>(
  editor: E,
  options: MergeNodesOptions<ValueOf<E>, E> = {}
): void => {
  options = getQueryOptions(editor, options);

  editor.tf.withoutNormalizing(() => {
    let { at = editor.selection!, match } = options;
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
      if (PathApi.isPath(at)) {
        const [parent] = editor.api.parent(at)!;
        match = (n) => parent.children.includes(n as any);
      } else {
        match = (n) => editor.api.isBlock(n);
      }
    }
    if (!hanging && RangeApi.isRange(at)) {
      at = editor.api.unhangRange(at);
    }
    if (RangeApi.isRange(at)) {
      if (RangeApi.isCollapsed(at)) {
        at = at.anchor;
      } else {
        const [, end] = RangeApi.edges(at);
        const pointRef = editor.api.pointRef(end);
        editor.tf.delete({ at });
        at = pointRef.unref()!;

        if (options.at == null) {
          editor.tf.select(at);
        }
      }
    }

    const _nodes = editor.api.nodes({ at, match, mode, voids });
    const [current] = Array.from(_nodes);
    const prev = editor.api.previous({ at, match, mode, voids });

    if (!current || !prev) {
      return;
    }

    const [node, path] = current;
    const [prevNode, prevPath] = prev;

    if (path.length === 0 || prevPath.length === 0) {
      return;
    }

    const newPath = PathApi.next(prevPath);
    const commonPath = PathApi.common(path, prevPath);
    const isPreviousSibling = PathApi.isSibling(path, prevPath);
    const _levels = editor.api.levels({ at: path });
    const levels = new Set(
      Array.from(_levels, ([n]) => n)
        .slice(commonPath.length)
        .slice(0, -1)
    );

    // Determine if the merge will leave an ancestor of the path empty as a
    // result, in which case we'll want to remove it after merging.
    const emptyAncestor = editor.api.above({
      at: path,
      mode: 'highest',
      match: (n) =>
        levels.has(n) && ElementApi.isElement(n) && NodeApi.hasSingleChild(n),
    });

    const emptyRef = emptyAncestor && editor.api.pathRef(emptyAncestor[1]);
    let properties;
    let position;

    // Ensure that the nodes are equivalent, and figure out what the position
    // and extra properties of the merge will be.
    if (TextApi.isText(node) && TextApi.isText(prevNode)) {
      const { text, ...rest } = node;
      position = prevNode.text.length;
      properties = rest as Partial<TText>;
    } else if (ElementApi.isElement(node) && ElementApi.isElement(prevNode)) {
      const { children, ...rest } = node;
      position = prevNode.children.length;
      properties = rest as Partial<TElement>;
    } else {
      throw new TypeError(
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
      (ElementApi.isElement(prevNode) && editor.api.isEmpty(prevNode)) ||
      (TextApi.isText(prevNode) && prevNode.text === '')
    ) {
      editor.tf.removeNodes({ at: prevPath, voids });
    } else {
      editor.tf.apply({
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
