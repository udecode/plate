import { highlightToolbarButtonFile } from './code-HighlightToolbarButton';
import { highlightValueFile } from './code-highlightValue';
import { indexFile } from './code-index';

export const highlightFiles = {
  ...highlightToolbarButtonFile,
  ...highlightValueFile,
  ...indexFile,
};
