import { indexFile } from './code-index';
import { plainTextValueFile } from './code-plainTextValue';

export const basicEditorFiles = {
  ...indexFile,
  ...plainTextValueFile,
};
