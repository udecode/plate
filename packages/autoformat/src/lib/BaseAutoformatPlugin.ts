import { type PluginConfig, createTSlatePlugin, KEYS } from '@udecode/plate';

import type { AutoformatRule } from './types';

import { withAutoformat } from './withAutoformat';

export type AutoformatConfig = PluginConfig<
  'autoformat',
  {
    enableUndoOnDelete?: boolean;
    /** A list of triggering rules. */
    rules?: AutoformatRule[];
  }
>;

/** @see {@link withAutoformat} */
export const BaseAutoformatPlugin = createTSlatePlugin<AutoformatConfig>({
  key: KEYS.autoformat,
  editOnly: true,
  options: {
    rules: [],
  },
}).overrideEditor(withAutoformat);
