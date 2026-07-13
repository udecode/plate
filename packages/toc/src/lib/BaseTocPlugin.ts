import {
  type BaseEditor,
  type PluginConfig,
  createBasePlugin,
} from '@platejs/core';
import { KEYS } from '@platejs/utils';

import type { Heading } from './types';

import { insertToc } from './transforms/insertToc';

export type TocConfig = PluginConfig<
  'toc',
  {
    isScroll: boolean;
    topOffset: number;
    queryHeading?: (editor: BaseEditor) => Heading[];
  }
>;

export const BaseTocPlugin = createBasePlugin<TocConfig>({
  key: KEYS.toc,
  node: { isElement: true, isVoid: true },
  options: {
    isScroll: true,
    topOffset: 80,
  },
}).extendTx(({ editor }) => (tx) => ({
  insert: (options?: Parameters<typeof insertToc>[2]) =>
    insertToc(editor, tx, options),
}));
