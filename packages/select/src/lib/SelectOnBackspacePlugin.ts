import {
  type PluginConfig,
  type QueryNodeOptions,
  createTSlatePlugin,
} from '@udecode/plate';

import { withSelectOnBackspace } from './withSelectOnBackspace';

export type SelectOnBackspaceConfig = PluginConfig<
  'selectOnBackspace',
  {
    query?: QueryNodeOptions;
    removeNodeIfEmpty?: boolean;
  }
>;

/** @see {@link withSelectOnBackspace} */
export const SelectOnBackspacePlugin =
  createTSlatePlugin<SelectOnBackspaceConfig>({
    key: 'selectOnBackspace',
    editOnly: true,
    options: {
      removeNodeIfEmpty: false,
    },
  }).overrideEditor(withSelectOnBackspace);
