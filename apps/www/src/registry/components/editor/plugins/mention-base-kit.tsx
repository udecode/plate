import { BaseMentionPlugin } from '@platejs/mention';

import { MentionElementStatic } from '@/registry/ui/mention-node-static';

export const BaseMentionKit = [
  BaseMentionPlugin.withComponent(MentionElementStatic),
];
