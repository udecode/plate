import { createPlugin } from '@udecode/plate-common';

export const ELEMENT_CALLOUT = 'callout';

export type CalloutColor = {
  bgColor: string;
  borderColor: string;
  textColor: string;
};

export const CalloutPlugin = createPlugin({
  isElement: true,
  key: ELEMENT_CALLOUT,
});
