import {
  type PluginConfig,
  type QueryNodeOptions,
  createTPlugin,
} from '@udecode/plate-common';

import { withSelectOnBackspace } from './withSelectOnBackspace';

export type SelectOnBackspaceConfig = PluginConfig<
  'selectOnBackspace',
  {
    query?: QueryNodeOptions;
    removeNodeIfEmpty?: boolean;
  }
>;

/** @see {@link withSelectOnBackspace} */
export const SelectOnBackspacePlugin = createTPlugin<SelectOnBackspaceConfig>({
  key: 'selectOnBackspace',
  options: {
    removeNodeIfEmpty: false,
  },
  withOverrides: withSelectOnBackspace,
});
