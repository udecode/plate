import { indexFile } from './code-index';
import { singleLineValueFile } from './code-singleLineValue';

export const singleLineFiles = {
  ...indexFile,
  ...singleLineValueFile,
};
