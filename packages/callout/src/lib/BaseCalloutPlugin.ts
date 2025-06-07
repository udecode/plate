import { bindFirst, createSlatePlugin, KEYS } from '@udecode/plate';

import { insertCallout } from './transforms';

export const BaseCalloutPlugin = createSlatePlugin({
  key: KEYS.callout,
  node: {
    breakMode: {
      default: 'lineBreak',
      empty: 'reset',
      emptyLineEnd: 'deleteExit',
    },
    deleteMode: {
      start: 'reset',
    },
    isElement: true,
  },
}).extendEditorTransforms(({ editor }) => ({
  insert: { callout: bindFirst(insertCallout, editor) },
}));
