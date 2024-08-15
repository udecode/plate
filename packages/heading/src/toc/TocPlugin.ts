import {
  type PlateEditor,
  type PluginConfig,
  createTPlugin,
} from '@udecode/plate-common';

import type { Heading } from './types';

export type TocConfig = PluginConfig<
  'toc',
  {
    queryHeading?: (editor: PlateEditor) => Heading[];
  }
>;

export const TocPlugin = createTPlugin<TocConfig>({
  isElement: true,
  isVoid: true,
  key: 'toc',
});
