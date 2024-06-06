import { createPluginFactory } from '@udecode/plate-common';

import type { FilePlugin } from './types';

export const ELEMENT_FILE = 'file';

export const createFilePlugin = createPluginFactory<FilePlugin>({
  isElement: true,
  isVoid: true,
  key: ELEMENT_FILE,
});
