import {
  type QueryNodeOptions,
  createPluginFactory,
} from '@udecode/plate-common/server';

import { withSelectOnBackspace } from './withSelectOnBackspace';

export type SelectOnBackspacePlugin = {
  query?: QueryNodeOptions;
  removeNodeIfEmpty?: boolean;
};

export const KEY_SELECT_ON_BACKSPACE = 'selectOnBackspace';

/** @see {@link withSelectOnBackspace} */
export const createSelectOnBackspacePlugin =
  createPluginFactory<SelectOnBackspacePlugin>({
    key: KEY_SELECT_ON_BACKSPACE,
    options: {
      removeNodeIfEmpty: false,
    },
    withOverrides: withSelectOnBackspace,
  });
