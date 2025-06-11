import {
  type PluginConfig,
  type SlateEditor,
  createTSlatePlugin,
  KEYS,
} from 'platejs';

import type { Heading } from './types';

export type TocConfig = PluginConfig<
  'toc',
  {
    isScroll: boolean;
    topOffset: number;
    queryHeading?: (editor: SlateEditor) => Heading[];
  }
>;

export const BaseTocPlugin = createTSlatePlugin<TocConfig>({
  key: KEYS.toc,
  node: { isElement: true, isVoid: true },
  options: {
    isScroll: true,
    topOffset: 80,
  },
});
