import { createPluginFactory } from '@udecode/plate-common';

export const ELEMENT_CALLOUT = 'callout';

export type CalloutColor = {
  bgColor: string;
  borderColor: string;
  textColor: string;
};

export const createCalloutPlugin = createPluginFactory({
  isElement: true,
  key: ELEMENT_CALLOUT,
});
