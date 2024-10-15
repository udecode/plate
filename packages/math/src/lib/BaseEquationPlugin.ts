import {
  type TElement,
  bindFirst,
  createSlatePlugin,
} from '@udecode/plate-common';

import { insertEquation } from './transforms';

import 'katex/dist/katex.min.css';

export interface TEquationElement extends TElement {
  texExpression: string;
}

export const BaseEquationPlugin = createSlatePlugin({
  key: 'equation',
  node: { isElement: true, isVoid: true },
}).extendEditorTransforms(({ editor }) => ({
  insert: {
    equation: bindFirst(insertEquation, editor),
  },
}));
