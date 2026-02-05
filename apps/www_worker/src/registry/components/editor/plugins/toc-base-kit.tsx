import { BaseTocPlugin } from '@platejs/toc';

import { TocElementStatic } from '@/registry/ui/toc-node-static';

export const BaseTocKit = [BaseTocPlugin.withComponent(TocElementStatic)];
