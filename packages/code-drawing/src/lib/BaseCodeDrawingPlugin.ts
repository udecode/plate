import type { Element } from '@platejs/slate';

import { createSlatePlugin } from 'platejs';

import type { CodeDrawingData } from './types';

export const CODE_DRAWING_KEY = 'code_drawing' as const;

export interface CodeDrawingElement extends Element {
  data?: CodeDrawingData;
}

/** Enables support for code drawing (PlantUml, Graphviz, Flowchart, Mermaid) within a Slate document */
export const BaseCodeDrawingPlugin = createSlatePlugin({
  key: CODE_DRAWING_KEY,
  node: { isElement: true, isVoid: true },
});
