import { BaseCalloutPlugin } from '@platejs/callout';

import { CalloutElementStatic } from '@/components/ui/callout-node-static';

export const BaseCalloutKit = [
  BaseCalloutPlugin.withComponent(CalloutElementStatic),
];
