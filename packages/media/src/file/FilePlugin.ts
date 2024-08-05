import { createPlugin } from '@udecode/plate-common';

import type { FilePluginOptions } from './types';

export const ELEMENT_FILE = 'file';

export const FilePlugin = createPlugin<'file', FilePluginOptions>({
  isElement: true,
  isVoid: true,
  key: ELEMENT_FILE,
});
