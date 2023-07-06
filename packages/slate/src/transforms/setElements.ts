import { TEditor, TElement, TNodeProps, Value } from '../interfaces';
import { SetNodesOptions, setNodes } from '../interfaces/transforms/setNodes';

export const setElements = <V extends Value>(
  editor: TEditor<V>,
  props: Partial<TNodeProps<TElement>>,
  options?: SetNodesOptions
) => setNodes<TElement>(editor, props, options);
