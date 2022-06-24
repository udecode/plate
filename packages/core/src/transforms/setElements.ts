import { TEditor, Value } from '../slate/editor/TEditor';
import { TElement } from '../slate/element/TElement';
import { TNodeProps } from '../slate/node/TNode';
import { setNodes, SetNodesOptions } from '../slate/transforms/setNodes';

export const setElements = <V extends Value>(
  editor: TEditor<V>,
  props: Partial<TNodeProps<TElement>>,
  options?: SetNodesOptions
) => setNodes<TElement>(editor, props, options);
