import { Editor, Location, Node, Path, Range, Text, Transforms } from 'slate';

import { getRange } from '../interfaces';
import { TEditor, Value } from '../interfaces/editor/TEditor';

/**
 * Add marks to each node of a range.
 */
export const addRangeMarks = <V extends Value>(
  editor: TEditor<V>,
  props: any,
  {
    at = editor.selection,
  }: {
    at?: Location | null;
  } = {}
) => {
  if (at) {
    if (Path.isPath(at)) {
      at = getRange(editor as any, at);
    }

    const match = (node: Node, path: Path) => {
      if (!Text.isText(node)) {
        return false; // marks can only be applied to text
      }
      const parentEntry = Editor.parent(editor as any, path);
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
      const selectedEntry = Editor.node(editor as any, at);
      if (!selectedEntry) return;

      const [selectedNode, selectedPath] = selectedEntry;

      if (selectedNode && match(selectedNode, selectedPath)) {
        const parentEntry = Editor.parent(editor as any, selectedPath);
        if (!parentEntry) return;

        const [parentNode] = parentEntry;

        markAcceptingVoidSelected =
          parentNode && editor.markableVoid(parentNode as any);
      }
    }
    if (isExpandedRange || markAcceptingVoidSelected) {
      Transforms.setNodes(editor as any, props, {
        match,
        split: true,
        voids: true,
        at,
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
