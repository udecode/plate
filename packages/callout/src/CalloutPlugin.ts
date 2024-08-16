import { createPlugin } from '@udecode/plate-common';

export type CalloutColor = {
  bgColor: string;
  borderColor: string;
  textColor: string;
};

export const CalloutPlugin = createPlugin({
  isElement: true,
  key: 'callout',
});
