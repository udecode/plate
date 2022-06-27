import { deserializeHtmlValueFile } from './code-deserializeHtmlValue';
import { indexFile } from './code-index';

export const serializingHtmlFiles = {
  ...deserializeHtmlValueFile,
  ...indexFile,
};
