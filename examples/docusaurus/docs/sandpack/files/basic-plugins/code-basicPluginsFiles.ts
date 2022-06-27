import { createElementFile } from './code-createElement';
import { indexFile } from './code-index';

export const basicPluginsFiles = {
  ...createElementFile,
  ...indexFile,
};
