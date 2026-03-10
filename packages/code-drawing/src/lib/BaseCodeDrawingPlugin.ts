import { type TElement, createSlatePlugin } from 'platejs';

import type { CodeDrawingData } from './types';

export const CODE_DRAWING_KEY = 'code_drawing' as const;

export interface TCodeDrawingElement extends TElement {
  data?: CodeDrawingData;
}

/** Enables support for code drawing (PlantUml, Graphviz, Flowchart, Mermaid) within a Slate document */
export const BaseCodeDrawingPlugin = createSlatePlugin({
  key: CODE_DRAWING_KEY,
  node: { isElement: true, isVoid: true },
});
