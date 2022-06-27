import { deserializeCsvValueFile } from './code-deserializeCsvValue';
import { indexFile } from './code-index';

export const serializingCsvFiles = {
  ...deserializeCsvValueFile,
  ...indexFile,
};
