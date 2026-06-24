import type { Editor } from '../interfaces/editor';
import { type Descendant, NodeApi } from '../interfaces/node';
import type { Operation } from '../interfaces/operation';
import { type Path, PathApi } from '../interfaces/path';

const getInsertedChildrenDirtyPaths = (
  parentPath: Path,
  startIndex: number,
  children: readonly Descendant[]
): Path[] =>
  children.flatMap((child, offset) => {
    const childPath = parentPath.concat(startIndex + offset);

    return NodeApi.isText(child)
      ? [childPath]
      : Array.from(NodeApi.nodes(child), ([, path]) => childPath.concat(path));
  });

/**
 * Get the "dirty" paths generated from an operation.
 */
export const getDirtyPaths = (editor: Editor, op: Operation): Path[] => {
  switch (op.type) {
    case 'insert_text':
    case 'remove_text':
    case 'set_node': {
      const { path } = op;
      return PathApi.levels(path);
    }

    case 'insert_node': {
      const { node, path } = op;
      const levels = PathApi.levels(path);
      const descendants = NodeApi.isText(node)
        ? []
        : Array.from(NodeApi.nodes(node), ([, p]) => path.concat(p));

      return [...levels, ...descendants];
    }

    case 'merge_node': {
      const { path } = op;
      const ancestors = PathApi.ancestors(path);
      const previousPath = PathApi.previous(path);
      return [...ancestors, previousPath];
    }

    case 'move_node': {
      const { path, newPath } = op;

      if (PathApi.equals(path, newPath)) {
        return [];
      }

      const oldAncestors: Path[] = [];
      const newAncestors: Path[] = [];

      for (const ancestor of PathApi.ancestors(path)) {
        const p = PathApi.transform(ancestor, op);
        oldAncestors.push(p!);
      }

      for (const ancestor of PathApi.ancestors(newPath)) {
        const p = PathApi.transform(ancestor, op);
        newAncestors.push(p!);
      }

      const newParent = newAncestors.at(-1)!;
      const newIndex = newPath.at(-1)!;
      const resultPath = newParent.concat(newIndex);

      return [...oldAncestors, ...newAncestors, resultPath];
    }

    case 'remove_node': {
      const { path } = op;
      const ancestors = PathApi.ancestors(path);
      return [...ancestors];
    }

    case 'replace_fragment': {
      const { newChildren, path } = op;

      return [
        ...PathApi.levels(path),
        ...getInsertedChildrenDirtyPaths(path, 0, newChildren),
      ];
    }

    case 'replace_children': {
      const { index, newChildren, path } = op;

      return [
        ...PathApi.levels(path),
        ...getInsertedChildrenDirtyPaths(path, index, newChildren),
      ];
    }

    case 'split_node': {
      const { path } = op;
      const levels = PathApi.levels(path);
      const nextPath = PathApi.next(path);
      return [...levels, nextPath];
    }

    default: {
      return [];
    }
  }
};
