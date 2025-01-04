import { type Location, Path, Range, Text } from 'slate';

import type { TNode } from '../interfaces';
import type { TEditor } from '../interfaces/editor/TEditor';

/** Add marks to each node of a range. */
export const addRangeMarks = (
  editor: TEditor,
  props: any,
  {
    at = editor.selection,
  }: {
    at?: Location | null;
  } = {}
) => {
  if (at) {
    if (Path.isPath(at)) {
      at = editor.api.range(at)!;
    }

    const match = (node: TNode, path: Path) => {
      if (!Text.isText(node)) {
        return false; // marks can only be applied to text
      }

      const parentEntry = editor.api.parent(path);

      if (!parentEntry) return false;

      const [parentNode] = parentEntry;

      return (
        !editor.isVoid(parentNode as any) ||
        editor.markableVoid(parentNode as any)
      );
    };
    const isExpandedRange = Range.isExpanded(at as Range);
    let markAcceptingVoidSelected = false;

    if (!isExpandedRange) {
      const selectedEntry = editor.api.node(at);

      if (!selectedEntry) return;

      const [selectedNode, selectedPath] = selectedEntry;

      if (selectedNode && match(selectedNode, selectedPath)) {
        const parentEntry = editor.api.parent(selectedPath);

        if (!parentEntry) return;

        const [parentNode] = parentEntry;

        markAcceptingVoidSelected =
          parentNode && editor.markableVoid(parentNode as any);
      }
    }
    if (isExpandedRange || markAcceptingVoidSelected) {
      editor.tf.setNodes(props, {
        at,
        match,
        split: true,
        voids: true,
      });
    }
    // else {
    //   const marks = {
    //     ...(Editor.marks(editor as any) || {}),
    //     [key]: value,
    //   };
    //
    //   editor.marks = marks;
    //   if (!FLUSHING.get(editor as any)) {
    //     editor.onChange();
    //   }
    // }
  }
};
