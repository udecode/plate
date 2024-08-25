import { type TElement, createSlatePlugin } from '@udecode/plate-common';

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

export const CalloutPlugin = createSlatePlugin({
  key: 'callout',
  node: { isElement: true },
});
