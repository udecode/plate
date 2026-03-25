import { BaseCalloutPlugin } from '@platejs/callout';

import { CalloutElementStatic } from '../../../ui/callout-node-static';

export const BaseCalloutKit = [
  BaseCalloutPlugin.withComponent(CalloutElementStatic),
];
