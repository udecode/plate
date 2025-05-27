import { type TElement, bindFirst, createSlatePlugin } from '@udecode/plate';

import { insertDate } from './transforms';

export interface TDateElement extends TElement {
  date: string;
}

export const BaseDatePlugin = createSlatePlugin({
  key: 'date',
  node: {
    isElement: true,
    isInline: true,
    isSelectable: false,
    isVoid: true,
  },
}).extendEditorTransforms(({ editor }) => ({
  insert: {
    date: bindFirst(insertDate, editor),
  },
}));
