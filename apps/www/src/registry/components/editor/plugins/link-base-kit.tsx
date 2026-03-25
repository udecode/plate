import { BaseLinkPlugin } from '@platejs/link';

import { LinkElementStatic } from '@/registry/ui/link-node-static';

export const BaseLinkKit = [BaseLinkPlugin.withComponent(LinkElementStatic)];
