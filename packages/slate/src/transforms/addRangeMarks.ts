import type { Editor } from '../interfaces/editor/editor';

import {
  type Path,
  type TLocation,
  type TNode,
  type TRange,
  PathApi,
  RangeApi,
  TextApi,
} from '../interfaces';

/** Add marks to each node of a range. */
export const addRangeMarks = (
  editor: Editor,
  props: any,
  {
    at = editor.selection!,
  }: {
    at?: TLocation;
  } = {}
) => {
  if (!at) return;
  if (PathApi.isPath(at)) {
    at = editor.api.range(at)!;
  }

  const match = (node: TNode, path: Path) => {
    if (!TextApi.isText(node)) {
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
  const isExpandedRange = RangeApi.isExpanded(at as TRange);
  let markAcceptingVoidSelected = false;

  if (!isExpandedRange) {
    const selectedEntry = editor.api.node(at!);

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
};
