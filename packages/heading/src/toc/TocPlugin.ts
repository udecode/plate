import { type PlateEditor, createPlugin } from '@udecode/plate-common';

import type { Heading } from './types';

export const ELEMENT_TOC = 'toc';

export interface TocPluginOptions {
  queryHeading?: (editor: PlateEditor) => Heading[];
}

export const TocPlugin = createPlugin<TocPluginOptions>({
  isElement: true,
  isVoid: true,
  key: ELEMENT_TOC,
});
