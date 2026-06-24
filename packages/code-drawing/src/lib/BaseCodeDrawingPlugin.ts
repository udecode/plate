import type { Element } from '@platejs/plite';

import { createEditorPlugin } from 'platejs';

import type { CodeDrawingData } from './types';

export const CODE_DRAWING_KEY = 'code_drawing' as const;

export interface CodeDrawingElement extends Element {
  data?: CodeDrawingData;
}

/** Enables support for code drawing (PlantUml, Graphviz, Flowchart, Mermaid) within a Plite document */
export const BaseCodeDrawingPlugin = createEditorPlugin({
  key: CODE_DRAWING_KEY,
  node: { isElement: true, isVoid: true },
});
