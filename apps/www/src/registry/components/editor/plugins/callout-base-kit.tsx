import { BaseCalloutPlugin } from '@platejs/callout';

import { CalloutElementStatic } from '@/registry/ui/callout-node-static';

export const BaseCalloutKit = [
  BaseCalloutPlugin.withComponent(CalloutElementStatic),
];
