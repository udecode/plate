import { basicMarkToolbarButtonsFile } from './code-BasicMarkToolbarButtons';
import { basicMarkPluginsFile } from './code-basicMarkPlugins';
import { basicMarksValueFile } from './code-basicMarksValue';
import { indexFile } from './code-index';

export const basicMarksFiles = {
  ...basicMarkToolbarButtonsFile,
  ...basicMarkPluginsFile,
  ...basicMarksValueFile,
  ...indexFile,
};
