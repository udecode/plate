import { indentToolbarButtonsFile } from './code-IndentToolbarButtons';
import { indentPluginFile } from './code-indentPlugin';
import { indentValueFile } from './code-indentValue';
import { indexFile } from './code-index';

export const indentFiles = {
  ...indentToolbarButtonsFile,
  ...indentPluginFile,
  ...indentValueFile,
  ...indexFile,
};
