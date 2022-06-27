import { listToolbarButtonsFile } from './code-ListToolbarButtons';
import { createListFile } from './code-createList';
import { indexFile } from './code-index';
import { listValueFile } from './code-listValue';

export const listFiles = {
  ...listToolbarButtonsFile,
  ...createListFile,
  ...indexFile,
  ...listValueFile,
};
