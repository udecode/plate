import * as cleanUpListsCommands from './cleanUpListsWithAnnotations.js';
import * as cleanUpParagraphCommands from './cleanUpParagraphWithAnnotations.js';

export const commands = {
  ...cleanUpListsCommands,
  ...cleanUpParagraphCommands,
};

export * from './cleanUpListsWithAnnotations.js';
export * from './cleanUpParagraphWithAnnotations.js';
