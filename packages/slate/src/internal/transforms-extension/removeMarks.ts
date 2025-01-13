import castArray from 'lodash/castArray.js';

import {
  type Editor,
  type Path,
  type RemoveMarksOptions,
  type TElement,
  type TNode,
  RangeApi,
  TextApi,
} from '../../interfaces';

export const removeMarks = (
  editor: Editor,
  keys?: string[] | string | null,
  { at, shouldChange = true, ...options }: RemoveMarksOptions = {}
) => {
  const selection = at ?? editor.selection;

  if (!selection) return;

  const match = (node: TNode, path: Path) => {
    if (!TextApi.isText(node)) {
      return false; // marks can only be applied to text
    }

    const [parentNode] = editor.api.parent<TElement>(path)!;

    return (
      !editor.api.isVoid(parentNode) || editor.api.markableVoid(parentNode)
    );
  };

  const expandedSelection = RangeApi.isExpanded(selection);
  let markAcceptingVoidSelected = false;

  if (!expandedSelection) {
    const [selectedNode, selectedPath] = editor.api.node(selection)!;

    if (selectedNode && match(selectedNode, selectedPath)) {
      const [parentNode] = editor.api.parent<TElement>(selectedPath)!;
      markAcceptingVoidSelected =
        parentNode && editor.api.markableVoid(parentNode);
    }
  }
  if (keys && (expandedSelection || markAcceptingVoidSelected)) {
    const props = castArray(keys);

    editor.tf.unsetNodes(props, {
      at: selection,
      match,
      split: true,
      voids: true,
      ...options,
    });
  } else if (!at) {
    // Only modify editor.marks when no custom range is provided and selection is collapsed
    const marks = { ...editor.api.marks() };

    if (keys) {
      castArray(keys).forEach((k) => {
        delete marks[k];
      });
      editor.marks = marks;
    } else {
      editor.marks = {};
    }

    // Slate does not export FLUSHING so we need to call onChange manually
    shouldChange && editor.api.onChange();
  }
};
