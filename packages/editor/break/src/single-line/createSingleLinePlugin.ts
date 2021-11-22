import { createPluginFactory } from '@udecode/plate-core';
import { onKeyDownSingleLine } from './onKeyDownSingleLine';
import { withSingleLine } from './withSingleLine';

export const KEY_SINGLE_LINE = 'singleLine';

/**
 * Forces editor to only have one line.
 */
export const createSingleLinePlugin = createPluginFactory({
  key: KEY_SINGLE_LINE,
  handlers: {
    onKeyDown: onKeyDownSingleLine,
  },
  withOverrides: withSingleLine,
});
