import { Editor, Node, Path, Range, Text, Transforms } from 'slate';
import { TEditor, Value } from './TEditor';

/**
 * Add a custom property to the leaf text nodes in the current selection.
 *
 * If the selection is currently collapsed, the marks will be added to the
 * `editor.marks` property instead, and applied when text is inserted next.
 */
export const addMark = <V extends Value>(
  editor: TEditor<V>,
  key: string,
  value: any
) => Editor.addMark(editor as any, key, value);

export const addRangeMark = <V extends Value>(
  editor: TEditor<V>,
  props: any,
  {
    at = editor.selection,
  }: {
    at?: Range | null;
  } = {}
) => {
  if (at) {
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
    const expandedSelection = Range.isExpanded(at);
    let markAcceptingVoidSelected = false;
    if (!expandedSelection) {
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
    if (expandedSelection || markAcceptingVoidSelected) {
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
