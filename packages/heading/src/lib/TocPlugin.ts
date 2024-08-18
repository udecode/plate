import {
  type PluginConfig,
  type SlateEditor,
  createTSlatePlugin,
} from '@udecode/plate-common';

import type { Heading } from './types';

export type TocConfig = PluginConfig<
  'toc',
  {
    queryHeading?: (editor: SlateEditor) => Heading[];
  }
>;

export const TocPlugin = createTSlatePlugin<TocConfig>({
  isElement: true,
  isVoid: true,
  key: 'toc',
});
