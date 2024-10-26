import {
  type TElement,
  bindFirst,
  createSlatePlugin,
} from '@udecode/plate-common';

import { insertCallout } from './transforms';

export interface TCalloutElement extends TElement {
  variant?:
    | (string & {})
    | 'error'
    | 'info'
    | 'note'
    | 'success'
    | 'tip'
    | 'warning';
  backgroundColor?: string;
  icon?: string;
}

export const BaseCalloutPlugin = createSlatePlugin({
  key: 'callout',
  node: { isElement: true },
}).extendEditorTransforms(({ editor }) => ({
  insert: { callout: bindFirst(insertCallout, editor) },
}));
