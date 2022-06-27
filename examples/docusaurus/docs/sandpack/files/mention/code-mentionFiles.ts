import { indexFile } from './code-index';
import { mentionValueFile } from './code-mentionValue';
import { mentionablesFile } from './code-mentionables';

export const mentionFiles = {
  ...indexFile,
  ...mentionValueFile,
  ...mentionablesFile,
};
