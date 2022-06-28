import { alignToolbarButtonsFile } from './code-AlignToolbarButtons';
import { alignPluginFile } from './code-alignPlugin';
import { alignValueFile } from './code-alignValue';

export const alignFiles = {
  ...alignToolbarButtonsFile,
  ...alignPluginFile,
  ...alignValueFile,
};
