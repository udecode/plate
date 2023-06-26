import { highlightHtmlFile } from './code-HighlightHTML';
import { deserializeHtmlValueFile } from './code-deserializeHtmlValue';
import { formatHtmlFile } from './code-formatHTML';

export const serializingHtmlFiles = {
  ...highlightHtmlFile,
  ...deserializeHtmlValueFile,
  ...formatHtmlFile,
};
