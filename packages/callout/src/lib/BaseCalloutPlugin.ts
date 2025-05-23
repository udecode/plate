import {
  type TElement,
  bindFirst,
  createSlatePlugin,
  KEYS,
} from '@udecode/plate';

import { insertCallout } from './transforms';

export interface TCalloutElement extends TElement {
  backgroundColor?: string;
  icon?: string;
  variant?:
    | (string & {})
    | 'error'
    | 'info'
    | 'note'
    | 'success'
    | 'tip'
    | 'warning';
}

export const BaseCalloutPlugin = createSlatePlugin({
  key: KEYS.callout,
  node: { isElement: true },
}).extendEditorTransforms(({ editor }) => ({
  insert: { callout: bindFirst(insertCallout, editor) },
}));
