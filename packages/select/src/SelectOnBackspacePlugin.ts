import {
  type QueryNodeOptions,
  createPlugin,
} from '@udecode/plate-common';

import { withSelectOnBackspace } from './withSelectOnBackspace';

export type SelectOnBackspacePluginOptions = {
  query?: QueryNodeOptions;
  removeNodeIfEmpty?: boolean;
};

/** @see {@link withSelectOnBackspace} */
export const SelectOnBackspacePlugin = createPlugin<
  'selectOnBackspace',
  SelectOnBackspacePluginOptions
>({
  key: 'selectOnBackspace',
  options: {
    removeNodeIfEmpty: false,
  },
  withOverrides: withSelectOnBackspace,
});
