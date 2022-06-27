import { createMultiEditorsValueFile } from './code-createMultiEditorsValue';
import { indexFile } from './code-index';

export const multipleEditorsFiles = {
  ...createMultiEditorsValueFile,
  ...indexFile,
};
