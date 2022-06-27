import { editablePropsFile } from './code-editableProps';
import { indexFile } from './code-index';

export const commonFiles = {
  ...editablePropsFile,
  ...indexFile,
};
