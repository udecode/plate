import {
  type Descendant,
  ElementApi,
  type EditorStateView,
  type Node,
  type Path,
  type Value,
} from '@platejs/plite';
import type { BasePlateEditor } from 'platejs';

type RuntimeReadableTableEditor = BasePlateEditor & {
  read?: <T>(fn: (state: EditorStateView<Value>) => T) => T;
};

export const findTableNodePath = (
  editor: BasePlateEditor,
  node: Descendant
): Path | undefined => {
  const runtimeEditor = editor as RuntimeReadableTableEditor;
  const path = runtimeEditor.read?.(
    (state) =>
      state.nodes.find({
        at: [],
        match: (candidate: Node) => candidate === node,
        mode: 'all',
        voids: true,
      })?.[1]
  );

  if (path) return path;

  const findInChildren = (
    children: readonly Descendant[],
    parentPath: Path = []
  ): Path | undefined => {
    for (const [index, child] of children.entries()) {
      const childPath = [...parentPath, index];

      if (child === node) return childPath;

      if (ElementApi.isElement(child)) {
        const descendantPath = findInChildren(child.children, childPath);

        if (descendantPath) return descendantPath;
      }
    }
  };

  return findInChildren(editor.children);
};
