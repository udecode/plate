import { TEditor } from '@udecode/plate-core';
import {
  Editor,
  Element,
  Location,
  Node,
  Path,
  Range,
  Text,
  Transforms,
} from 'slate';
import { hasSingleChild } from '../queries/hasSingleChild';

/**
 * Merge a node at a location with the previous node of the same depth,
 * removing any empty containing nodes after the merge if necessary.
 */
export const mergeNodes = (
  editor: TEditor,
  options: {
    at?: Location;
    // match?: NodeMatch;
    match?: (n: Node) => boolean;
    mode?: 'highest' | 'lowest';
    hanging?: boolean;
    voids?: boolean;
    /**
     * Default: if the node isn't already the next sibling of the previous node, move
     * it so that it is before merging.
     */
    mergeNode?: (editor: TEditor, options: { at: Path; to: Path }) => void;
    /**
     * Default: if there was going to be an empty ancestor of the node that was merged,
     * we remove it from the tree.
     */
    removeEmptyAncestor?: (editor: TEditor, options: { at: Path }) => void;
  } = {}
): void => {
  Editor.withoutNormalizing(editor, () => {
    let { match, at = editor.selection } = options;
    const {
      mergeNode,
      removeEmptyAncestor,
      hanging = false,
      voids = false,
      mode = 'lowest',
    } = options;

    if (!at) {
      return;
    }

    if (match == null) {
      if (Path.isPath(at)) {
        const [parent] = Editor.parent(editor, at);
        match = (n) => parent.children.includes(n);
      } else {
        match = (n) => Editor.isBlock(editor, n);
      }
    }

    if (!hanging && Range.isRange(at)) {
      at = Editor.unhangRange(editor, at);
    }

    if (Range.isRange(at)) {
      if (Range.isCollapsed(at)) {
        at = at.anchor;
      } else {
        const [, end] = Range.edges(at);
        const pointRef = Editor.pointRef(editor, end);
        Transforms.delete(editor, { at });
        at = pointRef.unref()!;

        if (options.at == null) {
          Transforms.select(editor, at);
        }
      }
    }

    const [current] = Editor.nodes(editor, { at, match, voids, mode });
    const prev = Editor.previous(editor, { at, match, voids, mode });

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
    const levels = Array.from(Editor.levels(editor, { at: path }), ([n]) => n)
      .slice(commonPath.length)
      .slice(0, -1);

    // Determine if the merge will leave an ancestor of the path empty as a
    // result, in which case we'll want to remove it after merging.
    const emptyAncestor = Editor.above(editor, {
      at: path,
      mode: 'highest',
      match: (n) =>
        levels.includes(n) && Element.isElement(n) && hasSingleChild(n),
    });

    const emptyRef = emptyAncestor && Editor.pathRef(editor, emptyAncestor[1]);
    let properties;
    let position;

    // Ensure that the nodes are equivalent, and figure out what the position
    // and extra properties of the merge will be.
    if (Text.isText(node) && Text.isText(prevNode)) {
      const { text, ...rest } = node;
      position = prevNode.text.length;
      properties = rest as Partial<Text>;
    } else if (Element.isElement(node) && Element.isElement(prevNode)) {
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
    if (!isPreviousSibling) {
      // DIFF
      if (!mergeNode) {
        Transforms.moveNodes(editor, { at: path, to: newPath, voids });
      }
    }

    // If there was going to be an empty ancestor of the node that was merged,
    // we remove it from the tree.
    if (emptyRef) {
      // DIFF: start
      if (!removeEmptyAncestor) {
        Transforms.removeNodes(editor, { at: emptyRef.current!, voids });
      } else {
        const emptyPath = emptyRef.current;
        emptyPath && removeEmptyAncestor(editor, { at: emptyPath });
      }
      // DIFF: end
    }

    // If the target node that we're merging with is empty, remove it instead
    // of merging the two. This is a common rich text editor behavior to
    // prevent losing formatting when deleting entire nodes when you have a
    // hanging selection.
    // DIFF: start
    if (mergeNode) {
      mergeNode(editor, { at: path, to: newPath });
      // DIFF: end
    } else if (
      (Element.isElement(prevNode) && Editor.isEmpty(editor, prevNode)) ||
      (Text.isText(prevNode) && prevNode.text === '')
    ) {
      Transforms.removeNodes(editor, { at: prevPath, voids });
    } else {
      editor.apply({
        type: 'merge_node',
        path: newPath,
        position,
        properties,
      });
    }

    if (emptyRef) {
      emptyRef.unref();
    }
  });
};
