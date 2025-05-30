import { BaseCalloutPlugin } from '@udecode/plate-callout';

import { CalloutElementStatic } from '@/registry/ui/callout-node-static';

export const BaseCalloutKit = [
  BaseCalloutPlugin.withComponent(CalloutElementStatic),
];
