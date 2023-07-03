import { QueryNodeOptions, createPluginFactory } from '@udecode/plate-common';

import { withSelectOnBackspace } from './withSelectOnBackspace';

export type SelectOnBackspacePlugin = {
  query?: QueryNodeOptions;
};

export const KEY_SELECT_ON_BACKSPACE = 'selectOnBackspace';

/**
 * @see {@link withSelectOnBackspace}
 */
export const createSelectOnBackspacePlugin =
  createPluginFactory<SelectOnBackspacePlugin>({
    key: KEY_SELECT_ON_BACKSPACE,
    withOverrides: withSelectOnBackspace,
  });
