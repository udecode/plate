import {
  type TElement,
  bindFirst,
  createSlatePlugin,
  KEYS,
} from '@udecode/plate';

import { insertEquation } from './transforms';

import 'katex/dist/katex.min.css';

export interface TEquationElement extends TElement {
  texExpression: string;
}

export const BaseEquationPlugin = createSlatePlugin({
  key: KEYS.equation,
  node: { isElement: true, isVoid: true },
}).extendEditorTransforms(({ editor }) => ({
  insert: {
    equation: bindFirst(insertEquation, editor),
  },
}));
