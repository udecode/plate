import { indexFile } from './code-index';
import { lineHeightPluginFile } from './code-lineHeightPlugin';
import { lineHeightValueFile } from './code-lineHeightValue';

export const lineHeightFiles = {
  ...indexFile,
  ...lineHeightPluginFile,
  ...lineHeightValueFile,
};
