import {
  type PluginConfig,
  type SlateEditor,
  createTSlatePlugin,
} from '@udecode/plate-common';

import type { Heading } from './types';

export type TocConfig = PluginConfig<
  'toc',
  {
    isScroll: boolean;
    topOffset: number;
    queryHeading?: (editor: SlateEditor) => Heading[];
    scrollContainerSelector?: string | null;
  }
>;

export const BaseTocPlugin = createTSlatePlugin<TocConfig>({
  key: 'toc',
  node: { isElement: true, isVoid: true },
  options: {
    isScroll: true,
    scrollContainerSelector: null,
    topOffset: 80,
  },
});
