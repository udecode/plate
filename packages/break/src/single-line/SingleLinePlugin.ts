import { createPlugin } from '@udecode/plate-common/server';

import { onKeyDownSingleLine } from './onKeyDownSingleLine';
import { withSingleLine } from './withSingleLine';

export const KEY_SINGLE_LINE = 'singleLine';

/** Forces editor to only have one line. */
export const SingleLinePlugin = createPlugin({
  handlers: {
    onKeyDown: onKeyDownSingleLine,
  },
  key: KEY_SINGLE_LINE,
  withOverrides: withSingleLine,
});
