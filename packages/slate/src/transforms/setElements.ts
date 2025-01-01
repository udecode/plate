import type { TEditor, TElement, TNodeProps, Value } from '../interfaces';
import type { SetNodesOptions } from '../interfaces/transforms/setNodes';

export const setElements = (
  editor: TEditor,
  props: Partial<TNodeProps<TElement>>,
  options?: SetNodesOptions<Value>
) => editor.tf.setNodes<TElement>(props, options);
