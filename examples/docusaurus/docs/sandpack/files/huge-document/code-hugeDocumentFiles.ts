import { createHugeDocumentValueFile } from './code-createHugeDocumentValue';
import { indexFile } from './code-index';

export const hugeDocumentFiles = {
  ...createHugeDocumentValueFile,
  ...indexFile,
};
