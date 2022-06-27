import { imagePluginsFile } from './code-imagePlugins';
import { imageValueFile } from './code-imageValue';
import { indexFile } from './code-index';

export const imageFiles = {
  ...imagePluginsFile,
  ...imageValueFile,
  ...indexFile,
};
