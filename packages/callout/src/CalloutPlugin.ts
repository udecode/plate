import { createSlatePlugin } from '@udecode/plate-common';

export type CalloutColor = {
  bgColor: string;
  borderColor: string;
  textColor: string;
};

export const CalloutPlugin = createSlatePlugin({
  isElement: true,
  key: 'callout',
});
