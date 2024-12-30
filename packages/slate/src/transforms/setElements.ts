import type { TEditor, TElement, TNodeProps, Value } from '../interfaces';

import {
  type SetNodesOptions,
  setNodes,
} from '../interfaces/transforms/setNodes';

export const setElements = (
  editor: TEditor,
  props: Partial<TNodeProps<TElement>>,
  options?: SetNodesOptions<Value>
) => setNodes<TElement>(editor, props, options);
