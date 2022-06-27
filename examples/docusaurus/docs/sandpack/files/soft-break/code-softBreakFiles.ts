import { indexFile } from './code-index';
import { softBreakPluginFile } from './code-softBreakPlugin';
import { softBreakValueFile } from './code-softBreakValue';

export const softBreakFiles = {
  ...indexFile,
  ...softBreakPluginFile,
  ...softBreakValueFile,
};
