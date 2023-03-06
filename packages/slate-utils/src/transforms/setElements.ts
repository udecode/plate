import {
  setNodes,
  SetNodesOptions,
  TEditor,
  TElement,
  TNodeProps,
  Value,
} from '@udecode/slate';

export const setElements = <V extends Value>(
  editor: TEditor<V>,
  props: Partial<TNodeProps<TElement>>,
  options?: SetNodesOptions
) => setNodes<TElement>(editor, props, options);
