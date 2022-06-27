import { deserializeMdValueFile } from './code-deserializeMdValue';
import { indexFile } from './code-index';

export const serializingMdFiles = {
  ...deserializeMdValueFile,
  ...indexFile,
};
