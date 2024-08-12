import {
  type QueryNodeOptions,
  createPlugin,
} from '@udecode/plate-common';

import { withSelectOnBackspace } from './withSelectOnBackspace';

export type SelectOnBackspacePluginOptions = {
  query?: QueryNodeOptions;
  removeNodeIfEmpty?: boolean;
};

export const KEY_SELECT_ON_BACKSPACE = 'selectOnBackspace';

/** @see {@link withSelectOnBackspace} */
export const SelectOnBackspacePlugin = createPlugin<
  'selectOnBackspace',
  SelectOnBackspacePluginOptions
>({
  key: KEY_SELECT_ON_BACKSPACE,
  options: {
    removeNodeIfEmpty: false,
  },
  withOverrides: withSelectOnBackspace,
});
