import {
  type Editor,
  ElementApi,
  type MergeNodesOptions,
  NodeApi,
  PathApi,
  RangeApi,
  type TElement,
  TextApi,
  type TNode,
  type TText,
  type ValueOf,
} from '../../interfaces';
import { getQueryOptions } from '../../utils';

const hasSingleChildNest = (editor: Editor, node: TNode): boolean => {
  if (ElementApi.isElement(node)) {
    const element = node as TElement;
    if (editor.api.isVoid(node)) {
      return true;
    }
    if (element.children.length === 1) {
      return hasSingleChildNest(editor, element.children[0] as any);
    }
    return false;
  }
  if (NodeApi.isEditor(node)) {
    return false;
  }
  return true;
};

export const mergeNodes = <E extends Editor>(
  editor: E,
  options: MergeNodesOptions<ValueOf<E>, E> = {}
): void => {
  const _options = getQueryOptions(editor, options);

  editor.tf.withoutNormalizing(() => {
    let { at = editor.selection!, match } = _options;
    const { hanging = false, mode = 'lowest', voids = false } = _options;

    if (!at) {
      return;
    }

    if (match == null) {
      if (PathApi.isPath(at)) {
        const [parent] = editor.api.parent(at)!;
        match = (n: TNode) => parent.children.includes(n as any);
      } else {
        match = (n: TNode) => ElementApi.isElement(n) && editor.api.isBlock(n);
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

        if (_options.at == null) {
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
      match: (n) => levels.has(n) && hasSingleChildNest(editor, n),
    });

    const emptyRef = emptyAncestor && editor.api.pathRef(emptyAncestor[1]);
    let properties: Partial<TText> | Partial<TElement>;
    let position: number;

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

    // !PATCH: shouldMergeNodes
    if (
      !editor.api.shouldMergeNodes(prev, current, {
        reverse: _options.reverse,
      })
    ) {
      return;
    }

    // If the node isn't already the next sibling of the previous node, move
    // it so that it is before merging.
    if (!isPreviousSibling) {
      editor.tf.moveNodes({ at: path, to: newPath, voids });
    }

    // If there was going to be an empty ancestor of the node that was merged,
    // we remove it from the tree.
    if (emptyRef) {
      // !PATCH: event to override removeNodes
      editor.tf.removeNodes({
        at: emptyRef.current!,
        event: { type: 'mergeNodes' },
        voids,
      });
    }

    // !PATCH: moved up for early return
    if (emptyRef) {
      emptyRef.unref();
    }

    editor.tf.apply({
      path: newPath,
      position,
      properties,
      type: 'merge_node',
    });
  });
};
