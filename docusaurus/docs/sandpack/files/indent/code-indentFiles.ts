import { indentToolbarButtonsFile } from './code-IndentToolbarButtons';
import { indentPluginFile } from './code-indentPlugin';
import { indentValueFile } from './code-indentValue';

export const indentFiles = {
  ...indentToolbarButtonsFile,
  ...indentPluginFile,
  ...indentValueFile,
};
