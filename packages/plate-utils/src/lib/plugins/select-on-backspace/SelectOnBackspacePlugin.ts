import type { QueryNodeOptions } from '@udecode/slate';

import { type PluginConfig, createTSlatePlugin } from '@udecode/plate-core';

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
