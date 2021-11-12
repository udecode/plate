import { createPlugin } from '@udecode/plate-core';
import { AutoformatPlugin } from './types';
import { withAutoformat } from './withAutoformat';

export const KEY_AUTOFORMAT = 'autoformat';

/**
 * @see {@link withAutoformat}
 */
export const createAutoformatPlugin = createPlugin<AutoformatPlugin>({
  key: KEY_AUTOFORMAT,
  withOverrides: withAutoformat(),
  rules: [],
});
