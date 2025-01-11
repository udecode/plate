import { setNodes as setNodesBase } from 'slate';

import type {
  DescendantOf,
  Editor,
  Path,
  SetNodesOptions,
  TNode,
  ValueOf,
} from '../../interfaces';
import type { NodeProps } from '../../interfaces/node';

import { PathApi, RangeApi, TextApi } from '../../interfaces';
import { getAt, getQueryOptions } from '../../utils';

export const setNodes = <N extends DescendantOf<E>, E extends Editor = Editor>(
  editor: E,
  props: Partial<NodeProps<N>>,
  { marks, ...options }: SetNodesOptions<ValueOf<E>> & {} = {}
) => {
  if (marks) {
    let at = getAt(editor, options.at) ?? editor.selection;

    if (!at) return;
    if (PathApi.isPath(at)) {
      at = editor.api.range(at)!;
    }
    if (!RangeApi.isRange(at)) return;

    const match = (node: TNode, path: Path) => {
      if (!TextApi.isText(node)) return false;

      const parentEntry = editor.api.parent(path);

      if (!parentEntry) return false;

      const [parentNode] = parentEntry;

      return (
        !editor.api.isVoid(parentNode as any) ||
        editor.api.markableVoid(parentNode as any)
      );
    };

    const isExpandedRange = RangeApi.isExpanded(at);
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
          parentNode && editor.api.markableVoid(parentNode as any);
      }
    }
    if (isExpandedRange || markAcceptingVoidSelected) {
      return setNodesBase(
        editor as any,
        props as any,
        getQueryOptions(editor, {
          ...options,
          at,
          match,
          split: true,
          voids: true,
        })
      );
    }
  }

  return setNodesBase(
    editor as any,
    props as any,
    getQueryOptions(editor, options)
  );
};
