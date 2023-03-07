import { TEditor, TElement, TNodeProps, Value } from '../interfaces';
import { setNodes, SetNodesOptions } from './setNodes';

export const setElements = <V extends Value>(
  editor: TEditor<V>,
  props: Partial<TNodeProps<TElement>>,
  options?: SetNodesOptions
) => setNodes<TElement>(editor, props, options);
