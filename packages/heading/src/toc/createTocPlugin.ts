import {
  type PlateEditor,
  type Value,
  createPluginFactory,
} from '@udecode/plate-common';

import type { Heading } from './types';

export const ELEMENT_TOC = 'toc';

export interface TocPlugin {
  queryHeading?: <V extends Value = Value>(editor: PlateEditor<V>) => Heading[];
}

export const createTocPlugin = createPluginFactory<TocPlugin>({
  isElement: true,
  isVoid: true,
  key: ELEMENT_TOC,
});
