import { listToolbarButtonsFile } from './code-ListToolbarButtons';
import { createListFile } from './code-createList';
import { listValueFile } from './code-listValue';

export const listFiles = {
  ...listToolbarButtonsFile,
  ...createListFile,
  ...listValueFile,
};
