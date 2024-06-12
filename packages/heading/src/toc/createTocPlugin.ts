import { createPluginFactory } from '@udecode/plate-common';

export const ELEMENT_TOC = 'toc';

export const createTocPlugin = createPluginFactory({
  isElement: true,
  isVoid: true,
  key: ELEMENT_TOC,
});
