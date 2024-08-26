import {
  type TElement,
  bindFirst,
  createSlatePlugin,
} from '@udecode/plate-common';

import { insertDate } from './transforms';
import { withDate } from './withDate';

export interface TDateElement extends TElement {
  date: string;
}

export const DatePlugin = createSlatePlugin({
  extendEditor: withDate,
  handlers: {},
  key: 'date',
  node: {
    isElement: true,
    isInline: true,
    isVoid: true,
  },
}).extendEditorTransforms(({ editor }) => ({
  insert: {
    date: bindFirst(insertDate, editor),
  },
}));
