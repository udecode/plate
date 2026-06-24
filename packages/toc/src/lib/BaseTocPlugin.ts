import {
  type PluginConfig,
  type BasePlateEditor,
  createEditorPlugin,
  KEYS,
} from 'platejs';

import type { Heading } from './types';

export type TocConfig = PluginConfig<
  'toc',
  {
    isScroll: boolean;
    topOffset: number;
    queryHeading?: (editor: BasePlateEditor) => Heading[];
  }
>;

export const BaseTocPlugin = createEditorPlugin<TocConfig>({
  key: KEYS.toc,
  node: { isElement: true, isVoid: true },
  options: {
    isScroll: true,
    topOffset: 80,
  },
  rules: {
    break: {
      default: 'none',
    },
  },
});
