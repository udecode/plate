import { deserializeDocxValueFile } from './code-deserializeDocxValue';
import { indexFile } from './code-index';

export const serializingDocxFiles = {
  ...deserializeDocxValueFile,
  ...indexFile,
};
