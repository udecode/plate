import { editablePropsFile } from './code-editableProps';
import { mapNodeIdFile } from './code-mapNodeId';
import { plateUiFile } from './code-plateUI';

export const commonFiles = {
  ...editablePropsFile,
  ...mapNodeIdFile,
  ...plateUiFile,
};
