import { AnyObject, createPluginFactory } from '@udecode/plate-common';

import { onKeyDownSingleLine } from './onKeyDownSingleLine';
import { withSingleLine } from './withSingleLine';

export const KEY_SINGLE_LINE = 'singleLine';

/**
 * Forces editor to only have one line.
 */
export const createSingleLinePlugin = createPluginFactory<AnyObject>({
  key: KEY_SINGLE_LINE,
  handlers: {
    onKeyDown: onKeyDownSingleLine,
  },
  withOverrides: withSingleLine,
});
