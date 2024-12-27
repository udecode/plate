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
  extendEditor: ({ editor, type }) => {
    console.log('🚀 ~ type:', type);
    const { isSelectable } = editor;

    editor.isSelectable = (element) => {
      return (element as TElement).type !== type && isSelectable(element);
    };

    return editor;
  },
  node: { isElement: true, isVoid: true },
}).extendEditorTransforms(({ editor }) => ({
  insert: {
    equation: bindFirst(insertEquation, editor),
  },
}));
