import { indexFile } from './code-index';
import { placeholderValueFile } from './code-placeholderValue';
import { withStyledPlaceHoldersFile } from './code-withStyledPlaceHolders';

export const placeholderFiles = {
  ...indexFile,
  ...placeholderValueFile,
  ...withStyledPlaceHoldersFile,
};
