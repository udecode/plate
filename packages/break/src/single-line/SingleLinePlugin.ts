import { createPlugin } from '@udecode/plate-common';

import { onKeyDownSingleLine } from './onKeyDownSingleLine';
import { withSingleLine } from './withSingleLine';

/** Forces editor to only have one line. */
export const SingleLinePlugin = createPlugin({
  handlers: {
    onKeyDown: onKeyDownSingleLine,
  },
  key: 'singleLine',
  withOverrides: withSingleLine,
});
