import { bindFirst, createSlatePlugin, KEYS } from 'platejs';

import { insertCallout } from './transforms';

export const BaseCalloutPlugin = createSlatePlugin({
  key: KEYS.callout,
  node: {
    isElement: true,
  },
  rules: {
    break: {
      default: 'lineBreak',
      empty: 'reset',
      emptyLineEnd: 'deleteExit',
    },
    delete: {
      start: 'reset',
    },
  },
}).extendEditorTransforms(({ editor }) => ({
  insert: { callout: bindFirst(insertCallout, editor) },
}));
