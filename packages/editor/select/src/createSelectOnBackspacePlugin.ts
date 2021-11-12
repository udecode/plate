import { QueryNodeOptions } from '@udecode/plate-common';
import { createPlugin } from '@udecode/plate-core';
import { withSelectOnBackspace } from './withSelectOnBackspace';

export type SelectOnBackspacePlugin = {
  query?: QueryNodeOptions;
};

export const KEY_SELECT_ON_BACKSPACE = 'selectOnBackspace';

/**
 * @see {@link withSelectOnBackspace}
 */
export const createSelectOnBackspacePlugin = createPlugin<SelectOnBackspacePlugin>(
  {
    key: KEY_SELECT_ON_BACKSPACE,
    withOverrides: withSelectOnBackspace(),
  }
);
