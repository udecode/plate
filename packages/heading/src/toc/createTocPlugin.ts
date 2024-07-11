import {
  type PlateEditor,
  type Value,
  createPluginFactory,
} from '@udecode/plate-common';

import type { Heading } from './types';

import { getHeadingList } from '../utils';

export const ELEMENT_TOC = 'toc';

export interface TocPlugin<V extends Value = Value> {
  queryHeading: (editor: PlateEditor<V>) => Heading[];
}

export const createTocPlugin = createPluginFactory<TocPlugin>({
  isElement: true,
  isVoid: true,
  key: ELEMENT_TOC,
  options: {
    queryHeading: getHeadingList,
  },
});
