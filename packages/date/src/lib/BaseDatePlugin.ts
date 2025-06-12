import { bindFirst, createSlatePlugin, KEYS } from 'platejs';

import { insertDate } from './transforms';

export const BaseDatePlugin = createSlatePlugin({
  key: KEYS.date,
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
