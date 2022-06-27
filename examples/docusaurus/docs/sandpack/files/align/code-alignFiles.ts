import { alignToolbarButtonsFile } from './code-AlignToolbarButtons';
import { alignPluginFile } from './code-alignPlugin';
import { alignValueFile } from './code-alignValue';
import { indexFile } from './code-index';

export const alignFiles = {
  ...alignToolbarButtonsFile,
  ...alignPluginFile,
  ...alignValueFile,
  ...indexFile,
};
