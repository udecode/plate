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

export const BaseDatePlugin = createSlatePlugin({
  key: 'date',
  extendEditor: withDate,
  node: {
    isElement: true,
    isInline: true,
    isVoid: true,
  },
  handlers: {},
}).extendEditorTransforms(({ editor }) => ({
  insert: {
    date: bindFirst(insertDate, editor),
  },
}));
