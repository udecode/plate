import { type TElement, createSlatePlugin, KEYS } from 'platejs';

import type { CodeDrawingData } from './types';

export interface TCodeDrawingElement extends TElement {
  data?: CodeDrawingData;
}

/** Enables support for code drawing (PlantUml, Graphviz, Flowchart, Mermaid) within a Slate document */
export const BaseCodeDrawingPlugin = createSlatePlugin({
  key: KEYS.codeDrawing,
  node: { isElement: true, isVoid: true },
});
