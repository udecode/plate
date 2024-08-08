import type { TEditor, TElement, TNodeProps } from '../interfaces';

import {
  type SetNodesOptions,
  setNodes,
} from '../interfaces/transforms/setNodes';

export const setElements = (
  editor: TEditor,
  props: Partial<TNodeProps<TElement>>,
  options?: SetNodesOptions
) => setNodes<TElement>(editor, props, options);
