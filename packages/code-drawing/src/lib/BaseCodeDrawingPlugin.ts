import { createBasePlugin } from '@platejs/core';
import type {
  Element,
  NodeInsertNodesOptions,
  NodeProps,
} from '@platejs/plite';

import type { CodeDrawingData } from './types';
import { insertCodeDrawing } from './transforms';

export const CODE_DRAWING_KEY = 'code_drawing' as const;

export interface TCodeDrawingElement extends Element {
  data?: CodeDrawingData;
}

/** Enables support for PlantUML, Graphviz, Flowchart, and Mermaid drawings. */
export const BaseCodeDrawingPlugin = createBasePlugin({
  key: CODE_DRAWING_KEY,
  node: { isElement: true, isVoid: true },
}).extendTx(({ editor, type }) => (tx) => ({
  insert: (
    props?: NodeProps<TCodeDrawingElement>,
    options?: NodeInsertNodesOptions<TCodeDrawingElement>
  ) => insertCodeDrawing(editor, tx, type, props, options),
}));
