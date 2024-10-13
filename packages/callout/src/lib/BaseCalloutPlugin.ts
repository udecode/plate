import {
  type TElement,
  bindFirst,
  createSlatePlugin,
} from '@udecode/plate-common';

import { insertCallout } from './transforms';

export interface TCalloutElement extends TElement {
  backgroundColor?: string;
  color?: string;
  icon?: string;
  variant?: 'info' | 'note' | 'tip' | 'warning';
}

export type CalloutColor = {
  bgColor: string;
  borderColor: string;
  textColor: string;
};

export const BaseCalloutPlugin = createSlatePlugin({
  key: 'callout',
  node: { isElement: true },
}).extendTransforms(({ editor }) => ({
  insert: bindFirst(insertCallout, editor),
}));
