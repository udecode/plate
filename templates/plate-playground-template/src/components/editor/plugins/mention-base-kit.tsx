import { BaseMentionPlugin } from '@platejs/mention';

import { MentionElementStatic } from '@/components/ui/mention-node-static';

export const BaseMentionKit = [
  BaseMentionPlugin.withComponent(MentionElementStatic),
];
