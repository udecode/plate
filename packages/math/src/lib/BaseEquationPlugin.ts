import { type TElement, createSlatePlugin } from '@udecode/plate-common';

import 'katex/dist/katex.min.css';

export interface TEquationElement extends TElement {
  texExpression: string;
}

export const BaseEquationPlugin = createSlatePlugin({
  key: 'equation',
  node: { isElement: true, isVoid: true },
});
