import { BaseTogglePlugin } from '@platejs/toggle';

import { ToggleElementStatic } from '@/registry/ui/toggle-node-static';

export const BaseToggleKit = [
  BaseTogglePlugin.withComponent(ToggleElementStatic),
];
