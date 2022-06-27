import { findReplaceValueFile } from './code-findReplaceValue';
import { indexFile } from './code-index';

export const findReplaceFiles = {
  ...findReplaceValueFile,
  ...indexFile,
};
